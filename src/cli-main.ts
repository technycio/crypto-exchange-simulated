import { InteractiveCLI } from './cli/InteractiveCLI.js';

/**
 * Entry point for interactive CLI
 */
async function main(): Promise<void> {
	const cli = new InteractiveCLI();
	await cli.start();
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
