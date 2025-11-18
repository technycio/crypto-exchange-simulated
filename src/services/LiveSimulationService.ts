import { ChainController } from '../controllers/ChainController.js';
import { WalletManager } from '../models/WalletManager.js';
import { Wallet } from '../models/Wallet.js';

export enum SimulationSpeed {
	SLOW = 'SLOW',
	MEDIUM = 'MEDIUM',
	FAST = 'FAST'
}

export interface ISimulationStats {
	autoTransactions: number;
	autoMinedBlocks: number;
	totalMiningTime: number;
	averageBlockTime: number;
	networkHashRate: number;
}

export interface ISimulationEvent {
	type: 'TRANSACTION' | 'MINING_START' | 'MINING_COMPLETE' | 'ERROR';
	timestamp: number;
	data: any;
}

/**
 * Service for running live blockchain simulation with automated transactions and mining
 */
export class LiveSimulationService {
	private readonly chainController: ChainController;
	private readonly walletManager: WalletManager;
	private readonly botWallets: Map<string, Wallet>;
	
	private transactionInterval?: NodeJS.Timeout;
	private miningCheckInterval?: NodeJS.Timeout;
	private isRunning: boolean = false;
	
	// Simulation stats
	private stats: ISimulationStats = {
		autoTransactions: 0,
		autoMinedBlocks: 0,
		totalMiningTime: 0,
		averageBlockTime: 0,
		networkHashRate: 0
	};
	
	// Event log for live display
	private events: ISimulationEvent[] = [];
	private readonly maxEvents: number = 50;
	
	// Speed settings (in milliseconds)
	private txFrequency: number = 2000;
	private miningThreshold: number = 8;
	private currentMinerIndex: number = 0;
	private isMining: boolean = false;
	
	// Bot wallet names
	private readonly botNames: string[] = [
		'Alice_Bot', 'Bob_Bot', 'Charlie_Bot', 'Diana_Bot', 'Eve_Bot',
		'Frank_Bot', 'Grace_Bot', 'Hank_Bot', 'Ivy_Bot', 'Jack_Bot',
		'Satoshi_Sim', 'Vitalik_Sim', 'Nakamoto_AI', 'Miner_Alpha',
		'Miner_Beta', 'Trader_X', 'Trader_Y', 'Trader_Z', 'Whale_1', 'Whale_2'
	];

	constructor(chainController: ChainController, walletManager: WalletManager) {
		this.chainController = chainController;
		this.walletManager = walletManager;
		this.botWallets = new Map();
	}

	/**
	 * Initialize bot wallets for simulation
	 */
	public initializeBotWallets(count: number = 10): void {
		const namesToUse = this.botNames.slice(0, Math.min(count, this.botNames.length));
		
		for (const name of namesToUse) {
			if (!this.walletManager.hasWallet(name)) {
				const wallet = this.walletManager.createWallet(name);
				this.botWallets.set(name, wallet);
			} else {
				// Wallet already exists, just add to bot wallets
				const wallet = this.walletManager.getWallet(name);
				if (wallet) {
					this.botWallets.set(name, wallet);
				}
			}
		}
		
		this.addEvent({
			type: 'TRANSACTION',
			timestamp: Date.now(),
			data: { message: `🤖 Initialized ${this.botWallets.size} bot wallets` }
		});
	}

	/**
	 * Start the simulation
	 */
	public start(speed: SimulationSpeed = SimulationSpeed.MEDIUM): void {
		if (this.isRunning) {
			return;
		}
		
		// Set speed parameters
		switch (speed) {
			case SimulationSpeed.SLOW:
				this.txFrequency = 5000; // 5 seconds
				this.miningThreshold = 3; // Lower threshold for slower transaction generation
				break;
			case SimulationSpeed.MEDIUM:
				this.txFrequency = 2000; // 2 seconds
				this.miningThreshold = 5;
				break;
			case SimulationSpeed.FAST:
				this.txFrequency = 800; // 0.8 seconds
				this.miningThreshold = 8;
				break;
		}
		
		this.isRunning = true;
		
		// Ensure bot wallets have some initial funds
		this.seedBotWallets();
		
		// Start transaction generation
		this.transactionInterval = setInterval(() => {
			if (!this.isMining) {
				this.generateRandomTransaction();
			}
		}, this.txFrequency);
		
		// Check for mining opportunities
		this.miningCheckInterval = setInterval(() => {
			this.checkAndMine();
		}, 1000);
		
		this.addEvent({
			type: 'TRANSACTION',
			timestamp: Date.now(),
			data: { message: `▶️  Simulation started [${speed} mode]` }
		});
	}

