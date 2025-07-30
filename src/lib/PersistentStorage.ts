import { platform } from '@/platform';

/**
 * Класс для работы с постоянным хранилищем данных через платформенный слой
 * Использует гранулярное сохранение - каждый элемент в отдельном файле
 */
export class PersistentStorage {
	private static instance: PersistentStorage;
	private readonly appFolderName = 'qyp-mini';

	/**
	 * Получение singleton экземпляра
	 */
	public static getInstance(): PersistentStorage {
		if (!PersistentStorage.instance) {
			PersistentStorage.instance = new PersistentStorage();
		}
		return PersistentStorage.instance;
	}

	private constructor() {
		this.ensureAppDirectoryExists();
	}

	/**
	 * Создает основную папку приложения если она не существует
	 */
	private async ensureAppDirectoryExists(): Promise<void> {
		try {
			const appDirExists = await platform.storage.exists(this.appFolderName);

			if (!appDirExists) {
				await platform.storage.mkdir(this.appFolderName, true);
			}
		} catch (error) {
			console.error('Ошибка создания папки приложения:', error);
		}
	}

	/**
	 * Создает подпапку если она не существует
	 */
	private async ensureSubDirectoryExists(subDir: string): Promise<void> {
		try {
			const path = `${this.appFolderName}/${subDir}`;
			const dirExists = await platform.storage.exists(path);

			if (!dirExists) {
				await platform.storage.mkdir(path, true);
			}
		} catch (error) {
			console.error(`Ошибка создания подпапки ${subDir}:`, error);
		}
	}

	/**
	 * Сохраняет данные в JSON файл
	 */
	private async saveItem<T>(subDir: string, fileName: string, data: T): Promise<void> {
		try {
			await this.ensureSubDirectoryExists(subDir);

			const filePath = `${this.appFolderName}/${subDir}/${fileName}.json`;
			const jsonData = JSON.stringify(data, null, 2);

			await platform.storage.writeTextFile(filePath, jsonData);
		} catch (error) {
			console.error(`Ошибка сохранения данных в ${subDir}/${fileName}:`, error);
			throw error;
		}
	}

	/**
	 * Загружает данные из JSON файла
	 */
	private async loadItem<T>(subDir: string, fileName: string): Promise<T | null> {
		try {
			const filePath = `${this.appFolderName}/${subDir}/${fileName}.json`;
			const fileExists = await platform.storage.exists(filePath);

			if (!fileExists) {
				return null;
			}

			const jsonData = await platform.storage.readTextFile(filePath);
			return JSON.parse(jsonData) as T;
		} catch (error) {
			console.error(`Ошибка загрузки данных из ${subDir}/${fileName}:`, error);
			return null;
		}
	}

	/**
	 * Удаляет файл
	 */
	private async deleteItem(subDir: string, fileName: string): Promise<boolean> {
		try {
			const filePath = `${this.appFolderName}/${subDir}/${fileName}.json`;
			const fileExists = await platform.storage.exists(filePath);

			if (fileExists) {
				await platform.storage.removeFile(filePath);
				return true;
			}
			return false;
		} catch (error) {
			console.error(`Ошибка удаления файла ${subDir}/${fileName}:`, error);
			return false;
		}
	}

	/**
	 * Получает список ID всех элементов в папке
	 */
	private async getItemIds(subDir: string, prefix: string): Promise<string[]> {
		try {
			const dirPath = `${this.appFolderName}/${subDir}`;
			const dirExists = await platform.storage.exists(dirPath);

			if (!dirExists) {
				return [];
			}

			const entries = await platform.storage.readDir(dirPath);

			return entries
				.filter(entry => entry.isFile && entry.name?.endsWith('.json') && entry.name.startsWith(prefix))
				.map(entry => {
					const name = entry.name!;
					// Убираем префикс и .json
					return name.slice(prefix.length, -5);
				});
		} catch (error) {
			console.error(`Ошибка получения списка ID из ${subDir}:`, error);
			return [];
		}
	}

