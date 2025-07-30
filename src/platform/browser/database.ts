import { DatabaseConnection, DatabaseManager } from '../abstract/database';
import { DatabaseCredentials } from '@/types/database';

/**
 * HTTP клиент для взаимодействия с прокси-бекендом
 */
class DatabaseHttpClient {
	private baseUrl: string;

	constructor(baseUrl: string = 'http://localhost:3000') {
		this.baseUrl = baseUrl;
	}

	/**
	 * Отправляет SELECT запрос через прокси-бекенд
	 */
	async select<T = any>(credentials: DatabaseCredentials, query: string, parameters?: any[]): Promise<T[]> {
		const response = await fetch(`${this.baseUrl}/api/select`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				credentials,
				query,
				parameters: parameters || [],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.error || 'Unknown error from proxy backend');
		}

		return result.data || [];
	}

	/**
	 * Проверяет доступность прокси-бекенда
	 */
	async checkHealth(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/health`);
			return response.ok;
		} catch {
			return false;
		}
	}
}

/**
 * Реализация подключения к БД для Browser платформы
 * Использует прокси-бекенд для выполнения SQL запросов
 */
export class BrowserDatabaseConnection extends DatabaseConnection {
	private httpClient: DatabaseHttpClient;

	constructor(databaseId: string, credentials: DatabaseCredentials, proxyUrl?: string) {
		super(databaseId, credentials);
		this.httpClient = new DatabaseHttpClient(proxyUrl);
	}

	async connect(): Promise<void> {
		if (this._status === 'connected') {
			return;
		}

		try {
			this.updateStatus('connecting');

			// Проверяем доступность прокси-бекенда
			const isHealthy = await this.httpClient.checkHealth();
			if (!isHealthy) {
				throw new Error('Proxy backend is not available');
			}

			// Тестируем подключение к БД через простой запрос
			try {
				await this.httpClient.select(this.credentials, 'SELECT 1 as test');
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
				throw new Error(`Database connection failed: ${errorMessage}`);
			}

			this.updateStatus('connected');

			// Получаем версию БД
			try {
				const versionQuery =
					this.credentials.type === 'postgres'
						? 'SELECT version() as version'
						: this.credentials.type === 'mysql'
							? 'SELECT VERSION() as version'
							: 'SELECT sqlite_version() as version';

				const versionResult = await this.httpClient.select(this.credentials, versionQuery);
				if (versionResult.length > 0 && versionResult[0].version) {
					this.setVersion(versionResult[0].version);
				}
			} catch (error) {
				// Если не удалось получить версию, это не критично
				console.warn('Failed to get database version:', error);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
			this.updateStatus('error', errorMessage);
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		this.updateStatus('disconnected');
	}

	async select<T = any>(sql: string, params?: any[]): Promise<T[]> {
		if (!this.isConnected) {
			await this.connect();
		}

		try {
			return await this.httpClient.select<T>(this.credentials, sql, params);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error executing select query:', error);
			throw new Error(`Error executing select query: ${errorMessage}`);
		}
	}
}

/**
 * Менеджер подключений к БД для Browser платформы
 */
export class BrowserDatabaseManager implements DatabaseManager {
	constructor(private proxyUrl?: string) {}

	createConnection(databaseId: string, credentials: DatabaseCredentials): DatabaseConnection {
		return new BrowserDatabaseConnection(databaseId, credentials, this.proxyUrl);
	}
}
