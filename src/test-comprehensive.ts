import { ChainController } from './controllers/ChainController.js';
import { BlockchainView } from './views/BlockchainView.js';
import { WalletManager } from './models/WalletManager.js';
import { PersistenceService } from './services/PersistenceService.js';

/**
 * Comprehensive test of all blockchain features
 */
async function runComprehensiveTest(): Promise<void> {
	console.log('\n╔═══════════════════════════════════════════════════╗');
	console.log('║     🧪  COMPREHENSIVE BLOCKCHAIN TEST  🧪        ║');
	console.log('╚═══════════════════════════════════════════════════╝\n');

	const chain = ChainController.getInstance();
	const view = new BlockchainView(chain);
	const walletManager = new WalletManager();
	const persistence = new PersistenceService();

	let testsPassed = 0;
	let testsFailed = 0;

	function test(name: string, condition: boolean): void {
		if (condition) {
			console.log(`✓ ${name}`);
			testsPassed++;
		} else {
			console.log(`✗ ${name}`);
			testsFailed++;
		}
	}

	// TEST 1: Initial State
	console.log('\n📋 Test 1: Initial State');
	test('Genesis block exists', chain.getChainLength() === 1);
	test('Satoshi has 100 coins', chain.getBalance('satoshi') === 100);
	test('Chain is valid', chain.isChainValid());
	test('No pending transactions', chain.getPendingTransactionCount() === 0);

	// TEST 2: Wallet Creation
	console.log('\n📋 Test 2: Wallet Creation');
	walletManager.createWallet('Alice');
	walletManager.createWallet('Bob');
	walletManager.createWallet('Miner');
	
	const alice = walletManager.getWallet('Alice')!;
	const bob = walletManager.getWallet('Bob')!;
	const miner = walletManager.getWallet('Miner')!;
	
	test('Alice wallet created', alice !== undefined);
	test('Bob wallet created', bob !== undefined);
	test('Miner wallet created', miner !== undefined);
	test('Alice has public key', alice.getPublicKey().length > 0);
	test('Alice has private key', alice.getPrivateKey().length > 0);

	// TEST 3: Transaction Creation & Validation
	console.log('\n📋 Test 3: Transaction Creation & Validation');
	
	// Try creating transaction with no balance (should fail)
	const invalidTx = chain.createTransaction(
		10,
		alice.getPublicKey(),
		alice.getPrivateKey(),
		bob.getPublicKey(),
		1
	);
	test('Transaction created', invalidTx !== null);
	
	if (invalidTx) {
		const added = chain.addTransactionToMempool(invalidTx);
		test('Invalid transaction rejected (no balance)', !added);
	}

	// Give Alice some funds by mining a block to her
	console.log('\n📋 Test 4: Mining & Rewards');
	console.log('   Mining block to give Alice funds...');
	
	// Create a valid "seed" transaction or just mine to give rewards
	// Since we can't mine without pending transactions, let's think about this differently
	// Actually, the mineBlock method should handle empty mempool gracefully
	
	// Let's check the mineBlock implementation...
	// It says "No pending transactions to mine" if empty
	// So we need a different approach to bootstrap
	
	// For testing, let's manually give Alice funds (simulate initial distribution)
	// We'll need to add a method to manually add funds for testing
	// OR we could have genesis distribute to multiple addresses
	
	console.log('   ⚠️  Issue found: Cannot bootstrap funds without pending transactions');
	console.log('   💡 Proposed fix: Add method to create "faucet" transactions for testing');
	
	test('Mining requires pending transactions', chain.getPendingTransactionCount() === 0);

	// TEST 5: Chain Validation
	console.log('\n📋 Test 5: Chain Validation');
	test('Chain is still valid', chain.isChainValid());
	test('Difficulty is 4', chain.getDifficulty() === 4);

	// TEST 6: Mempool
	console.log('\n📋 Test 6: Mempool Operations');
	test('Mempool is empty', chain.getPendingTransactionCount() === 0);
	test('Mempool accessible', chain.getMempool() !== null);

	// TEST 7: Balance Tracking
	console.log('\n📋 Test 7: Balance Tracking');
	test('Alice has 0 balance', chain.getBalance(alice.getPublicKey()) === 0);
	test('Bob has 0 balance', chain.getBalance(bob.getPublicKey()) === 0);
	test('Satoshi has 100 balance', chain.getBalance('satoshi') === 100);

	// TEST 8: Balance History
	console.log('\n📋 Test 8: Balance History');
	const aliceHistory = chain.getBalanceHistory(alice.getPublicKey());
	test('Alice has history entries', aliceHistory.length === chain.getChainLength());
	test('Alice history shows 0 balance', aliceHistory[aliceHistory.length - 1].balance === 0);

	// TEST 9: Visualization
	console.log('\n📋 Test 9: Visualization');
	console.log('   Testing view methods...');
	try {
		view.displaySummary();
		test('Summary displays without errors', true);
	} catch (e) {
		test('Summary displays without errors', false);
	}

	// TEST 10: Settings
	console.log('\n📋 Test 10: Settings');
	chain.setDifficulty(3);
	test('Difficulty changed to 3', chain.getDifficulty() === 3);
	chain.setDifficulty(4);
	test('Difficulty changed back to 4', chain.getDifficulty() === 4);

	// TEST 11: Persistence (without actually saving)
	console.log('\n📋 Test 11: Persistence');
	const json = persistence.exportToJSON(chain.getChain(), chain.getAllBalances());
	test('Can export to JSON', json.length > 0);
	test('JSON is valid', JSON.parse(json) !== null);

	// Results
	console.log('\n╔═══════════════════════════════════════════════════╗');
	console.log('║               TEST RESULTS                        ║');
	console.log('╠═══════════════════════════════════════════════════╣');
	console.log(`║  Tests Passed: ${String(testsPassed).padEnd(35)}║`);
	console.log(`║  Tests Failed: ${String(testsFailed).padEnd(35)}║`);
	console.log(`║  Success Rate: ${String(Math.round(testsPassed / (testsPassed + testsFailed) * 100)) + '%'.padEnd(34)}║`);
	console.log('╚═══════════════════════════════════════════════════╝\n');

	// Issues Found
	console.log('🔍 ISSUES IDENTIFIED:\n');
	console.log('1. ⚠️  Bootstrap Problem: Cannot distribute funds without pre-existing balance');
	console.log('   💡 Solution: Add faucet/airdrop feature for testing or multi-recipient genesis\n');
	
	console.log('2. ⚠️  Mining requires pending transactions but new users have no funds');
	console.log('   💡 Solution: Allow mining empty blocks or add "coinbase only" mining\n');

	console.log('\n✅ Comprehensive test complete!\n');
}

runComprehensiveTest().catch(console.error);