	// === МЕТОДЫ ДЛЯ РАБОТЫ С БАЗАМИ ДАННЫХ ===

	/**
	 * Сохраняет базу данных
	 */
	public async saveDatabase<T>(id: string, database: T): Promise<void> {
		return this.saveItem('databases', `database-${id}`, database);
	}

	/**
	 * Загружает базу данных по ID
	 */
	public async loadDatabase<T>(id: string): Promise<T | null> {
		return this.loadItem<T>('databases', `database-${id}`);
	}

	/**
	 * Удаляет базу данных
	 */
	public async deleteDatabase(id: string): Promise<boolean> {
		return this.deleteItem('databases', `database-${id}`);
	}

	/**
	 * Загружает все базы данных
	 */
	public async loadAllDatabases<T>(): Promise<T[]> {
		try {
			const ids = await this.getItemIds('databases', 'database-');
			const databases: T[] = [];

			for (const id of ids) {
				const database = await this.loadDatabase<T>(id);
				if (database) {
					databases.push(database);
				}
			}

			return databases;
		} catch (error) {
			console.error('Ошибка загрузки всех баз данных:', error);
			return [];
		}
	}

	// === МЕТОДЫ ДЛЯ РАБОТЫ С ДАШБОРДАМИ ===

	/**
	 * Сохраняет дашборд
	 */
	public async saveDashboard<T>(id: string, dashboard: T): Promise<void> {
		return this.saveItem('dashboards', `dashboard-${id}`, dashboard);
	}

	/**
	 * Загружает дашборд по ID
	 */
	public async loadDashboard<T>(id: string): Promise<T | null> {
		return this.loadItem<T>('dashboards', `dashboard-${id}`);
	}

	/**
	 * Удаляет дашборд
	 */
	public async deleteDashboard(id: string): Promise<boolean> {
		return this.deleteItem('dashboards', `dashboard-${id}`);
	}

	/**
	 * Загружает все дашборды
	 */
	public async loadAllDashboards<T>(): Promise<T[]> {
		try {
			const ids = await this.getItemIds('dashboards', 'dashboard-');
			const dashboards: T[] = [];

			for (const id of ids) {
				const dashboard = await this.loadDashboard<T>(id);
				if (dashboard) {
					dashboards.push(dashboard);
				}
			}

			return dashboards;
		} catch (error) {
			console.error('Ошибка загрузки всех дашбордов:', error);
			return [];
		}
	}

	// === МЕТОДЫ ДЛЯ РАБОТЫ С ВИДЖЕТАМИ ===

	/**
	 * Сохраняет метаданные виджета
	 */
	public async saveWidgetMetadata<T>(id: string, metadata: T): Promise<void> {
		return this.saveItem('widgets/metadata', `widget-${id}`, metadata);
	}

	/**
	 * Загружает метаданные виджета
	 */
	public async loadWidgetMetadata<T>(id: string): Promise<T | null> {
		return this.loadItem<T>('widgets/metadata', `widget-${id}`);
	}

	/**
	 * Удаляет метаданные виджета
	 */
	public async deleteWidgetMetadata(id: string): Promise<boolean> {
		return this.deleteItem('widgets/metadata', `widget-${id}`);
	}

	/**
	 * Загружает все метаданные виджетов
	 */
	public async loadAllWidgetMetadata<T>(): Promise<T[]> {
		try {
			const ids = await this.getItemIds('widgets/metadata', 'widget-');
			const widgets: T[] = [];

			for (const id of ids) {
				const widget = await this.loadWidgetMetadata<T>(id);
				if (widget) {
					widgets.push(widget);
				}
			}

			return widgets;
		} catch (error) {
			console.error('Ошибка загрузки всех виджетов:', error);
			return [];
		}
	}

	// === МЕТОДЫ ДЛЯ РАБОТЫ С ИСТОРИЕЙ ЧАТОВ ===

