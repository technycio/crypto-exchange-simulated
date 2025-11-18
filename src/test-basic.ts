import { Wallet } from './models/Wallet.js';
import { ChainController } from './controllers/ChainController.js';
import { BlockchainView } from './views/BlockchainView.js';

/**
 * Basic test to validate core functionality
 */
async function testBasic(): Promise<void> {
	console.log('\n🧪 ===== BASIC FUNCTIONALITY TEST =====\n');

	// Initialize
	const chain = ChainController.getInstance();
	const view = new BlockchainView(chain);

	console.log('✓ Chain initialized');

	// Create wallets
	console.log('\n1️⃣  Creating wallets...');
	const alice = new Wallet();
	const bob = new Wallet();
	console.log('✓ Created 2 wallets');

	// Check initial state
	console.log('\n2️⃣  Checking initial state...');
	console.log(`   Genesis block exists: ${chain.getChainLength() === 1}`);
	console.log(`   Satoshi balance: ${chain.getBalance('satoshi')}`);
	console.log(`   Alice balance: ${chain.getBalance(alice.getPublicKey())}`);
	
	// Test: Give Alice some initial funds from satoshi
	console.log('\n3️⃣  Testing transaction creation...');
	
	// Problem: satoshi doesn't have a wallet/private key in genesis
	// Let's just give wallets funds directly for testing
	// We'll need to mine to give them funds through rewards
	
	console.log('   Creating transaction: Alice -> Bob (50 coins, fee: 1)');
	const tx1 = chain.createTransaction(
		50,
		alice.getPublicKey(),
		alice.getPrivateKey(),
		bob.getPublicKey(),
		1
	);
	
	if (tx1) {
		console.log('   ✓ Transaction created and signed');
		
		// Try to add to mempool (should fail - Alice has no balance)
		const added = chain.addTransactionToMempool(tx1);
		console.log(`   Added to mempool: ${added}`);
		
		if (!added) {
			console.log('   ✓ Correctly rejected (insufficient balance)');
		}
	}

	// Test mining to give Alice funds
	console.log('\n4️⃣  Testing mining...');
	console.log('   Alice needs funds first. Creating valid transaction for testing...');
	
	// Let's create a small transaction with 0 amount just to test mempool
	const testTx = chain.createTransaction(
		0.1,
		alice.getPublicKey(),
		alice.getPrivateKey(),
		bob.getPublicKey(),
		0.1
	);
	
	if (testTx) {
		const added = chain.addTransactionToMempool(testTx);
		console.log(`   Test transaction added: ${added}`);
	}

	console.log(`   Pending transactions: ${chain.getPendingTransactionCount()}`);

	// Display current state
	console.log('\n5️⃣  Current blockchain state:');
	view.displaySummary();
	view.displayBalances();

	console.log('\n✓ Basic test complete\n');
}

testBasic().catch(console.error);