	/**
	 * Stop the simulation
	 */
	public stop(): void {
		if (!this.isRunning) {
			return;
		}
		
		if (this.transactionInterval) {
			clearInterval(this.transactionInterval);
		}
		
		if (this.miningCheckInterval) {
			clearInterval(this.miningCheckInterval);
		}
		
		this.isRunning = false;
		
		this.addEvent({
			type: 'TRANSACTION',
			timestamp: Date.now(),
			data: { message: '⏸️  Simulation stopped' }
		});
	}

	/**
	 * Seed bot wallets with initial funds
	 */
	private seedBotWallets(): void {
		const satoshiWallet = this.walletManager.getWallet('satoshi');
		if (!satoshiWallet) {
			this.addEvent({
				type: 'ERROR',
				timestamp: Date.now(),
				data: { message: `⚠️  Satoshi wallet not found - cannot seed bots` }
			});
			return;
		}
		
		const satoshiBalance = this.chainController.getBalance(satoshiWallet.getPublicKey());
		
		// If satoshi has funds, distribute some to bots
		if (satoshiBalance > 50) {
			const botArray = Array.from(this.botWallets.entries());
			const amountPerBot = Math.floor(satoshiBalance / (botArray.length + 2));
			
			// Only seed if we have enough
			if (amountPerBot >= 10) {
				// Create transactions to send funds to each bot
				for (const [botName, botWallet] of botArray) {
					const transaction = this.chainController.createTransaction(
						amountPerBot,
						satoshiWallet.getPublicKey(),
						satoshiWallet.getPrivateKey(),
						botWallet.getPublicKey(),
						1 // small fee
					);
					
					if (transaction) {
						this.chainController.addTransactionToMempool(transaction);
					}
				}
				
				// Mine a block immediately to distribute the funds
				const seedBlock = this.chainController.mineBlock(satoshiWallet.getPublicKey(), false);
				
				if (seedBlock) {
					this.addEvent({
						type: 'TRANSACTION',
						timestamp: Date.now(),
						data: { message: `💰 Seeded ${botArray.length} bot wallets with ${amountPerBot} coins each` }
					});
				}
			}
		} else {
			this.addEvent({
				type: 'ERROR',
				timestamp: Date.now(),
				data: { message: `⚠️  Satoshi has insufficient funds (${satoshiBalance}) - mine some blocks first!` }
			});
		}
	}

	/**
	 * Generate a random transaction between bot wallets
	 */
	private generateRandomTransaction(): void {
		const botArray = Array.from(this.botWallets.entries());
		
		if (botArray.length < 2) {
			return;
		}
		
		// Pick random sender and receiver
		const fromIndex = Math.floor(Math.random() * botArray.length);
		let toIndex = Math.floor(Math.random() * botArray.length);
		
		// Ensure sender and receiver are different
		while (toIndex === fromIndex) {
			toIndex = Math.floor(Math.random() * botArray.length);
		}
		
		const [fromName, fromWallet] = botArray[fromIndex];
		const [toName, toWallet] = botArray[toIndex];
		
		const senderBalance = this.chainController.getBalance(fromWallet.getPublicKey());
		
		// Check if sender has enough funds
		if (senderBalance < 5) {
			return; // Not enough funds
		}
		
		// Random amount (5-30% of balance, min 1)
		const maxAmount = Math.floor(senderBalance * 0.3);
		const amount = Math.max(1, Math.floor(Math.random() * maxAmount) + 1);
		
		// Random fee (1-5)
		const fee = Math.floor(Math.random() * 5) + 1;
		
		// Check total cost
		if (senderBalance < amount + fee) {
			return;
		}
		
		// Create transaction
		const transaction = this.chainController.createTransaction(
			amount,
			fromWallet.getPublicKey(),
			fromWallet.getPrivateKey(),
			toWallet.getPublicKey(),
			fee
		);
		
		if (transaction) {
			const success = this.chainController.addTransactionToMempool(transaction);
			
			if (success) {
				this.stats.autoTransactions++;
				
				this.addEvent({
					type: 'TRANSACTION',
					timestamp: Date.now(),
					data: {
						from: fromName,
						to: toName,
						amount,
						fee,
						hash: transaction.toString().substring(0, 8)
					}
				});
			}
		}
	}

