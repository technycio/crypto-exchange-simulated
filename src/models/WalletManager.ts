import { Wallet } from './Wallet.js';

export interface IWalletInfo {
	name: string;
	publicKey: string;
	balance: number;
}

/**
 * Manages multiple wallets with names and balances
 */
export class WalletManager {
	private wallets: Map<string, Wallet>;
	private walletNames: Map<string, string>; // publicKey -> name

	constructor() {
		this.wallets = new Map();
		this.walletNames = new Map();
	}

	/**
	 * Create a new wallet with a given name
	 */
	createWallet(name: string): Wallet {
		if (this.wallets.has(name)) {
			throw new Error(`Wallet with name "${name}" already exists`);
		}

		const wallet = new Wallet();
		this.wallets.set(name, wallet);
		this.walletNames.set(wallet.getPublicKey(), name);
		return wallet;
	}

	/**
	 * Get wallet by name
	 */
	getWallet(name: string): Wallet | undefined {
		return this.wallets.get(name);
	}

	/**
	 * Get wallet name by public key
	 */
	getWalletName(publicKey: string): string | undefined {
		return this.walletNames.get(publicKey);
	}

	/**
	 * Get all wallet names
	 */
	getAllWalletNames(): string[] {
		return Array.from(this.wallets.keys());
	}

	/**
	 * Get all wallets with their info
	 */
	getAllWallets(): Map<string, Wallet> {
		return new Map(this.wallets);
	}

	/**
	 * Check if wallet exists by name
	 */
	hasWallet(name: string): boolean {
		return this.wallets.has(name);
	}

	/**
	 * Get wallet count
	 */
	getWalletCount(): number {
		return this.wallets.size;
	}

	/**
	 * Get wallet info for display
	 */
	getWalletInfo(name: string, balance: number): IWalletInfo | undefined {
		const wallet = this.wallets.get(name);
		if (!wallet) return undefined;

		return {
			name,
			publicKey: wallet.getPublicKey(),
			balance
		};
	}

	/**
	 * Clear all wallets
	 */
	clear(): void {
		this.wallets.clear();
		this.walletNames.clear();
	}
}
