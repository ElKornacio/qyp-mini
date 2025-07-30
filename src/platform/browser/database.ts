import { DatabaseConnection, DatabaseManager } from '../abstract/database';
import { DatabaseCredentials } from '@/types/database';

/**
 * Мок-реализация подключения к БД для Browser
 * Эмулирует работу с базой данных для разработки
 */
export class BrowserDatabaseConnection extends DatabaseConnection {
	constructor(databaseId: string, credentials: DatabaseCredentials) {
		super(databaseId, credentials);
	}

	async connect(): Promise<void> {
		if (this._status === 'connected') {
			return;
		}

		try {
			this.updateStatus('connecting');

			// Эмулируем задержку подключения
			await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

			// Эмулируем возможные ошибки
			if (this.credentials.host === 'error') {
				throw new Error('Cannot connect to server');
			}
			if (this.credentials.username === 'invalid') {
				throw new Error('Invalid credentials');
			}

			this.updateStatus('connected');

			// Эмулируем версию PostgreSQL
			this.setVersion(
				'PostgreSQL 15.4 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0, 64-bit',
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
			this.updateStatus('error', errorMessage);
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		// Эмулируем задержку отключения
		await new Promise(resolve => setTimeout(resolve, 500));
		this.updateStatus('disconnected');
	}

	async select<T = any>(sql: string): Promise<T[]> {
		if (!this.isConnected) {
			await this.connect();
		}

		try {
			// Эмулируем задержку выполнения
			await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 1000));

			// Простая эмуляция результата на основе типа запроса
			if (sql === 'SELECT COUNT(*) as count FROM customer') {
				return [{ count: 123 }] as T[];
			}
			if (sql.toLowerCase().includes('select')) {
				return [
					{ id: 1, name: 'Пример 1', value: 42, created_at: new Date() },
					{ id: 2, name: 'Пример 2', value: 84, created_at: new Date() },
					{ id: 3, name: 'Пример 3', value: 126, created_at: new Date() },
				] as T[];
			} else {
				return [] as T[];
			}
		} catch (error) {
			console.error('Error executing select query:', error);
			throw new Error(
				`Error executing select query: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}
}

/**
 * Менеджер подключений к БД для Browser платформы
 */
export class BrowserDatabaseManager implements DatabaseManager {
	createConnection(databaseId: string, credentials: DatabaseCredentials): DatabaseConnection {
		return new BrowserDatabaseConnection(databaseId, credentials);
	}
}
