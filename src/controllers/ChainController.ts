import { createSign, createVerify } from 'crypto';
import { Block } from '../models/Block.js';
import { Transaction, TransactionType } from '../models/Transaction.js';
import { MempoolController } from './MempoolController.js';
import cliProgress from 'cli-progress';

export interface IMiningResult {
	solution: number;
	attempts: number;
	hash: string;
}

export interface IBalanceHistory {
	address: string;
	balance: number;
	timestamp: number;
	blockHeight: number;
}

export class ChainController {
	private static _instance: ChainController;
	private readonly chain: Block[];
	private readonly mempool: MempoolController;
	private readonly balances: Map<string, number>;
	private readonly miningReward: number = 50;
	private readonly maxTransactionsPerBlock: number = 10;
	private difficulty: number = 4;

	private constructor() {
		this.chain = [];
		this.mempool = new MempoolController();
		this.balances = new Map();
		this.createGenesisBlock();
	}

	public static getInstance(): ChainController {
		if (!ChainController._instance) {
			ChainController._instance = new ChainController();
		}
		return ChainController._instance;
	}

	/**
	 * Create the genesis block
	 */
	private createGenesisBlock(): void {
		const genesisTransaction = Transaction.createGenesis();
		const genesisBlock = new Block('', [genesisTransaction], 'GENESIS');
		this.chain.push(genesisBlock);
		this.updateBalance('satoshi', 100);
	}

	/**
	 * Get the blockchain
	 */
	public getChain(): ReadonlyArray<Block> {
		return this.chain;
	}

