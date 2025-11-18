import inquirer from 'inquirer';
import { ChainController } from '../controllers/ChainController.js';
import { BlockchainView } from '../views/BlockchainView.js';
import { WalletManager } from '../models/WalletManager.js';
import { PersistenceService } from '../services/PersistenceService.js';
import { LiveSimulationService, SimulationSpeed } from '../services/LiveSimulationService.js';
import { LiveSimulationView } from '../views/LiveSimulationView.js';

/**
 * Interactive CLI for blockchain operations
 */
export class InteractiveCLI {
	private readonly chainController: ChainController;
	private readonly view: BlockchainView;
	private readonly walletManager: WalletManager;
	private readonly persistence: PersistenceService;
	private readonly simulationService: LiveSimulationService;
	private readonly simulationView: LiveSimulationView;
	private running: boolean = true;

	constructor() {
		this.chainController = ChainController.getInstance();
		this.view = new BlockchainView(this.chainController);
		this.walletManager = new WalletManager();
		this.persistence = new PersistenceService();
		this.simulationService = new LiveSimulationService(this.chainController, this.walletManager);
		this.simulationView = new LiveSimulationView(this.chainController, this.simulationService);
	}

	/**
	 * Start the interactive CLI
	 */
	async start(): Promise<void> {
		console.log('\n╔═══════════════════════════════════════════════════╗');
		console.log('║     🔗  BLOCKCHAIN INTERACTIVE CLI  🔗            ║');
		console.log('╚═══════════════════════════════════════════════════╝\n');

		// Check if saved blockchain exists
		if (await this.persistence.blockchainExists()) {
			const { loadSaved } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'loadSaved',
					message: 'Found saved blockchain. Load it?',
					default: true
				}
			]);

			if (loadSaved) {
				await this.loadBlockchain();
			}
		}

		while (this.running) {
			await this.showMainMenu();
		}
	}

	/**
	 * Show main menu
	 */
	private async showMainMenu(): Promise<void> {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'What would you like to do?',
				choices: [
					{ name: '🎬 Live Simulation Mode', value: 'simulation' },
					{ name: '👛 Wallet Management', value: 'wallets' },
					{ name: '💸 Send Transaction', value: 'transaction' },
					{ name: '⛏️  Mine Block', value: 'mine' },
					{ name: '📊 View Blockchain', value: 'view' },
					{ name: '💰 View Balances', value: 'balances' },
					{ name: '📈 View Statistics', value: 'stats' },
					{ name: '💾 Save/Load', value: 'persistence' },
					{ name: '⚙️  Settings', value: 'settings' },
					{ name: '🚪 Exit', value: 'exit' }
				]
			}
		]);

		switch (action) {
			case 'simulation':
				await this.simulationMenu();
				break;
			case 'wallets':
				await this.walletMenu();
				break;
			case 'transaction':
				await this.sendTransaction();
				break;
			case 'mine':
				await this.mineBlock();
				break;
			case 'view':
				await this.viewMenu();
				break;
			case 'balances':
				this.view.displayBalances();
				break;
			case 'stats':
				this.view.displayStats();
				break;
			case 'persistence':
				await this.persistenceMenu();
				break;
			case 'settings':
				await this.settingsMenu();
				break;
			case 'exit':
				await this.exit();
				break;
		}
	}

	/**
	 * Wallet management menu
	 */
	private async walletMenu(): Promise<void> {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Wallet Management:',
				choices: [
					{ name: '➕ Create New Wallet', value: 'create' },
					{ name: '📋 List Wallets', value: 'list' },
					{ name: '🔍 View Wallet Details', value: 'details' },
					{ name: '📜 View Balance History', value: 'history' },
					{ name: '⬅️  Back', value: 'back' }
				]
			}
		]);

		switch (action) {
			case 'create':
				await this.createWallet();
				break;
			case 'list':
				await this.listWallets();
				break;
			case 'details':
				await this.viewWalletDetails();
				break;
			case 'history':
				await this.viewBalanceHistory();
				break;
			case 'back':
				return;
		}

		if (action !== 'back') {
			await this.walletMenu();
		}
	}

	/**
	 * Create a new wallet
	 */
	private async createWallet(): Promise<void> {
		const { name } = await inquirer.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Enter wallet name:',
				validate: (input: string) => {
					if (!input.trim()) return 'Name cannot be empty';
					if (this.walletManager.hasWallet(input)) return 'Wallet already exists';
					return true;
				}
			}
		]);

		const wallet = this.walletManager.createWallet(name);
		console.log(`\n✓ Wallet "${name}" created successfully!`);
		console.log(`Public Key: ${wallet.getPublicKey().substring(0, 50)}...\n`);
	}

	/**
	 * List all wallets
	 */
	private async listWallets(): Promise<void> {
		const wallets = this.walletManager.getAllWalletNames();
		
		if (wallets.length === 0) {
			console.log('\n⚠ No wallets created yet.\n');
			return;
		}

		console.log('\n╔════════════ WALLETS ════════════╗');
		wallets.forEach((name, i) => {
			const wallet = this.walletManager.getWallet(name)!;
			const balance = this.chainController.getBalance(wallet.getPublicKey());
			console.log(`║ ${i + 1}. ${name.padEnd(20)} ${String(balance).padStart(8)} ║`);
		});
		console.log('╚═════════════════════════════════╝\n');
	}

	/**
	 * View wallet details
	 */
	private async viewWalletDetails(): Promise<void> {
		const wallets = this.walletManager.getAllWalletNames();
		
		if (wallets.length === 0) {
			console.log('\n⚠ No wallets created yet.\n');
			return;
		}

		const { walletName } = await inquirer.prompt([
			{
				type: 'list',
				name: 'walletName',
				message: 'Select wallet:',
				choices: wallets
			}
		]);

		const wallet = this.walletManager.getWallet(walletName)!;
		const balance = this.chainController.getBalance(wallet.getPublicKey());

		console.log(`\n╔═══ Wallet: ${walletName} ═══╗`);
		console.log(`Balance: ${balance} coins`);
		console.log(`Public Key:\n${wallet.getPublicKey()}`);
		console.log(`\n`);
	}

	/**
	 * View balance history
	 */
	private async viewBalanceHistory(): Promise<void> {
		const wallets = this.walletManager.getAllWalletNames();
		
		if (wallets.length === 0) {
			console.log('\n⚠ No wallets created yet.\n');
			return;
		}

		const { walletName } = await inquirer.prompt([
			{
				type: 'list',
				name: 'walletName',
				message: 'Select wallet:',
				choices: wallets
			}
		]);

		const wallet = this.walletManager.getWallet(walletName)!;
		this.view.displayBalanceHistory(wallet.getPublicKey());
	}

	/**
	 * Send a transaction
	 */
	private async sendTransaction(): Promise<void> {
		const wallets = this.walletManager.getAllWalletNames();
		
		if (wallets.length < 2) {
			console.log('\n⚠ You need at least 2 wallets to send a transaction.\n');
			return;
		}

		const answers = await inquirer.prompt([
			{
				type: 'list',
				name: 'from',
				message: 'From wallet:',
				choices: wallets
			},
			{
				type: 'list',
				name: 'to',
				message: 'To wallet:',
				choices: (answers: any) => wallets.filter(w => w !== answers.from)
			},
			{
				type: 'number',
				name: 'amount',
				message: 'Amount:',
				validate: (input: number) => input > 0 ? true : 'Amount must be positive'
			},
			{
				type: 'number',
				name: 'fee',
				message: 'Transaction fee:',
				default: 1,
				validate: (input: number) => input >= 0 ? true : 'Fee cannot be negative'
			}
		]);

		const fromWallet = this.walletManager.getWallet(answers.from)!;
		const toWallet = this.walletManager.getWallet(answers.to)!;

		const transaction = this.chainController.createTransaction(
			answers.amount,
			fromWallet.getPublicKey(),
			fromWallet.getPrivateKey(),
			toWallet.getPublicKey(),
			answers.fee
		);

		if (!transaction) {
			console.log('\n✗ Failed to create transaction\n');
			return;
		}

		const success = this.chainController.addTransactionToMempool(transaction);

		if (success) {
			console.log('\n✓ Transaction added to mempool\n');
			this.view.displayTransaction(
				fromWallet.getPublicKey(),
				toWallet.getPublicKey(),
				answers.amount,
				answers.fee,
				true
			);
		} else {
			console.log('\n✗ Transaction rejected\n');
		}
	}

	/**
	 * Mine a block
	 */
	private async mineBlock(): Promise<void> {
		const pendingCount = this.chainController.getPendingTransactionCount();
		
		if (pendingCount === 0) {
			console.log('\n⚠ No pending transactions to mine\n');
			return;
		}

		const wallets = this.walletManager.getAllWalletNames();
		
		if (wallets.length === 0) {
			console.log('\n⚠ Create a wallet first to receive mining rewards\n');
			return;
		}

		const { minerWallet } = await inquirer.prompt([
			{
				type: 'list',
				name: 'minerWallet',
				message: 'Select miner wallet (to receive rewards):',
				choices: wallets
			}
		]);

		const wallet = this.walletManager.getWallet(minerWallet)!;
		
		console.log(`\n⛏️  Mining block with ${pendingCount} pending transaction(s)...\n`);
		
		const block = this.chainController.mineBlock(wallet.getPublicKey(), true);

		if (block) {
			console.log(`\n✓ Block mined successfully!`);
			console.log(`Miner reward: 50 + ${block.getTotalFees()} fees = ${50 + block.getTotalFees()} coins\n`);
		}
	}

	/**
	 * View menu
	 */
	private async viewMenu(): Promise<void> {
		const { viewType } = await inquirer.prompt([
			{
				type: 'list',
				name: 'viewType',
				message: 'What would you like to view?',
				choices: [
					{ name: '📊 Blockchain Summary', value: 'summary' },
					{ name: '🔗 ASCII Chain Visualization', value: 'ascii' },
					{ name: '📋 Full Blockchain (JSON)', value: 'full' },
					{ name: '📦 View Specific Block', value: 'block' },
					{ name: '📬 View Mempool', value: 'mempool' },
					{ name: '⬅️  Back', value: 'back' }
				]
			}
		]);

		switch (viewType) {
			case 'summary':
				this.view.displaySummary();
				break;
			case 'ascii':
				this.view.displayASCIIChain();
				break;
			case 'full':
				this.view.displayChain();
				break;
			case 'block':
				await this.viewBlock();
				break;
			case 'mempool':
				this.view.displayMempool();
				break;
			case 'back':
				return;
		}
	}

	/**
	 * View specific block
	 */
	private async viewBlock(): Promise<void> {
		const chainLength = this.chainController.getChainLength();
		
		const { blockNumber } = await inquirer.prompt([
			{
				type: 'number',
				name: 'blockNumber',
				message: `Enter block number (0-${chainLength - 1}):`,
				validate: (input: number) => {
					if (input >= 0 && input < chainLength) return true;
					return `Block number must be between 0 and ${chainLength - 1}`;
				}
			}
		]);

		const block = this.chainController.getChain()[blockNumber];
		this.view.displayBlock(block, blockNumber);
	}

	/**
	 * Persistence menu
	 */
	private async persistenceMenu(): Promise<void> {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Save/Load Options:',
				choices: [
					{ name: '💾 Save Blockchain', value: 'save' },
					{ name: '📂 Load Blockchain', value: 'load' },
					{ name: '📤 Export to JSON', value: 'export' },
					{ name: '⬅️  Back', value: 'back' }
				]
			}
		]);

		switch (action) {
			case 'save':
				await this.saveBlockchain();
				break;
			case 'load':
				await this.loadBlockchain();
				break;
			case 'export':
				await this.exportBlockchain();
				break;
			case 'back':
				return;
		}
	}

	/**
	 * Save blockchain
	 */
	private async saveBlockchain(): Promise<void> {
		try {
			await this.persistence.saveBlockchain(
				this.chainController.getChain(),
				this.chainController.getAllBalances()
			);
		} catch (error) {
			console.log('\n✗ Failed to save blockchain\n');
		}
	}

	/**
	 * Load blockchain
	 */
	private async loadBlockchain(): Promise<void> {
		try {
			const data = await this.persistence.loadBlockchain();
			if (data) {
				console.log('\n⚠ Loading will replace current blockchain\n');
			}
		} catch (error) {
			console.log('\n✗ Failed to load blockchain\n');
		}
	}

	/**
	 * Export blockchain
	 */
	private async exportBlockchain(): Promise<void> {
		const json = this.persistence.exportToJSON(
			this.chainController.getChain(),
			this.chainController.getAllBalances()
		);
		console.log('\n' + json + '\n');
	}

	/**
	 * Settings menu
	 */
	private async settingsMenu(): Promise<void> {
		const currentDifficulty = this.chainController.getDifficulty();
		
		const { difficulty } = await inquirer.prompt([
			{
				type: 'number',
				name: 'difficulty',
				message: 'Set mining difficulty (1-8):',
				default: currentDifficulty,
				validate: (input: number) => {
					if (input >= 1 && input <= 8) return true;
					return 'Difficulty must be between 1 and 8';
				}
			}
		]);

		this.chainController.setDifficulty(difficulty);
		console.log(`\n✓ Difficulty set to ${difficulty}\n`);
	}

	/**
	 * Live simulation menu
	 */
	private async simulationMenu(): Promise<void> {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Live Simulation Mode:',
				choices: [
					{ name: '🚀 Start Simulation (Fast)', value: 'fast' },
					{ name: '⚡ Start Simulation (Medium)', value: 'medium' },
					{ name: '🐢 Start Simulation (Slow)', value: 'slow' },
					{ name: '⬅️  Back', value: 'back' }
				]
			}
		]);

		if (action === 'back') {
			return;
		}

		// Map action to speed
		let speed: SimulationSpeed;
		switch (action) {
			case 'fast':
				speed = SimulationSpeed.FAST;
				break;
			case 'medium':
				speed = SimulationSpeed.MEDIUM;
				break;
			case 'slow':
				speed = SimulationSpeed.SLOW;
				break;
			default:
				return;
		}

		await this.runSimulation(speed);
	}

	/**
	 * Run the live simulation
	 */
	private async runSimulation(speed: SimulationSpeed): Promise<void> {
		// Ensure satoshi wallet exists
		if (!this.walletManager.hasWallet('satoshi')) {
			console.log('\n👤 Creating satoshi wallet...');
			this.walletManager.createWallet('satoshi');
		}
		
		const satoshiWallet = this.walletManager.getWallet('satoshi')!;
		const satoshiBalance = this.chainController.getBalance(satoshiWallet.getPublicKey());
		
		// If satoshi has no funds, mine some initial blocks
		if (satoshiBalance < 100) {
			console.log('⛏️  Mining initial blocks for satoshi to fund simulation...');
			// Mine 3 blocks to give satoshi some initial funds
			for (let i = 0; i < 3; i++) {
				this.chainController.mineBlock(satoshiWallet.getPublicKey(), false);
				process.stdout.write('.');
			}
			console.log(' Done!\n');
		}
		
		// Initialize bot wallets if not already done
		if (this.simulationService.getBotCount() === 0) {
			console.log('🤖 Initializing bot wallets...');
			this.simulationService.initializeBotWallets(10);
			console.log('✓ Bot wallets initialized\n');
		}

		// Start simulation service
		this.simulationService.start(speed);

		// Start display
		this.simulationView.startDisplay(speed);

		// Set up Ctrl+C handler
		const handleExit = () => {
			this.simulationService.stop();
			this.simulationView.stopDisplay();
			console.log('\n\n✓ Simulation stopped. Returning to menu...\n');
			process.removeListener('SIGINT', handleExit);
		};

		process.on('SIGINT', handleExit);

		// Wait for user to press Ctrl+C
		await new Promise<void>((resolve) => {
			const checkInterval = setInterval(() => {
				if (!this.simulationService.isActive()) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 1000);
		});

		process.removeListener('SIGINT', handleExit);
	}

	/**
	 * Exit the application
	 */
	private async exit(): Promise<void> {
		const { saveBeforeExit } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'saveBeforeExit',
				message: 'Save blockchain before exiting?',
				default: true
			}
		]);

		if (saveBeforeExit) {
			await this.saveBlockchain();
		}

		console.log('\n👋 Goodbye!\n');
		this.running = false;
	}
}
