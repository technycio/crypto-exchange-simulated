export interface ITransaction {
	amount: number;
	payer: string;
	payee: string;
	fee: number;
	timestamp: number;
	signature?: string;
}

export enum TransactionType {
	REGULAR = 'REGULAR',
	REWARD = 'REWARD',
	GENESIS = 'GENESIS'
}

export class Transaction implements ITransaction {
	public readonly timestamp: number;
	public signature?: string;

	constructor(
		public readonly amount: number,
		public readonly payer: string,
		public readonly payee: string,
		public readonly fee: number = 0,
		public readonly type: TransactionType = TransactionType.REGULAR,
		timestamp?: number
	) {
		this.timestamp = timestamp ?? Date.now();
	}

	/**
	 * Calculate total cost including fee
	 */
	getTotalCost(): number {
		return this.amount + this.fee;
	}

	/**
	 * Set transaction signature
	 */
	setSignature(signature: string): void {
		(this as { signature?: string }).signature = signature;
	}

	toString(): string {
		return JSON.stringify({
			amount: this.amount,
			payer: this.payer,
			payee: this.payee,
			fee: this.fee,
			timestamp: this.timestamp,
			type: this.type
		});
	}

	toJSON(): ITransaction {
		return {
			amount: this.amount,
			payer: this.payer,
			payee: this.payee,
			fee: this.fee,
			timestamp: this.timestamp,
			signature: this.signature
		};
	}

	/**
	 * Create a mining reward transaction
	 */
	static createReward(minerAddress: string, rewardAmount: number): Transaction {
		return new Transaction(
			rewardAmount,
			'MINING_REWARD',
			minerAddress,
			0,
			TransactionType.REWARD
		);
	}

	/**
	 * Create genesis transaction
	 */
	static createGenesis(): Transaction {
		return new Transaction(
			100,
			'genesis',
			'satoshi',
			0,
			TransactionType.GENESIS
		);
	}
}
