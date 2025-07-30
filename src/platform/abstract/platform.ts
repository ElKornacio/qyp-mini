import { WindowManager } from './window';
import { StorageManager } from './storage';
import { DialogManager } from './dialogs';
import { DatabaseManager } from './database';

/**
 * Основной интерфейс платформы, объединяющий все менеджеры
 */
export interface PlatformManager {
	/**
	 * Менеджер управления окном
	 */
	window: WindowManager;

	/**
	 * Менеджер файловой системы
	 */
	storage: StorageManager;

	/**
	 * Менеджер диалогов
	 */
	dialogs: DialogManager;

	/**
	 * Менеджер подключений к БД
	 */
	database: DatabaseManager;

	/**
	 * Тип платформы
	 */
	readonly type: 'tauri' | 'browser';
}
