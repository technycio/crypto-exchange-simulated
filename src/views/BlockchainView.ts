import { Block } from '../models/Block.js';
import { ChainController, IBalanceHistory } from '../controllers/ChainController.js';
import { TransactionType } from '../models/Transaction.js';

/**
 * View layer for displaying blockchain data
 */
export class BlockchainView {
	private readonly chainController: ChainController;

	constructor(chainController: ChainController) {
		this.chainController = chainController;
	}

	/**
	 * Display full blockchain as JSON
	 */
	public displayChain(): void {
		const chain = this.chainController.getChain();
		console.log('\n========== BLOCKCHAIN ==========');
		console.log(`Total Blocks: ${chain.length}`);
		console.log(`Chain Valid: ${this.chainController.isChainValid()}`);
		console.log('================================\n');
		console.log(JSON.stringify(chain, null, 2));
	}

	/**
	 * Display a single block
	 */
	public displayBlock(block: Block, index: number): void {
		console.log(`\n╔═══════════════ Block ${index} ═══════════════╗`);
		console.log(`║ Hash: ${block.hash.substring(0, 32)}...`);
		console.log(`║ Previous: ${block.prevHash.substring(0, 32)}...`);
		console.log(`║ Miner: ${block.minerAddress.substring(0, 20)}...`);
		console.log(`║ Nonce: ${block.nonce}`);
		console.log(`║ Timestamp: ${new Date(block.ts).toISOString()}`);
		console.log(`║ Transactions: ${block.getTransactionCount()}`);
		console.log(`║ Total Fees: ${block.getTotalFees()}`);
		console.log(`╚════════════════════════════════════════╝`);
		
		block.transactions.forEach((tx, i) => {
			this.displayTransactionInBlock(tx, i);
		});
	}

	/**
	 * Display transaction within a block
	 */
	private displayTransactionInBlock(tx: any, index: number): void {
		const typeIcon = tx.type === TransactionType.REWARD ? '🎁' : 
		                 tx.type === TransactionType.GENESIS ? '⭐' : '💸';
		
		console.log(`  ${typeIcon} Transaction ${index + 1}:`);
		console.log(`     From: ${tx.payer.substring(0, 25)}...`);
		console.log(`     To: ${tx.payee.substring(0, 25)}...`);
		console.log(`     Amount: ${tx.amount} | Fee: ${tx.fee}`);
	}

	/**
	 * Display transaction summary
	 */
	public displayTransaction(
		from: string,
		to: string,
		amount: number,
		fee: number,
		success: boolean
	): void {
		const status = success ? '✓ Success' : '✗ Failed';
		const statusIcon = success ? '✓' : '✗';
		
		console.log(`\n${statusIcon} ─────────── Transaction ───────────`);
		console.log(`  From: ${from.substring(0, 20)}...`);
		console.log(`  To: ${to.substring(0, 20)}...`);
		console.log(`  Amount: ${amount}`);
		console.log(`  Fee: ${fee}`);
		console.log(`  Status: ${status}`);
		console.log(`─────────────────────────────────────\n`);
	}

	/**
	 * Display blockchain summary with ASCII art
	 */
	public displaySummary(): void {
		const chain = this.chainController.getChain();
		
		console.log('\n╔════════════════════════════════════════════╗');
		console.log('║         BLOCKCHAIN SUMMARY                 ║');
		console.log('╠════════════════════════════════════════════╣');
		console.log(`║  Total Blocks: ${String(this.chainController.getChainLength()).padEnd(28)}║`);
		console.log(`║  Chain Valid: ${String(this.chainController.isChainValid()).padEnd(29)}║`);
		console.log(`║  Pending TXs: ${String(this.chainController.getPendingTransactionCount()).padEnd(29)}║`);
		console.log(`║  Difficulty: ${String(this.chainController.getDifficulty()).padEnd(30)}║`);
		console.log('╚════════════════════════════════════════════╝\n');

		// Display recent blocks
		const recentBlocks = chain.slice(-5);
		console.log('Recent Blocks:\n');
		
		recentBlocks.forEach((block, i) => {
			const actualIndex = chain.length - recentBlocks.length + i;
			if (actualIndex > 0) {
				const txCount = block.getTransactionCount();
				const fees = block.getTotalFees();
				console.log(`  [${actualIndex}] ${block.hash.substring(0, 16)}... | TXs: ${txCount} | Fees: ${fees}`);
			}
		});
		console.log('');
	}