	/**
	 * Сохраняет чат
	 */
	public async saveChat<T>(id: string, chat: T): Promise<void> {
		return this.saveItem('chats', `chat-${id}`, chat);
	}

	/**
	 * Загружает чат по ID
	 */
	public async loadChat<T>(id: string): Promise<T | null> {
		return this.loadItem<T>('chats', `chat-${id}`);
	}

	/**
	 * Удаляет чат
	 */
	public async deleteChat(id: string): Promise<boolean> {
		return this.deleteItem('chats', `chat-${id}`);
	}

	/**
	 * Загружает все чаты
	 */
	public async loadAllChats<T>(): Promise<T[]> {
		try {
			const ids = await this.getItemIds('chats', 'chat-');
			const chats: T[] = [];

			for (const id of ids) {
				const chat = await this.loadChat<T>(id);
				if (chat) {
					chats.push(chat);
				}
			}

			return chats;
		} catch (error) {
			console.error('Ошибка загрузки всех чатов:', error);
			return [];
		}
	}

	// === ОБЩИЕ МЕТОДЫ ===

	/**
	 * Сохраняет настройки приложения
	 */
	public async saveAppSettings<T>(settings: T): Promise<void> {
		return this.saveItem('settings', 'app', settings);
	}

	/**
	 * Загружает настройки приложения
	 */
	public async loadAppSettings<T>(): Promise<T | null> {
		return this.loadItem<T>('settings', 'app');
	}

	/**
	 * Проверяет существование файла
	 */
	public async fileExists(subDir: string, fileName: string): Promise<boolean> {
		try {
			const filePath = `${this.appFolderName}/${subDir}/${fileName}.json`;
			return await platform.storage.exists(filePath);
		} catch (error) {
			console.error(`Ошибка проверки существования файла ${subDir}/${fileName}:`, error);
			return false;
		}
	}

	/**
	 * Экспортирует все данные приложения
	 */
	public async exportAllData(): Promise<{
		databases: unknown[];
		dashboards: unknown[];
		widgets: unknown[];
		chats: unknown[];
		settings: unknown;
	}> {
		try {
			const [databases, dashboards, widgets, chats, settings] = await Promise.all([
				this.loadAllDatabases(),
				this.loadAllDashboards(),
				this.loadAllWidgetMetadata(),
				this.loadAllChats(),
				this.loadAppSettings() || {},
			]);

			return {
				databases,
				dashboards,
				widgets,
				chats,
				settings,
			};
		} catch (error) {
			console.error('Ошибка экспорта данных:', error);
			throw error;
		}
	}

	/**
	 * Импортирует данные приложения
	 */
	public async importAllData(data: {
		databases?: any[];
		dashboards?: any[];
		widgets?: any[];
		chats?: any[];
		settings?: unknown;
	}): Promise<void> {
		try {
			// Импортируем базы данных
			if (data.databases) {
				for (const database of data.databases) {
					if (database.id) {
						await this.saveDatabase(database.id, database);
					}
				}
			}

			// Импортируем дашборды
			if (data.dashboards) {
				for (const dashboard of data.dashboards) {
					if (dashboard.id) {
						await this.saveDashboard(dashboard.id, dashboard);
					}
				}
			}

			// Импортируем виджеты
			if (data.widgets) {
				for (const widget of data.widgets) {
					if (widget.id) {
						await this.saveWidgetMetadata(widget.id, widget);
					}
				}
			}

			// Импортируем чаты
			if (data.chats) {
				for (const chat of data.chats) {
					if (chat.id) {
						await this.saveChat(chat.id, chat);
					}
				}
			}

			// Импортируем настройки
			if (data.settings) {
				await this.saveAppSettings(data.settings);
			}
		} catch (error) {
			console.error('Ошибка импорта данных:', error);
			throw error;
		}
	}
}

// Экспортируем singleton экземпляр для удобства использования
export const persistentStorage = PersistentStorage.getInstance();
