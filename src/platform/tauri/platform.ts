import { PlatformManager } from '../abstract/platform';
import { TauriWindowManager } from './window';
import { TauriStorageManager } from './storage';
import { TauriDialogManager } from './dialogs';
import { TauriDatabaseManager } from './database';

/**
 * Tauri-реализация платформы
 */
export class TauriPlatform implements PlatformManager {
	readonly type = 'tauri' as const;

	public readonly window = new TauriWindowManager();
	public readonly storage = new TauriStorageManager();
	public readonly dialogs = new TauriDialogManager();
	public readonly database = new TauriDatabaseManager();
}