	/**
	 * Get last block in chain
	 */
	public getLastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}

	/**
	 * Get balance for an address
	 */
	public getBalance(address: string): number {
		return this.balances.get(address) ?? 0;
	}

	/**
	 * Get all balances
	 */
	public getAllBalances(): Map<string, number> {
		return new Map(this.balances);
	}

	/**
	 * Update balance for an address
	 */
	private updateBalance(address: string, amount: number): void {
		const currentBalance = this.getBalance(address);
		this.balances.set(address, currentBalance + amount);
	}

	/**
	 * Mine a block with proof of work
	 */
	public mine(block: Block, showProgress: boolean = true): IMiningResult {
		let solution = 1;
		let attempts = 0;
		const target = '0'.repeat(this.difficulty);

		// Create progress bar
		const progressBar = showProgress ? new cliProgress.SingleBar({
			format: '⛏️  Mining |{bar}| {percentage}% | Attempts: {value}',
			barCompleteChar: '\u2588',
			barIncompleteChar: '\u2591',
			hideCursor: true
		}) : null;

		if (progressBar) {
			progressBar.start(100, 0);
		}

		const updateInterval = 10000; // Update every 10k attempts
		let lastUpdate = 0;

		while (true) {
			block.nonce = block.nonce + solution;
			const hash = block.calculateHash();
			attempts++;

			// Update progress bar
			if (progressBar && attempts - lastUpdate >= updateInterval) {
				progressBar.update(Math.min(99, (attempts / 1000000) * 100));
				lastUpdate = attempts;
			}

			if (hash.substring(0, this.difficulty) === target) {
				if (progressBar) {
					progressBar.update(100);
					progressBar.stop();
				}
				console.log(`✓ Block mined! Solution: ${solution} | Attempts: ${attempts}`);
				block.setHash(hash);
				return { solution, attempts, hash };
			}

			solution += 1;
		}
	}

	/**
	 * Add transaction to mempool
	 */
	public addTransactionToMempool(transaction: Transaction): boolean {
		// Validate transaction
		const validation = this.validateTransaction(transaction);
		if (!validation.valid) {
			console.log(`Transaction rejected: ${validation.reason}`);
			return false;
		}

		return this.mempool.addTransaction(transaction);
	}

	/**
	 * Validate a transaction
	 */
	private validateTransaction(transaction: Transaction): { valid: boolean; reason?: string } {
		// Skip validation for reward and genesis transactions
		if (transaction.type === TransactionType.REWARD || transaction.type === TransactionType.GENESIS) {
			return { valid: true };
		}

		const senderBalance = this.getBalance(transaction.payer);
		const totalCost = transaction.getTotalCost();

		if (senderBalance < totalCost) {
			return {
				valid: false,
				reason: `Insufficient balance. Has ${senderBalance}, needs ${totalCost}`
			};
		}

		if (transaction.amount <= 0) {
			return { valid: false, reason: 'Transaction amount must be positive' };
		}

		if (transaction.fee < 0) {
			return { valid: false, reason: 'Transaction fee cannot be negative' };
		}

		return { valid: true };
	}

	/**
	 * Mine a new block with pending transactions
	 * If no pending transactions, mines a block with only the coinbase reward
	 */
	public mineBlock(minerAddress: string, showProgress: boolean = true): Block {
		const pendingCount = this.mempool.getPendingCount();
		
		// Get transactions from mempool (or empty array if none)
		const transactions = pendingCount > 0 
			? this.mempool.getTransactionsForBlock(this.maxTransactionsPerBlock)
			: [];
		
		// Calculate total fees
		const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
		
		// Add mining reward transaction (coinbase)
		const rewardTransaction = Transaction.createReward(minerAddress, this.miningReward + totalFees);
		transactions.push(rewardTransaction);

		// Create new block
		const newBlock = new Block(
			this.getLastBlock().hash,
			transactions,
			minerAddress
		);

		// Mine the block
		const txLabel = pendingCount > 0 ? `${pendingCount} transaction(s)` : 'coinbase only';
		console.log(`\n⛏️  Mining block with ${txLabel}...`);
		this.mine(newBlock, showProgress);

		// Add block to chain
		this.chain.push(newBlock);

		// Update balances
		this.processBlockTransactions(newBlock);

		console.log(`✓ Block #${this.getChainLength() - 1} added to chain`);
		console.log(`  Reward: ${this.miningReward} + ${totalFees} fees = ${this.miningReward + totalFees} coins\n`);
		return newBlock;
	}

	/**
	 * Process all transactions in a block and update balances
	 */
	private processBlockTransactions(block: Block): void {
		for (const transaction of block.transactions) {
			if (transaction.type !== TransactionType.REWARD && transaction.type !== TransactionType.GENESIS) {
				// Deduct amount + fee from sender
				this.updateBalance(transaction.payer, -(transaction.amount + transaction.fee));
				// Add amount to receiver
				this.updateBalance(transaction.payee, transaction.amount);
			} else {
				// Add reward to miner
				this.updateBalance(transaction.payee, transaction.amount);
			}
		}
	}

	/**
	 * Create and sign a transaction
	 */
	public createTransaction(
		amount: number,
		payerPublicKey: string,
		payerPrivateKey: string,
		payeePublicKey: string,
		fee: number = 1
	): Transaction | null {
		const transaction = new Transaction(amount, payerPublicKey, payeePublicKey, fee);

		// Sign transaction
		const sign = createSign('SHA256');
		sign.update(transaction.toString()).end();
		const signature = sign.sign(payerPrivateKey);
		transaction.setSignature(signature.toString('hex'));

		// Verify signature
		const verify = createVerify('SHA256');
		verify.update(transaction.toString());
		const isValid = verify.verify(payerPublicKey, Buffer.from(transaction.signature!, 'hex'));

		if (!isValid) {
			console.log('Invalid transaction signature');
			return null;
		}

		return transaction;
	}

	/**
	 * Get balance history for an address
	 */
	public getBalanceHistory(address: string): IBalanceHistory[] {
		const history: IBalanceHistory[] = [];
		let balance = 0;

		for (let i = 0; i < this.chain.length; i++) {
			const block = this.chain[i];
			
			for (const transaction of block.transactions) {
				if (transaction.payer === address) {
					balance -= transaction.getTotalCost();
				}
				if (transaction.payee === address) {
					balance += transaction.amount;
				}
			}

			history.push({
				address,
				balance,
				timestamp: block.ts,
				blockHeight: i
			});
		}

		return history;
	}

	/**
	 * Get chain length
	 */
	public getChainLength(): number {
		return this.chain.length;
	}

	/**
	 * Get pending transaction count
	 */
	public getPendingTransactionCount(): number {
		return this.mempool.getPendingCount();
	}

	/**
	 * Validate entire blockchain
	 */
	public isChainValid(): boolean {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			// Check hash link
			if (currentBlock.prevHash !== previousBlock.hash) {
				return false;
			}

			// Verify hash meets difficulty
			const target = '0'.repeat(this.difficulty);
			if (!currentBlock.hash.startsWith(target)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Get mining difficulty
	 */
	public getDifficulty(): number {
		return this.difficulty;
	}

	/**
	 * Set mining difficulty
	 */
	public setDifficulty(difficulty: number): void {
		this.difficulty = Math.max(1, Math.min(8, difficulty));
	}

	/**
	 * Get mempool instance
	 */
	public getMempool(): MempoolController {
		return this.mempool;
	}
}
