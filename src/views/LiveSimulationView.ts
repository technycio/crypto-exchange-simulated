import { ChainController } from '../controllers/ChainController.js';
import { LiveSimulationService, ISimulationEvent, SimulationSpeed } from '../services/LiveSimulationService.js';

/**
 * ANSI color codes for terminal
 */
const Colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	
	// Foreground colors
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	
	// Background colors
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m',
};

/**
 * View for displaying live simulation with Matrix-style effects
 */
export class LiveSimulationView {
	private readonly chainController: ChainController;
	private readonly simulationService: LiveSimulationService;
	private displayInterval?: NodeJS.Timeout;
	private isDisplaying: boolean = false;

	constructor(chainController: ChainController, simulationService: LiveSimulationService) {
		this.chainController = chainController;
		this.simulationService = simulationService;
	}

	/**
	 * Start displaying live simulation
	 */
	public startDisplay(speed: SimulationSpeed): void {
		if (this.isDisplaying) {
			return;
		}

		this.isDisplaying = true;
		
		// Clear screen and hide cursor
		console.clear();
		process.stdout.write('\x1b[?25l'); // Hide cursor

		// Initial render
		this.render(speed);

		// Update display every 500ms
		this.displayInterval = setInterval(() => {
			this.render(speed);
		}, 500);
	}

	/**
	 * Stop displaying live simulation
	 */
	public stopDisplay(): void {
		if (this.displayInterval) {
			clearInterval(this.displayInterval);
		}

		this.isDisplaying = false;
		
		// Show cursor again
		process.stdout.write('\x1b[?25h');
		console.clear();
	}

	/**
	 * Render the simulation display
	 */
	private render(speed: SimulationSpeed): void {
		// Move cursor to top-left
		process.stdout.write('\x1b[H');

		const width = Math.min(process.stdout.columns || 100, 100);
		const output: string[] = [];

		// Header
		output.push(this.renderHeader(width, speed));
		output.push('');

		// Stats bar
		output.push(this.renderStats(width));
		output.push('');

		// Activity stream
		output.push(this.renderActivityStream(width));
		output.push('');

		// Simulation stats
		output.push(this.renderSimulationStats(width));
		output.push('');

		// Footer
		output.push(this.renderFooter());

		// Clear screen and write output
		console.clear();
		console.log(output.join('\n'));
	}

	/**
	 * Render header with ASCII art
	 */
	private renderHeader(width: number, speed: SimulationSpeed): string {
		const lines: string[] = [];
		
		const title = 'LIVE BLOCKCHAIN SIMULATION';
		const status = this.simulationService.isActive() ? '●RUNNING●' : '○STOPPED○';
		const speedText = `[${speed}]`;
		
		// Calculate padding for centered title
		const titlePadding = Math.floor((width - 2 - title.length) / 2);
		const titleLine = ' '.repeat(titlePadding) + title + ' '.repeat(width - 2 - titlePadding - title.length);
		
		// Status line content
		const statusContent = `  Status: ${status}  │  Speed: ${speedText}  │  Auto-Mine: ON`;
		const statusPadding = ' '.repeat(Math.max(0, width - 2 - statusContent.length));
		
		lines.push(`${Colors.bright}${Colors.cyan}╔${'═'.repeat(width - 2)}╗${Colors.reset}`);
		lines.push(`${Colors.bright}${Colors.cyan}║${Colors.green}${titleLine}${Colors.cyan}║${Colors.reset}`);
		lines.push(`${Colors.bright}${Colors.cyan}║${Colors.yellow}${statusContent}${statusPadding}${Colors.cyan}║${Colors.reset}`);
		lines.push(`${Colors.bright}${Colors.cyan}╚${'═'.repeat(width - 2)}╝${Colors.reset}`);
		
		return lines.join('\n');
	}

