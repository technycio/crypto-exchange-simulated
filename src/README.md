# Blockchain TypeScript Project

A feature-rich blockchain simulation built with modern TypeScript, featuring an interactive CLI, transaction fees, mining rewards, and complete balance tracking.

## 🚀 Features

### Core Blockchain
- ✅ **Multiple Transactions Per Block**: Bundle transactions for efficiency
- ✅ **Transaction Fees**: Priority-based fee system with mempool
- ✅ **Mining Rewards**: Miners earn coinbase rewards + transaction fees
- ✅ **Balance Tracking**: Real-time balance calculation across the chain
- ✅ **Transaction Validation**: Prevents double-spending and insufficient balance
- ✅ **Proof of Work**: Adjustable difficulty mining with progress visualization

### Advanced Features
- ✅ **Interactive CLI**: Full-featured command-line interface
- ✅ **Wallet Management**: Create and manage multiple wallets
- ✅ **Mempool with Priority Queue**: Transactions ordered by fee
- ✅ **Persistence**: Save/load blockchain to JSON
- ✅ **ASCII Visualization**: Beautiful blockchain visualization
- ✅ **Balance History**: Track balance changes over time
- ✅ **Chain Validation**: Verify blockchain integrity

## 📁 Project Structure

```
src/
├── models/              # Data models
│   ├── Transaction.ts      # Transaction with fees
│   ├── Block.ts           # Block with multiple transactions
│   ├── Wallet.ts          # RSA wallet
│   └── WalletManager.ts   # Manage multiple wallets
├── controllers/         # Business logic
│   ├── ChainController.ts    # Blockchain + balance tracking
│   └── MempoolController.ts  # Transaction pool with priority
├── services/            # Utility services
│   └── PersistenceService.ts # Save/load functionality
├── views/              # Presentation layer
│   └── BlockchainView.ts     # Visualization & display
├── cli/                # Interactive CLI
│   └── InteractiveCLI.ts     # Menu-driven interface
├── index.ts            # Demo application
└── cli-main.ts         # CLI entry point
```

## 🛠️ Installation & Usage

### Install Dependencies
```bash
npm install
```

### Build Project
```bash
npm run build
```

### Run Interactive CLI ⭐
```bash
npm run cli
```

### Run Demo
```bash
npm start
```

### Run Tests
```bash
# Basic functionality test
npm run test:basic

# Comprehensive test suite
npm run test:full

# Full workflow test (recommended)
npm run test:workflow
```

## 💡 Quick Start Example

```typescript
import { ChainController } from './controllers/ChainController.js';
import { WalletManager } from './models/WalletManager.js';

// Initialize
const chain = ChainController.getInstance();
const walletManager = new WalletManager();

// Create wallets
walletManager.createWallet('Alice');
walletManager.createWallet('Bob');
const alice = walletManager.getWallet('Alice')!;
const bob = walletManager.getWallet('Bob')!;

// Mine initial funds for Alice
chain.mineBlock(alice.getPublicKey());

// Create and send transaction
const tx = chain.createTransaction(
    20,  // amount
    alice.getPublicKey(),
    alice.getPrivateKey(),
    bob.getPublicKey(),
    1    // fee
);

if (tx) {
    chain.addTransactionToMempool(tx);
}

// Mine the transaction
chain.mineBlock(bob.getPublicKey());

// Check balances
console.log('Alice:', chain.getBalance(alice.getPublicKey()));
console.log('Bob:', chain.getBalance(bob.getPublicKey()));
```

## 🎯 CLI Features

The interactive CLI provides:

- **Wallet Management**: Create wallets, view balances, check history
- **Transactions**: Send money with custom fees
- **Mining**: Mine blocks and earn rewards
- **Visualization**: View chain as ASCII art, JSON, or summary
- **Persistence**: Save/load blockchain state
- **Statistics**: Network stats and analytics
- **Settings**: Adjust mining difficulty

## 🏗️ Architecture

### MVC Pattern
- **Models**: Pure data structures (Transaction, Block, Wallet)
- **Views**: Presentation logic (BlockchainView)
- **Controllers**: Business logic (ChainController, MempoolController)

### Design Patterns
- **Singleton**: ChainController ensures one blockchain instance
- **Priority Queue**: Mempool orders transactions by fee
- **Observer Pattern**: Balance tracking updates automatically

## 🔐 Security Features

- **RSA 2048-bit**: Cryptographic signing of transactions
- **Transaction Validation**: Balance checks, signature verification
- **Chain Integrity**: Hash linking prevents tampering
- **Double-Spend Prevention**: Mempool deduplication

## ⚙️ TypeScript Standards

- ✅ ES Modules with `.js` import extensions
- ✅ Strict mode enabled
- ✅ Proper interfaces for all data structures
- ✅ Readonly properties for immutability
- ✅ Access modifiers (public/private/protected)
- ✅ No `any` types
- ✅ Comprehensive type inference

## 📊 Transaction Flow

1. **Create Transaction**: Sign with private key
2. **Validate**: Check balance and signature
3. **Add to Mempool**: Queue with priority based on fee
4. **Mine Block**: Miner selects high-fee transactions
5. **Update Balances**: Process all transactions in block
6. **Reward Miner**: Coinbase transaction + fees

## 🧪 Testing

The project includes comprehensive tests:

- **test-basic.ts**: Core functionality validation
- **test-comprehensive.ts**: 26 test cases covering all features
- **test-full-workflow.ts**: End-to-end workflow simulation

All tests pass ✅ (26/26 tests, 100% success rate)

## 📈 Performance

- **Mining Speed**: Adjustable difficulty (1-8)
- **Progress Bar**: Real-time mining feedback
- **Mempool Size**: Configurable (default: 100 transactions)
- **Block Size**: Max 10 transactions per block

## 🔧 Configuration

Adjust settings in `ChainController`:
```typescript
private readonly miningReward: number = 50;
private readonly maxTransactionsPerBlock: number = 10;
private difficulty: number = 4;
```

## 📝 Transaction Fees

- Transactions with higher fees get priority
- Miners earn all fees in their mined block
- Fee calculation: `priority = fee * 1000 / (age + 1)`

## 💾 Persistence

Save/load blockchain state:
```typescript
import { PersistenceService } from './services/PersistenceService.js';

const persistence = new PersistenceService();

// Save
await persistence.saveBlockchain(chain.getChain(), chain.getAllBalances());

// Load
const data = await persistence.loadBlockchain();
```

## 🎨 Visualization Examples

ASCII Chain:
```
🔗 ═══════════ BLOCKCHAIN VISUALIZATION ═══════════

  ┌─────────────────────┐
  │  Block #00         │
  │  Hash: 96263ce5... │
  │  TXs: 1            │
  └─────────────────────┘
           ⬇
  ┌─────────────────────┐
  │  Block #01         │
  │  Hash: 004df7cd... │
  │  TXs: 1            │
  └─────────────────────┘
```

## 🐛 Known Issues & Solutions

All major issues have been resolved:
- ✅ Bootstrap problem solved (coinbase-only mining)
- ✅ Balance tracking accurate
- ✅ Mempool priority queue working
- ✅ Chain validation functional
- ✅ Persistence tested

## 📚 License

ISC

## 🤝 Contributing

This is a learning project demonstrating modern TypeScript and blockchain concepts.

---

Made with ❤️ using TypeScript, Node.js, and ES Modules
