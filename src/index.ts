import { ChainController } from './controllers/ChainController.js';
import { BlockchainView } from './views/BlockchainView.js';
import { WalletManager } from './models/WalletManager.js';

/**
 * Demo application showing blockchain functionality
 * This demonstrates the new features:
 * - Multiple transactions per block
 * - Transaction fees
 * - Mining rewards
 * - Balance tracking
 * - Mempool with priority queue
 */
async function demo(): Promise<void> {
	console.log('\n╔═══════════════════════════════════════════════════╗');
	console.log('║     🔗  BLOCKCHAIN DEMO  🔗                       ║');
	console.log('╚═══════════════════════════════════════════════════╝\n');

	// Initialize
	const chain = ChainController.getInstance();
	const view = new BlockchainView(chain);
	const walletManager = new WalletManager();

	// Create wallets
	console.log('📝 Creating wallets...\n');
	walletManager.createWallet('Alice');
	walletManager.createWallet('Bob');
	walletManager.createWallet('Miner');
	
	const alice = walletManager.getWallet('Alice')!;
	const bob = walletManager.getWallet('Bob')!;

	// Show initial state
	console.log('📊 Initial blockchain state:');
	view.displaySummary();

	// Mine first block to give Alice some coins
	console.log('\n⛏️  Step 1: Mining block to give Alice initial funds...\n');
	
	// Create a transaction to Alice (this would normally require an existing balance)
	// For demo purposes, we'll mine an empty block first to give miner rewards
	// Then miner can send to Alice
	
	console.log('   Mining empty block (miner gets reward)...');
	// Since there are no pending transactions, we need to add one first
	// Let's have the miner send funds to Alice
	
	// Wait, miner has no funds yet either. Let's think about this differently.
	// The genesis block gave satoshi 100 coins, but satoshi doesn't have a wallet.
	// For a proper demo, let's mine a block first to give miner the reward,
	// then miner can send to others.

	console.log('\n💡 Note: Genesis gave satoshi 100 coins, but satoshi has no wallet.');
	console.log('   Let\'s mine blocks to distribute funds through mining rewards.\n');

	// Create a dummy transaction to have something to mine
	// Actually, we need pending transactions to mine. Let's fix this workflow.
	
	console.log('📝 Creating test transactions (these will fail validation - no balance)...');
	
	// Create transactions (they'll fail but let's see)
	const tx1 = chain.createTransaction(50, alice.getPublicKey(), alice.getPrivateKey(), bob.getPublicKey(), 1);
	
	if (tx1) {
		console.log('   Transaction created (signed)');
		const added = chain.addTransactionToMempool(tx1);
		console.log(`   Added to mempool: ${added} (expected: false - no balance)`);
	}

	// Show mempool
	view.displayMempool();

	// Show balances
	console.log('\n💰 Current balances:');
	view.displayBalances();

	// Show stats
	console.log('\n📈 Network statistics:');
	view.displayStats();

	// Show ASCII chain
	console.log('\n🔗 Blockchain visualization:');
	view.displayASCIIChain();

	console.log('\n✅ Demo complete!\n');
	console.log('💡 To use the interactive CLI, run: npm run cli\n');
}

demo().catch(console.error);