	/**
	 * Render blockchain stats
	 */
	private renderStats(width: number): string {
		const chainLength = this.chainController.getChainLength();
		const pendingTxs = this.chainController.getPendingTransactionCount();
		const difficulty = this.chainController.getDifficulty();
		const isValid = this.chainController.isChainValid();
		
		const lines: string[] = [];
		
		// Calculate content without color codes
		const statsContent = `  Chain Height: ${String(chainLength).padEnd(8)}│  Pending TXs: ${String(pendingTxs).padEnd(8)}│  Difficulty: ${difficulty}  │  Valid: ${isValid ? '✓' : '✗'}`;
		const statsPadding = ' '.repeat(Math.max(0, width - 2 - statsContent.length));
		
		lines.push(`${Colors.cyan}╔${'═'.repeat(width - 2)}╗${Colors.reset}`);
		lines.push(`${Colors.cyan}║${Colors.white}  Chain Height: ${Colors.bright}${Colors.green}${String(chainLength).padEnd(8)}${Colors.reset}${Colors.cyan}│${Colors.white}  Pending TXs: ${Colors.bright}${Colors.yellow}${String(pendingTxs).padEnd(8)}${Colors.reset}${Colors.cyan}│${Colors.white}  Difficulty: ${Colors.bright}${difficulty}${Colors.reset}${Colors.cyan}  │  Valid: ${isValid ? Colors.green + '✓' : Colors.red + '✗'}${Colors.reset}${statsPadding}${Colors.cyan}║${Colors.reset}`);
		lines.push(`${Colors.cyan}╚${'═'.repeat(width - 2)}╝${Colors.reset}`);
		
		return lines.join('\n');
	}

	/**
	 * Render activity stream with scrolling events
	 */
	private renderActivityStream(width: number): string {
		const lines: string[] = [];
		
		const headerText = ' 📊 LIVE ACTIVITY STREAM ';
		const prefix = '╔═══';
		const suffix = '╗';
		// Emoji takes 2 visual character widths but counts as 1 in length, so subtract 1 from padding
		const headerPadding = Math.max(0, width - prefix.length - headerText.length - suffix.length - 1);
		lines.push(`${Colors.magenta}${prefix}${headerText}${'═'.repeat(headerPadding)}${suffix}${Colors.reset}`);
		lines.push(`${Colors.dim}${'━'.repeat(width)}${Colors.reset}`);
		
		const events = this.simulationService.getEvents(15);
		
		if (events.length === 0) {
			lines.push(`${Colors.dim}  Waiting for activity...${Colors.reset}`);
		} else {
			for (const event of events) {
				lines.push(this.formatEvent(event));
			}
		}
		
		lines.push(`${Colors.dim}${'━'.repeat(width)}${Colors.reset}`);
		
		return lines.join('\n');
	}

	/**
	 * Format a single event for display
	 */
	private formatEvent(event: ISimulationEvent): string {
		
		switch (event.type) {
			case 'TRANSACTION':
				if (event.data.from && event.data.to) {
					const hashPreview = event.data.hash ? event.data.hash.substring(0, 8) : '????????';
					const fromAddr = event.data.from.padEnd(15);
					const toAddr = event.data.to.padEnd(15);
					return `${Colors.green}💸 TX:${Colors.reset} ${Colors.cyan}${fromAddr}${Colors.reset} ${Colors.dim}→${Colors.reset} ${Colors.cyan}${toAddr}${Colors.reset} ${Colors.yellow}[${String(event.data.amount).padStart(2)} coins]${Colors.reset} ${Colors.dim}fee:${event.data.fee}${Colors.reset} ${Colors.dim}{${hashPreview}...}${Colors.reset}`;
				} else {
					return `${Colors.blue}ℹ  ${event.data.message}${Colors.reset}`;
				}
				
			case 'MINING_START':
				return `${Colors.yellow}⛏️  MINING:${Colors.reset} ${Colors.bright}Block with ${String(event.data.transactions).padStart(2)} txs${Colors.reset} ${Colors.dim}by ${event.data.miner.padEnd(15)}${Colors.reset} ${Colors.yellow}🔍 searching...${Colors.reset}`;
				
			case 'MINING_COMPLETE':
				const hashDisplay = event.data.hash.substring(0, 16);
				return `${Colors.bright}${Colors.green}✓  MINED:${Colors.reset} ${Colors.green}Block #${String(event.data.blockHeight).padStart(2)}${Colors.reset} ${Colors.dim}│${Colors.reset} Hash: ${Colors.cyan}${hashDisplay}...${Colors.reset} ${Colors.dim}│${Colors.reset} ${Colors.yellow}Reward: ${String(event.data.reward).padStart(2)}${Colors.reset} ${Colors.dim}│ ${String(event.data.miningTime).padStart(4)}ms${Colors.reset}`;
				
			case 'ERROR':
				return `${Colors.red}✗  ERROR: ${event.data.message}${Colors.reset}`;
				
			default:
				return `${Colors.dim}${JSON.stringify(event.data)}${Colors.reset}`;
		}
	}

