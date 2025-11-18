import { ChainController } from './controllers/ChainController.js';
import { WalletManager } from './models/WalletManager.js';
import { LiveSimulationService, SimulationSpeed } from './services/LiveSimulationService.js';
import { LiveSimulationView } from './views/LiveSimulationView.js';

/**
 * Test script for live simulation mode
 */
async function testSimulation(): Promise<void> {
	console.log('🧪 Testing Live Simulation Mode...\n');

	// Initialize services
	const chainController = ChainController.getInstance();
	const walletManager = new WalletManager();
	const simulationService = new LiveSimulationService(chainController, walletManager);
	const simulationView = new LiveSimulationView(chainController, simulationService);

	// Create satoshi wallet and mine initial blocks
	console.log('👤 Creating satoshi wallet...');
	const satoshiWallet = walletManager.createWallet('satoshi');
	console.log('✓ Satoshi wallet created\n');
	
	console.log('⛏️  Mining initial blocks for satoshi...');
	for (let i = 0; i < 3; i++) {
		chainController.mineBlock(satoshiWallet.getPublicKey(), false);
		process.stdout.write('.');
	}
	console.log(' Done!\n');
	
	const satoshiBalance = chainController.getBalance(satoshiWallet.getPublicKey());
	console.log(`💰 Satoshi balance: ${satoshiBalance} coins\n`);

	// Initialize bot wallets
	console.log('🤖 Initializing bot wallets...');
	simulationService.initializeBotWallets(10);
	console.log(`✓ Created ${simulationService.getBotCount()} bot wallets\n`);

	// Start simulation
	console.log('🚀 Starting simulation in FAST mode...');
	simulationService.start(SimulationSpeed.FAST);
	simulationView.startDisplay(SimulationSpeed.FAST);

	// Run for 15 seconds
	console.log('⏱️  Running for 15 seconds...\n');
	
	await new Promise<void>((resolve) => {
		setTimeout(() => {
			console.log('\n⏹️  Stopping simulation...');
			simulationService.stop();
			simulationView.stopDisplay();
			resolve();
		}, 15000);
	});

	// Display final stats
	const stats = simulationService.getStats();
	console.log('\n═══════════════════════════════════');
	console.log('📊 SIMULATION TEST RESULTS');
	console.log('═══════════════════════════════════');
	console.log(`Auto-Transactions: ${stats.autoTransactions}`);
	console.log(`Auto-Mined Blocks: ${stats.autoMinedBlocks}`);
	console.log(`Avg Block Time: ${(stats.averageBlockTime / 1000).toFixed(1)}s`);
	console.log(`Chain Length: ${chainController.getChainLength()}`);
	console.log(`Pending TXs: ${chainController.getPendingTransactionCount()}`);
	console.log('═══════════════════════════════════\n');

	console.log('✅ Test completed successfully!\n');
	process.exit(0);
}

testSimulation().catch((error) => {
	console.error('❌ Test failed:', error);
	process.exit(1);
});
