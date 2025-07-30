import Database from '@tauri-apps/plugin-sql';
import { DatabaseConnection, DatabaseManager } from '../abstract/database';
import { DatabaseCredentials } from '@/types/database';

/**
 * Реализация подключения к БД для Tauri через tauri-plugin-sql
 */
export class TauriDatabaseConnection extends DatabaseConnection {
	private _database?: Database;

	constructor(databaseId: string, credentials: DatabaseCredentials) {
		super(databaseId, credentials);
	}

	async connect(): Promise<void> {
		if (this._status === 'connected') {
			return;
		}

		try {
			this.updateStatus('connecting');

			// Формируем connection string для PostgreSQL
			const connectionString = `postgres://${this.credentials.username}:${this.credentials.password}@${this.credentials.host}:${this.credentials.port || 5432}/${this.credentials.database}`;

			console.log('connectionString', connectionString);

			// Подключаемся через Tauri SQL plugin
			this._database = await Database.load(connectionString);

			console.log('yappy yappy ya');

			this.updateStatus('connected');

			// Получаем версию PostgreSQL
			try {
				const versionResult = await this._database.select<{ version: string }[]>('SELECT version()');
				if (versionResult.length > 0) {
					this.setVersion(versionResult[0].version);
				}
			} catch (versionError) {
				console.warn('Не удалось получить версию PostgreSQL:', versionError);
				// Не критично - продолжаем работу
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка подключения';
			this.updateStatus('error', errorMessage);
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		if (this._database) {
			try {
				await this._database.close();
			} catch (error) {
				console.error('Ошибка при закрытии подключения:', error);
			}
		}

		this._database = undefined;
		this.updateStatus('disconnected');
	}

	async select<T = any>(sql: string, params?: any[]): Promise<T[]> {
		if (!this.isConnected || !this._database) {
			await this.connect();
		}

		if (!this._database) {
			throw new Error('Connection is not established');
		}

		try {
			// Выполняем запрос через Tauri SQL plugin
			const result = await this._database.select<T[]>(sql, params);

			// Формируем результат в стандартном формате
			return result;
		} catch (error) {
			console.error('Error executing SQL query:', error);
			throw new Error(`Error executing query: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

/**
 * Менеджер подключений к БД для Tauri платформы
 */
export class TauriDatabaseManager implements DatabaseManager {
	createConnection(databaseId: string, credentials: DatabaseCredentials): DatabaseConnection {
		return new TauriDatabaseConnection(databaseId, credentials);
	}
}
