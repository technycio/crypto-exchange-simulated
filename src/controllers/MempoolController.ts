import { Transaction } from '../models/Transaction.js';

export interface IPendingTransaction {
	transaction: Transaction;
	priority: number;
}

/**
 * Manages pending transactions with priority queue based on fees
 */
export class MempoolController {
	private pendingTransactions: IPendingTransaction[];
	private maxPoolSize: number;

	constructor(maxPoolSize: number = 100) {
		this.pendingTransactions = [];
		this.maxPoolSize = maxPoolSize;
	}

	/**
	 * Add transaction to mempool
	 */
	addTransaction(transaction: Transaction): boolean {
		// Check if pool is full
		if (this.pendingTransactions.length >= this.maxPoolSize) {
			// Remove lowest priority transaction if new one has higher priority
			const lowestPriority = this.getLowestPriority();
			if (transaction.fee <= lowestPriority.priority) {
				return false;
			}
			this.removeLowestPriority();
		}

		const pending: IPendingTransaction = {
			transaction,
			priority: this.calculatePriority(transaction)
		};

		this.pendingTransactions.push(pending);
		this.sortByPriority();
		return true;
	}

	/**
	 * Get next batch of transactions for mining
	 */
	getTransactionsForBlock(maxTransactions: number): Transaction[] {
		const transactions = this.pendingTransactions
			.slice(0, maxTransactions)
			.map(pt => pt.transaction);

		// Remove selected transactions from pool
		this.pendingTransactions = this.pendingTransactions.slice(maxTransactions);
		
		return transactions;
	}

	/**
	 * Calculate transaction priority (higher fee = higher priority)
	 */
	private calculatePriority(transaction: Transaction): number {
		// Priority = fee / (age in seconds + 1)
		// Higher fee and older transactions get higher priority
		const age = (Date.now() - transaction.timestamp) / 1000;
		return transaction.fee * 1000 / (age + 1);
	}

	/**
	 * Sort transactions by priority (highest first)
	 */
	private sortByPriority(): void {
		this.pendingTransactions.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Get lowest priority transaction
	 */
	private getLowestPriority(): IPendingTransaction {
		return this.pendingTransactions[this.pendingTransactions.length - 1];
	}

	/**
	 * Remove lowest priority transaction
	 */
	private removeLowestPriority(): void {
		this.pendingTransactions.pop();
	}

	/**
	 * Get pending transaction count
	 */
	getPendingCount(): number {
		return this.pendingTransactions.length;
	}

	/**
	 * Get all pending transactions
	 */
	getAllPending(): readonly IPendingTransaction[] {
		return [...this.pendingTransactions];
	}

	/**
	 * Clear all pending transactions
	 */
	clear(): void {
		this.pendingTransactions = [];
	}

	/**
	 * Check if transaction exists in mempool
	 */
	hasTransaction(transaction: Transaction): boolean {
		return this.pendingTransactions.some(
			pt => pt.transaction.toString() === transaction.toString()
		);
	}
}