	/**
	 * Check if we should mine a block
	 */
	private checkAndMine(): void {
		if (this.isMining) {
			return;
		}
		
		const pendingCount = this.chainController.getPendingTransactionCount();
		
		if (pendingCount >= this.miningThreshold) {
			this.mineBlock();
		}
	}

	/**
	 * Mine a block with a bot miner
	 */
	private async mineBlock(): Promise<void> {
		if (this.isMining) {
			return;
		}
		
		this.isMining = true;
		
		// Select miner (rotate through bot wallets)
		const botArray = Array.from(this.botWallets.entries());
		if (botArray.length === 0) {
			this.isMining = false;
			return;
		}
		
		this.currentMinerIndex = this.currentMinerIndex % botArray.length;
		const [minerName, minerWallet] = botArray[this.currentMinerIndex];
		this.currentMinerIndex++;
		
		const pendingCount = this.chainController.getPendingTransactionCount();
		
		this.addEvent({
			type: 'MINING_START',
			timestamp: Date.now(),
			data: {
				miner: minerName,
				transactions: pendingCount
			}
		});
		
		const startTime = Date.now();
		
		// Mine in background (non-blocking)
		setTimeout(() => {
			try {
				const block = this.chainController.mineBlock(minerWallet.getPublicKey(), false);
				
				const miningTime = Date.now() - startTime;
				this.stats.autoMinedBlocks++;
				this.stats.totalMiningTime += miningTime;
				this.stats.averageBlockTime = this.stats.totalMiningTime / this.stats.autoMinedBlocks;
				
				if (block) {
					const reward = 50 + block.getTotalFees();
					
					this.addEvent({
						type: 'MINING_COMPLETE',
						timestamp: Date.now(),
						data: {
							miner: minerName,
							blockHeight: this.chainController.getChainLength() - 1,
							hash: block.hash.substring(0, 12),
							reward,
							miningTime,
							transactions: block.getTransactionCount()
						}
					});
				}
			} catch (error: any) {
				this.addEvent({
					type: 'ERROR',
					timestamp: Date.now(),
					data: { message: `Mining error: ${error.message}` }
				});
			} finally {
				this.isMining = false;
			}
		}, 100); // Small delay to prevent blocking
	}

	/**
	 * Add event to log
	 */
	private addEvent(event: ISimulationEvent): void {
		this.events.unshift(event);
		
		// Keep only last maxEvents
		if (this.events.length > this.maxEvents) {
			this.events = this.events.slice(0, this.maxEvents);
		}
	}

	/**
	 * Get recent events
	 */
	public getEvents(count: number = 20): ISimulationEvent[] {
		return this.events.slice(0, count);
	}

	/**
	 * Get simulation statistics
	 */
	public getStats(): ISimulationStats {
		return { ...this.stats };
	}

	/**
	 * Check if simulation is running
	 */
	public isActive(): boolean {
		return this.isRunning;
	}

	/**
	 * Get number of bot wallets
	 */
	public getBotCount(): number {
		return this.botWallets.size;
	}

	/**
	 * Reset statistics
	 */
	public resetStats(): void {
		this.stats = {
			autoTransactions: 0,
			autoMinedBlocks: 0,
			totalMiningTime: 0,
			averageBlockTime: 0,
			networkHashRate: 0
		};
		this.events = [];
	}
}