	/**
	 * Render simulation statistics
	 */
	private renderSimulationStats(width: number): string {
		const stats = this.simulationService.getStats();
		const lines: string[] = [];
		
		const headerText = ' ⚡ SIMULATION STATS ';
		const prefix = '╔═══';
		const suffix = '╗';
		// Emoji takes 2 visual character widths but counts as 1 in length, so subtract 1 from padding
		const headerPadding = Math.max(0, width - prefix.length - headerText.length - suffix.length - 1);
		lines.push(`${Colors.cyan}${prefix}${headerText}${'═'.repeat(headerPadding)}${suffix}${Colors.reset}`);
		
		// First stats line
		const line1Content = `  Auto-Transactions: ${String(stats.autoTransactions).padEnd(12)}│  Auto-Mined Blocks: ${String(stats.autoMinedBlocks).padEnd(12)}`;
		const line1Padding = ' '.repeat(Math.max(0, width - 2 - line1Content.length));
		lines.push(`${Colors.cyan}║${Colors.reset}  ${Colors.bright}Auto-Transactions:${Colors.reset} ${Colors.green}${String(stats.autoTransactions).padEnd(12)}${Colors.reset}${Colors.cyan}│${Colors.reset}  ${Colors.bright}Auto-Mined Blocks:${Colors.reset} ${Colors.yellow}${String(stats.autoMinedBlocks).padEnd(12)}${Colors.reset}${line1Padding}${Colors.cyan}║${Colors.reset}`);
		
		const avgBlockTime = stats.averageBlockTime > 0 ? `${(stats.averageBlockTime / 1000).toFixed(1)}s` : 'N/A';
		const botCount = this.simulationService.getBotCount();
		
		// Second stats line
		const line2Content = `  Avg Block Time: ${avgBlockTime.padEnd(12)}│  Bot Wallets: ${String(botCount).padEnd(12)}`;
		const line2Padding = ' '.repeat(Math.max(0, width - 2 - line2Content.length));
		lines.push(`${Colors.cyan}║${Colors.reset}  ${Colors.bright}Avg Block Time:${Colors.reset} ${Colors.magenta}${avgBlockTime.padEnd(12)}${Colors.reset}${Colors.cyan}│${Colors.reset}  ${Colors.bright}Bot Wallets:${Colors.reset} ${Colors.blue}${String(botCount).padEnd(12)}${Colors.reset}${line2Padding}${Colors.cyan}║${Colors.reset}`);
		lines.push(`${Colors.cyan}╚${'═'.repeat(width - 2)}╝${Colors.reset}`);
		
		return lines.join('\n');
	}

	/**
	 * Render footer with ASCII art
	 */
	private renderFooter(): string {
		const lines: string[] = [];
		
		// ASCII blockchain visualization
		lines.push(`${Colors.dim}`);
		lines.push('  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐');
		lines.push('  │█████│ ─→ │█████│ ─→ │█████│ ─→ │█████│ ─→ ...');
		lines.push('  └─────┘    └─────┘    └─────┘    └─────┘');
		lines.push(`${Colors.reset}`);
		lines.push('');
		lines.push(`${Colors.bright}${Colors.yellow}[Press Ctrl+C to stop simulation and return to menu]${Colors.reset}`);
		
		return lines.join('\n');
	}

	/**
	 * Check if display is active
	 */
	public isActive(): boolean {
		return this.isDisplaying;
	}
}
