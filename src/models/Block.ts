import { createHash } from 'crypto';
import { Transaction } from './Transaction.js';

export interface IBlock {
	prevHash: string;
	transactions: Transaction[];
	ts: number;
	nonce: number;
	minerAddress: string;
	hash?: string;
}

export class Block implements IBlock {
	public nonce: number = Math.round(Math.random() * 999999999);
	private _hash?: string;

	constructor(
		public readonly prevHash: string,
		public readonly transactions: Transaction[],
		public readonly minerAddress: string,
		public readonly ts: number = Date.now(),
		nonce?: number
	) {
		if (nonce !== undefined) {
			this.nonce = nonce;
		}
	}

	get hash(): string {
		if (this._hash) {
			return this._hash;
		}
		return this.calculateHash();
	}

	calculateHash(): string {
		const str = JSON.stringify({
			prevHash: this.prevHash,
			transactions: this.transactions.map(tx => tx.toJSON()),
			ts: this.ts,
			nonce: this.nonce,
			minerAddress: this.minerAddress
		});
		const hash = createHash('SHA256');
		hash.update(str).end();
		return hash.digest('hex');
	}

	/**
	 * Set the hash after mining
	 */
	setHash(hash: string): void {
		this._hash = hash;
	}

	/**
	 * Calculate total fees in this block
	 */
	getTotalFees(): number {
		return this.transactions.reduce((sum, tx) => sum + tx.fee, 0);
	}

	/**
	 * Get number of transactions in block
	 */
	getTransactionCount(): number {
		return this.transactions.length;
	}

	toJSON(): Omit<IBlock, 'transactions'> & { transactions: ReturnType<Transaction['toJSON']>[] } {
		return {
			prevHash: this.prevHash,
			transactions: this.transactions.map(tx => tx.toJSON()),
			ts: this.ts,
			nonce: this.nonce,
			minerAddress: this.minerAddress,
			hash: this.hash
		};
	}
}
