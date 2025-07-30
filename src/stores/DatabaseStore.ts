import { observable, action, makeObservable, runInAction, computed } from 'mobx';
import { Database, CreateDatabaseOptions, UpdateDatabaseOptions } from '@/types/database';
import { DatabaseConnection } from '@/platform/abstract/database';
import { persistentStorage } from '@/lib/PersistentStorage';
import { platform } from '@/platform';

export class DatabaseStore {
	// Метаданные БД (без подключений)
	@observable private databases = new Map<string, Database>();

	// UI состояние
	@observable selectedDatabaseId: string | null = null;
	@observable isLoading: boolean = false;

	constructor() {
		makeObservable(this);
	}

	// Вычисляемые свойства
	@computed
	get allDatabases(): Database[] {
		return Array.from(this.databases.values());
	}

	// === МЕТОДЫ УПРАВЛЕНИЯ БАЗАМИ ДАННЫХ ===

	/**
	 * Создает новое подключение к базе данных
	 */
	@action
	async createDatabase(options: CreateDatabaseOptions): Promise<Database> {
		const id = `db_${Date.now()}`;
		const database: Database = {
			id,
			name: options.name,
			credentials: options.credentials,
			connection: platform.database.createConnection(id, options.credentials),
		};

		this.databases.set(id, database);

		// Сохраняем конкретную базу данных в файловую систему
		await persistentStorage.saveDatabase(id, database);

		return database;
	}

	/**
	 * Обновляет существующую базу данных
	 */
	@action
	async updateDatabase(id: string, options: UpdateDatabaseOptions): Promise<Database> {
		const database = this.databases.get(id);
		if (!database) {
			throw new Error(`База данных с ID ${id} не найдена`);
		}

		let newConnection: DatabaseConnection;
		if (options.credentials) {
			await database.connection.disconnect();
			const newCredentials = {
				...database.credentials,
				...options.credentials,
			};
			newConnection = platform.database.createConnection(id, newCredentials);
		} else {
			newConnection = database.connection;
		}

		const updatedDatabase: Database = {
			...database,
			...options,
			credentials: options.credentials
				? { ...database.credentials, ...options.credentials }
				: database.credentials,
			connection: newConnection,
		};

		this.databases.set(id, updatedDatabase);

		// Сохраняем обновленную базу данных в файловую систему
		await persistentStorage.saveDatabase(id, {
			...updatedDatabase,
			connection: undefined,
		});

		return updatedDatabase;
	}

	/**
	 * Удаляет базу данных
	 */
	@action
	async removeDatabase(id: string): Promise<boolean> {
		const database = this.databases.get(id);
		if (!database) {
			return false;
		}

		// Если подключена, сначала отключаем
		await database.connection.disconnect();

		runInAction(() => {
			this.databases.delete(id);
			// Сбрасываем выбор, если удаляем выбранную БД
			if (this.selectedDatabaseId === id) {
				this.selectedDatabaseId = null;
			}
		});

		// Удаляем из файловой системы
		await persistentStorage.deleteDatabase(id);

		return true;
	}

	// === МЕТОДЫ УПРАВЛЕНИЯ ПОДКЛЮЧЕНИЯМИ ===

	/**
	 * Получает базу данных по ID
	 */
	getDatabase(id: string): Database | undefined {
		return this.databases.get(id);
	}

	// === ПРИВАТНЫЕ МЕТОДЫ ===

	/**
	 * Загружает базы данных из PersistentStorage
	 */
	@action
	async loadDatabases() {
		try {
			this.isLoading = true;

			const databases: Omit<Database, 'connection'>[] =
				await persistentStorage.loadAllDatabases<Omit<Database, 'connection'>>();

			runInAction(() => {
				this.databases.clear();
				databases.forEach(db => {
					this.databases.set(db.id, {
						...db,
						connection: platform.database.createConnection(db.id, db.credentials),
					});
				});
			});
		} catch (error) {
			console.error('Ошибка загрузки баз данных:', error);
		} finally {
			this.isLoading = false;
		}
	}
}

export const databaseStore = new DatabaseStore();

// @ts-ignore
window.databaseStore = databaseStore;
