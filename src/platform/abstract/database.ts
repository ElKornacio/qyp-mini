import { observable, makeObservable, computed, action } from 'mobx';
import { DatabaseCredentials } from '@/types/database';

/**
 * Статус подключения к базе данных
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Абстрактный класс подключения к БД
 * Две реализации: для Tauri и для Browser
 */
export abstract class DatabaseConnection {
	@observable protected _status: ConnectionStatus = 'disconnected';
	@observable protected _lastError?: string;
	@observable protected _version?: string;

	constructor(
		public readonly databaseId: string,
		protected readonly credentials: DatabaseCredentials,
	) {
		makeObservable(this);
	}

	@computed
	get status(): ConnectionStatus {
		return this._status;
	}

	@computed
	get lastError(): string | undefined {
		return this._lastError;
	}

	@computed
	get version(): string | undefined {
		return this._version;
	}

	/**
	 * Устанавливает подключение к БД
	 */
	abstract connect(): Promise<void>;

	/**
	 * Закрывает подключение к БД
	 */
	abstract disconnect(): Promise<void>;

	/**
	 * Выполняет SQL запрос
	 */
	abstract select<T = any>(sql: string, params?: any[]): Promise<T[]>;

	/**
	 * Проверяет активность подключения
	 */
	@computed
	get isConnected(): boolean {
		return this._status === 'connected';
	}

	/**
	 * Получает информацию о подключении
	 */
	@computed
	get connectionInfo() {
		return {
			host: this.credentials.host,
			database: this.credentials.database,
			username: this.credentials.username,
			version: this._version,
		};
	}

	/**
	 * Обновляет статус подключения
	 */
	@action
	protected updateStatus(newStatus: ConnectionStatus, error?: string): void {
		this._status = newStatus;
		this._lastError = error;

		if (newStatus === 'disconnected') {
			this._version = undefined;
		}
	}

	/**
	 * Устанавливает версию БД
	 */
	@action
	protected setVersion(version: string): void {
		this._version = version;
	}
}

/**
 * Менеджер подключений к БД для конкретной платформы
 * Часть PlatformManager абстракции
 */
export interface DatabaseManager {
	/**
	 * Создает подключение к БД для данной платформы
	 */
	createConnection(databaseId: string, credentials: DatabaseCredentials): DatabaseConnection;
}
