import { promises as fs } from 'fs';
import { Block } from '../models/Block.js';
import { Transaction, TransactionType } from '../models/Transaction.js';

export interface IBlockchainData {
	blocks: any[];
	balances: Record<string, number>;
	timestamp: number;
}

/**
 * Service for saving and loading blockchain data
 */
export class PersistenceService {
	private readonly defaultPath: string = './blockchain-data.json';

	/**
	 * Save blockchain to file
	 */
	async saveBlockchain(
		blocks: ReadonlyArray<Block>,
		balances: Map<string, number>,
		filePath?: string
	): Promise<void> {
		const path = filePath ?? this.defaultPath;

		const data: IBlockchainData = {
			blocks: blocks.map(block => block.toJSON()),
			balances: Object.fromEntries(balances),
			timestamp: Date.now()
		};

		try {
			await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
			console.log(`✓ Blockchain saved to ${path}`);
		} catch (error) {
			console.error(`Failed to save blockchain:`, error);
			throw error;
		}
	}

	/**
	 * Load blockchain from file
	 */
	async loadBlockchain(filePath?: string): Promise<IBlockchainData | null> {
		const path = filePath ?? this.defaultPath;

		try {
			const content = await fs.readFile(path, 'utf-8');
			const data: IBlockchainData = JSON.parse(content);
			console.log(`✓ Blockchain loaded from ${path}`);
			return data;
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				console.log('No saved blockchain found');
				return null;
			}
			console.error(`Failed to load blockchain:`, error);
			throw error;
		}
	}

	/**
	 * Check if blockchain file exists
	 */
	async blockchainExists(filePath?: string): Promise<boolean> {
		const path = filePath ?? this.defaultPath;
		try {
			await fs.access(path);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Delete blockchain file
	 */
	async deleteBlockchain(filePath?: string): Promise<void> {
		const path = filePath ?? this.defaultPath;
		try {
			await fs.unlink(path);
			console.log(`✓ Blockchain file deleted: ${path}`);
		} catch (error: any) {
			if (error.code !== 'ENOENT') {
				console.error(`Failed to delete blockchain:`, error);
				throw error;
			}
		}
	}

	/**
	 * Export blockchain to JSON string
	 */
	exportToJSON(blocks: ReadonlyArray<Block>, balances: Map<string, number>): string {
		const data: IBlockchainData = {
			blocks: blocks.map(block => block.toJSON()),
			balances: Object.fromEntries(balances),
			timestamp: Date.now()
		};
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Reconstruct blocks from loaded data
	 */
	reconstructBlocks(data: IBlockchainData): Block[] {
		return data.blocks.map(blockData => {
			const transactions = blockData.transactions.map((txData: any) => {
				const tx = new Transaction(
					txData.amount,
					txData.payer,
					txData.payee,
					txData.fee ?? 0,
					txData.type ?? TransactionType.REGULAR,
					txData.timestamp
				);
				if (txData.signature) {
					tx.setSignature(txData.signature);
				}
				return tx;
			});

			const block = new Block(
				blockData.prevHash,
				transactions,
				blockData.minerAddress,
				blockData.ts,
				blockData.nonce
			);

			if (blockData.hash) {
				block.setHash(blockData.hash);
			}

			return block;
		});
	}
}
