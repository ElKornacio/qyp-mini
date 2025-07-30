import { DatabaseConnection } from '@/platform/abstract/database';

/**
 * Интерфейс для подключения к базе данных PostgreSQL
 */
export interface DatabaseCredentials {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	ssl?: boolean;
}

/**
 * Сущность базы данных
 */
export interface Database {
	id: string;
	name: string;
	credentials: DatabaseCredentials;
	connection: DatabaseConnection;
}

/**
 * Опции для создания нового подключения к БД
 */
export interface CreateDatabaseOptions {
	name: string;
	credentials: DatabaseCredentials;
}

/**
 * Опции для обновления БД
 */
export interface UpdateDatabaseOptions {
	name?: string;
	credentials?: Partial<DatabaseCredentials>;
}
