import { ChainController } from './controllers/ChainController.js';
import { BlockchainView } from './views/BlockchainView.js';
import { WalletManager } from './models/WalletManager.js';

/**
 * Full end-to-end workflow test
 * Tests the complete lifecycle: wallet creation -> mining -> transactions -> more mining
 */
async function testFullWorkflow(): Promise<void> {
	console.log('\n╔═══════════════════════════════════════════════════╗');
	console.log('║     🚀  FULL WORKFLOW TEST  🚀                   ║');
	console.log('╚═══════════════════════════════════════════════════╝\n');

	const chain = ChainController.getInstance();
	const view = new BlockchainView(chain);
	const walletManager = new WalletManager();

	// Step 1: Create wallets
	console.log('📝 STEP 1: Creating Wallets');
	walletManager.createWallet('Alice');
	walletManager.createWallet('Bob');
	walletManager.createWallet('Charlie');
	
	const alice = walletManager.getWallet('Alice')!;
	const bob = walletManager.getWallet('Bob')!;
	const charlie = walletManager.getWallet('Charlie')!;
	
	console.log('   ✓ Created 3 wallets\n');

	// Step 2: Mine initial blocks to distribute funds
	console.log('⛏️  STEP 2: Bootstrap - Mining blocks to distribute initial funds');
	console.log('   (Mining with only coinbase rewards)\n');

	// Set difficulty low for faster testing
	chain.setDifficulty(2);
	console.log('   Set difficulty to 2 for faster mining\n');

	// Mine block for Alice
	console.log('   Mining block #1 for Alice...');
	chain.mineBlock(alice.getPublicKey(), false);

	// Mine block for Bob  
	console.log('   Mining block #2 for Bob...');
	chain.mineBlock(bob.getPublicKey(), false);

	// Mine block for Charlie
	console.log('   Mining block #3 for Charlie...');
	chain.mineBlock(charlie.getPublicKey(), false);

	// Show balances
	console.log('\n💰 Balances after initial mining:');
	view.displayBalances();

	// Step 3: Create and submit transactions
	console.log('💸 STEP 3: Creating Transactions');

	console.log('   Alice sends 20 coins to Bob (fee: 2)...');
	const tx1 = chain.createTransaction(20, alice.getPublicKey(), alice.getPrivateKey(), bob.getPublicKey(), 2);
	if (tx1) {
		const added = chain.addTransactionToMempool(tx1);
		console.log(`   ${added ? '✓' : '✗'} Transaction added to mempool`);
	}

	console.log('   Bob sends 15 coins to Charlie (fee: 1)...');
	const tx2 = chain.createTransaction(15, bob.getPublicKey(), bob.getPrivateKey(), charlie.getPublicKey(), 1);
	if (tx2) {
		const added = chain.addTransactionToMempool(tx2);
		console.log(`   ${added ? '✓' : '✗'} Transaction added to mempool`);
	}

	console.log('   Alice sends 10 coins to Charlie (fee: 3)...');
	const tx3 = chain.createTransaction(10, alice.getPublicKey(), alice.getPrivateKey(), charlie.getPublicKey(), 3);
	if (tx3) {
		const added = chain.addTransactionToMempool(tx3);
		console.log(`   ${added ? '✓' : '✗'} Transaction added to mempool`);
	}

	console.log('');

	// Show mempool
	view.displayMempool();

	// Step 4: Mine block with transactions
	console.log('⛏️  STEP 4: Mining Block with Pending Transactions');
	console.log('   Charlie will mine and collect the fees...\n');
	
	chain.mineBlock(charlie.getPublicKey(), false);

	// Show updated balances
	console.log('💰 Final Balances:');
	view.displayBalances();

	// Step 5: Verify chain integrity
	console.log('🔍 STEP 5: Chain Validation');
	const isValid = chain.isChainValid();
	console.log(`   Chain is valid: ${isValid ? '✓ YES' : '✗ NO'}\n`);

	// Step 6: Show blockchain visualization
	console.log('📊 STEP 6: Blockchain State');
	view.displayASCIIChain();
	view.displayStats();

	// Step 7: Balance History
	console.log('📜 STEP 7: Balance History for Alice');
	view.displayBalanceHistory(alice.getPublicKey());

	// Summary
	console.log('╔═══════════════════════════════════════════════════╗');
	console.log('║               WORKFLOW TEST SUMMARY               ║');
	console.log('╠═══════════════════════════════════════════════════╣');
	console.log(`║  Total Blocks: ${String(chain.getChainLength()).padEnd(39)}║`);
	console.log(`║  Total Transactions: ${String(calculateTotalTx()).padEnd(32)}║`);
	console.log(`║  Chain Valid: ${String(chain.isChainValid()).padEnd(40)}║`);
	console.log('╚═══════════════════════════════════════════════════╝\n');

	console.log('✅ Full workflow test completed successfully!\n');

	function calculateTotalTx(): number {
		let total = 0;
		chain.getChain().forEach(block => {
			total += block.getTransactionCount();
		});
		return total;
	}
}

testFullWorkflow().catch(console.error);
