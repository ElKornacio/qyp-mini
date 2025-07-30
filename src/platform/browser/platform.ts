import { PlatformManager } from '../abstract/platform';
import { BrowserWindowManager } from './window';
import { BrowserStorageManager } from './storage';
import { BrowserDialogManager } from './dialogs';
import { BrowserDatabaseManager } from './database';

/**
 * Browser-реализация платформы
 */
export class BrowserPlatform implements PlatformManager {
	readonly type = 'browser' as const;

	public readonly window = new BrowserWindowManager();
	public readonly storage = new BrowserStorageManager();
	public readonly dialogs = new BrowserDialogManager();
	public readonly database = new BrowserDatabaseManager();
}
