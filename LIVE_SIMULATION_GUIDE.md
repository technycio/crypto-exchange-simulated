# 🎬 Live Simulation Mode Guide

## Overview

The Live Simulation Mode creates a Matrix-style animated blockchain visualization with automated transaction generation and mining. This mode runs alongside the manual features without disrupting them.

## Features

### ✨ What It Does

- **Auto-generates bot wallets** (10 wallets with names like Alice_Bot, Bob_Bot, Satoshi_Sim, etc.)
- **Creates random transactions** between wallets automatically
- **Mines blocks** when mempool reaches threshold
- **Displays live Matrix-style visualization** with colored output
- **Shows real-time stats** (chain height, pending TXs, mining progress)
- **Scrolling activity stream** showing latest transactions and blocks

### 🎮 How to Use

1. **Start the CLI:**
   ```bash
   npm run cli
   ```

2. **Select Live Simulation Mode:**
   - Choose `🎬 Live Simulation Mode` from the main menu

3. **Choose Speed:**
   - **🚀 Fast Mode** - Transaction every 0.8s, mines at 5 TXs
   - **⚡ Medium Mode** - Transaction every 2s, mines at 8 TXs
   - **🐢 Slow Mode** - Transaction every 5s, mines at 10 TXs

4. **Watch the Magic:**
   - See transactions streaming in real-time
   - Watch blocks being mined automatically
   - Observe hashes, balances, and network activity

5. **Stop Simulation:**
   - Press `Ctrl+C` to stop and return to main menu
   - All blockchain state is preserved
   - Bot wallets remain on the chain

### 📊 Display Elements

The live display shows:

```
╔════════════════════════════════════════════════════╗
║    LIVE BLOCKCHAIN SIMULATION                      ║
║  Status: ●RUNNING●  │  Speed: [FAST]  │  Auto-Mine: ON  ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║  Chain Height: 47      │  Pending TXs: 8   │  Difficulty: 4  │  Valid: ✓  ║
╚════════════════════════════════════════════════════╝

╔═══ 📊 LIVE ACTIVITY STREAM ═══════════════════════════╗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💸 TX: Trader_C → Miner_Bot_2  [15 coins] fee:3 {hash:a4f7...}
💸 TX: Trader_A → Trader_D     [22 coins] fee:5 {hash:b912...}
⛏️  MINING: Block with 9 txs by Miner_Alpha 🔍 searching...
✓  MINED: Block #47 │ Hash: 0000c3a1f... │ Reward: 73 coins │ 142ms
💸 TX: Miner_Bot_1 → Trader_B  [8 coins]  fee:2 {hash:cd31...}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔═══ ⚡ SIMULATION STATS ════════════════════════════════╗
║  Auto-Transactions: 347        │  Auto-Mined Blocks: 38       ║
║  Avg Block Time: 18.3s         │  Bot Wallets: 10             ║
╚════════════════════════════════════════════════════════╝

  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
  │█████│ ─→ │█████│ ─→ │█████│ ─→ │█████│ ─→ ...
  └─────┘    └─────┘    └─────┘    └─────┘

[Press Ctrl+C to stop simulation and return to menu]
```

### 🎨 Color Coding

- **Green** 💸 - Transactions
- **Yellow** ⛏️  - Mining in progress
- **Bright Green** ✓ - Successfully mined blocks
- **Cyan** - Addresses and hashes
- **Magenta** - Stats and headers
- **Dim** - Secondary information

### 🤝 Coexistence with Manual Mode

The simulation mode:
- ✅ Uses its own bot wallets (prefixed names)
- ✅ Preserves all manual operations
- ✅ Doesn't interfere with user-created wallets
- ✅ Can be stopped and resumed anytime
- ✅ Blockchain state is shared and consistent
- ✅ Manual features work normally after simulation

### 🧪 Testing

Run the automated test:
```bash
npm run test:simulation
```

This runs a 15-second simulation test and displays final statistics.

## Technical Details

### Files Added

- `src/services/LiveSimulationService.ts` - Core simulation logic
- `src/views/LiveSimulationView.ts` - Matrix-style display
- `src/test-simulation.ts` - Automated test script

### Files Modified

- `src/cli/InteractiveCLI.ts` - Added simulation menu option

### Bot Wallet Names

The simulation creates wallets with these names:
- Alice_Bot, Bob_Bot, Charlie_Bot, Diana_Bot, Eve_Bot
- Frank_Bot, Grace_Bot, Hank_Bot, Ivy_Bot, Jack_Bot
- Satoshi_Sim, Vitalik_Sim, Nakamoto_AI
- Miner_Alpha, Miner_Beta
- Trader_X, Trader_Y, Trader_Z
- Whale_1, Whale_2

### Speed Settings

| Speed | TX Frequency | Mining Threshold |
|-------|--------------|------------------|
| SLOW | 5 seconds | 10 transactions |
| MEDIUM | 2 seconds | 8 transactions |
| FAST | 0.8 seconds | 5 transactions |

### Transaction Parameters

- Amount: 5-30% of sender balance (min 1 coin)
- Fee: Random 1-5 coins
- Sender/Receiver: Random bot wallets
- Validation: Checks sufficient balance before creating

### Mining Behavior

- Auto-triggers when mempool reaches threshold
- Rotates through bot wallets as miners
- Displays mining progress in activity stream
- Updates stats after each successful block
- Non-blocking implementation

## Troubleshooting

**Q: No transactions appearing?**
- Bot wallets may not have sufficient funds
- Satoshi's initial 100 coins may need to be distributed first

**Q: Display looks garbled?**
- Ensure terminal supports ANSI colors
- Try resizing terminal window
- Use a modern terminal emulator

**Q: Simulation won't stop?**
- Press `Ctrl+C` (may need to press twice)
- Terminal will clear and return to menu

**Q: Want to reset simulation stats?**
- Stats persist during session
- Restart CLI to reset counters

## Future Enhancements

Possible additions:
- Custom transaction amounts/fees
- Network events (forks, orphan blocks)
- Transaction pool visualization
- Hash rate graphs
- Wallet balance charts
- Smart contract simulation
- Multi-node network simulation

---

**Enjoy watching your blockchain come to life! 🚀⛓️**
