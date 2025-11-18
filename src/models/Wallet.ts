import { generateKeyPairSync } from 'crypto';

export interface IWalletKeys {
	publicKey: string;
	privateKey: string;
}

export class Wallet implements IWalletKeys {
	public readonly publicKey: string;
	public readonly privateKey: string;

	constructor() {
		const keypair = generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: { type: 'spki', format: 'pem' },
			privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
		});

		this.privateKey = keypair.privateKey;
		this.publicKey = keypair.publicKey;
	}

	getPublicKey(): string {
		return this.publicKey;
	}

	getPrivateKey(): string {
		return this.privateKey;
	}
}