	/**
	 * Display ASCII blockchain visualization
	 */
	public displayASCIIChain(): void {
		const chain = this.chainController.getChain();
		console.log('\n🔗 ═══════════ BLOCKCHAIN VISUALIZATION ═══════════\n');

		for (let i = 0; i < Math.min(chain.length, 10); i++) {
			const block = chain[i];
			const blockNum = String(i).padStart(2, '0');
			const txCount = block.getTransactionCount();
			const hashPreview = block.hash.substring(0, 8);

			console.log(`  ┌─────────────────────┐`);
			console.log(`  │  Block #${blockNum}         │`);
			console.log(`  │  Hash: ${hashPreview}... │`);
			console.log(`  │  TXs: ${String(txCount).padEnd(13)}│`);
			console.log(`  └─────────────────────┘`);
			
			if (i < Math.min(chain.length, 10) - 1) {
				console.log(`           ⬇`);
			}
		}

		if (chain.length > 10) {
			console.log(`\n  ... and ${chain.length - 10} more blocks\n`);
		}
		
		console.log('');
	}

	/**
	 * Display all wallet balances
	 */
	public displayBalances(): void {
		const balances = this.chainController.getAllBalances();
		
		console.log('\n╔═════════════════ WALLET BALANCES ═════════════════╗');
		
		if (balances.size === 0) {
			console.log('║  No wallets with balances                        ║');
		} else {
			balances.forEach((balance, address) => {
				const shortAddr = address.substring(0, 15);
				const balanceStr = String(balance).padStart(10);
				console.log(`║  ${shortAddr}... : ${balanceStr} coins          ║`);
			});
		}
		
		console.log('╚═══════════════════════════════════════════════════╝\n');
	}

	/**
	 * Display balance history for an address
	 */
	public displayBalanceHistory(address: string): void {
		const history = this.chainController.getBalanceHistory(address);
		const shortAddr = address.substring(0, 20);
		
		console.log(`\n╔═══ Balance History: ${shortAddr}... ═══╗\n`);
		
		history.forEach((entry: IBalanceHistory) => {
			const date = new Date(entry.timestamp).toLocaleString();
			console.log(`  Block ${String(entry.blockHeight).padStart(3)}: ${String(entry.balance).padStart(10)} coins  (${date})`);
		});
		
		console.log('\n╚════════════════════════════════════════════════╝\n');
	}

	/**
	 * Display pending transactions in mempool
	 */
	public displayMempool(): void {
		const mempool = this.chainController.getMempool();
		const pending = mempool.getAllPending();
		
		console.log('\n╔═════════════ TRANSACTION MEMPOOL ═════════════╗');
		console.log(`║  Pending Transactions: ${String(pending.length).padEnd(24)}║`);
		console.log('╠═══════════════════════════════════════════════╣');
		
		if (pending.length === 0) {
			console.log('║  No pending transactions                      ║');
		} else {
			pending.slice(0, 10).forEach((pt, i) => {
				const tx = pt.transaction;
				console.log(`║  ${i + 1}. Amount: ${String(tx.amount).padEnd(6)} Fee: ${String(tx.fee).padEnd(6)} Priority: ${String(Math.round(pt.priority)).padEnd(8)}║`);
			});
			
			if (pending.length > 10) {
				console.log(`║  ... and ${pending.length - 10} more transactions${' '.repeat(18)}║`);
			}
		}
		
		console.log('╚═══════════════════════════════════════════════╝\n');
	}

	/**
	 * Display network statistics
	 */
	public displayStats(): void {
		const chain = this.chainController.getChain();
		const balances = this.chainController.getAllBalances();
		
		let totalTransactions = 0;
		let totalFees = 0;
		
		chain.forEach(block => {
			totalTransactions += block.getTransactionCount();
			totalFees += block.getTotalFees();
		});

		console.log('\n╔════════════════ NETWORK STATISTICS ════════════════╗');
		console.log(`║  Total Blocks: ${String(chain.length).padEnd(35)}║`);
		console.log(`║  Total Transactions: ${String(totalTransactions).padEnd(29)}║`);
		console.log(`║  Total Fees Collected: ${String(totalFees).padEnd(26)}║`);
		console.log(`║  Active Wallets: ${String(balances.size).padEnd(32)}║`);
		console.log(`║  Chain Valid: ${String(this.chainController.isChainValid()).padEnd(35)}║`);
		console.log(`║  Difficulty: ${String(this.chainController.getDifficulty()).padEnd(36)}║`);
		console.log(`║  Pending TXs: ${String(this.chainController.getPendingTransactionCount()).padEnd(35)}║`);
		console.log('╚════════════════════════════════════════════════════╝\n');
	}
}
