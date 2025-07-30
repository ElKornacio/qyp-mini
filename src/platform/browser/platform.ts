import { PlatformManager } from '../abstract/platform';
import { BrowserWindowManager } from './window';
import { BrowserStorageManager } from './storage';
import { BrowserDialogManager } from './dialogs';
import { BrowserDatabaseManager } from './database';

/**
 * Опции для конфигурации Browser платформы
 */
export interface BrowserPlatformOptions {
	proxyUrl?: string;
}

/**
 * Browser-реализация платформы
 */
export class BrowserPlatform implements PlatformManager {
	readonly type = 'browser' as const;

	public readonly window = new BrowserWindowManager();
	public readonly storage = new BrowserStorageManager();
	public readonly dialogs = new BrowserDialogManager();
	public readonly database: BrowserDatabaseManager;

	constructor(options: BrowserPlatformOptions = {}) {
		// Используем переданный URL или переменную окружения, или дефолтный URL
		const proxyUrl = options.proxyUrl || import.meta.env.VITE_DATABASE_PROXY_URL || 'https://proxy.qyp.ai';

		this.database = new BrowserDatabaseManager(proxyUrl);
	}
}
