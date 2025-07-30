/**
 * Типы для системы постоянного хранилища данных
 */

import type { Database } from './database';
import type { Dashboard } from './dashboard';
import type { WidgetMetadata } from './widget';

/**
 * Структура настроек приложения
 */
export interface AppSettings {
	theme: 'light' | 'dark' | 'system';
	language: 'en' | 'ru';
	autoSave: boolean;
	backupInterval: number; // в минутах
	maxBackups: number;
	telemetryEnabled: boolean;
	debugMode: boolean;
	windowSize?: {
		width: number;
		height: number;
	};
	windowPosition?: {
		x: number;
		y: number;
	};
}

/**
 * Структура сообщения в чате
 */
export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	metadata?: {
		tokens?: number;
		model?: string;
		executionTime?: number;
	};
}

/**
 * Структура чата
 */
export interface Chat {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
	metadata?: {
		databaseId?: string;
		dashboardId?: string;
		tags?: string[];
	};
}

/**
 * Структура истории чатов (краткая информация)
 */
export interface ChatHistoryItem {
	id: string;
	title: string;
	lastMessage?: string;
	messageCount: number;
	createdAt: Date;
	updatedAt: Date;
	metadata?: {
		databaseId?: string;
		dashboardId?: string;
		tags?: string[];
	};
}

/**
 * Структура экспорта данных приложения
 */
export interface AppDataExport {
	version: string;
	exportedAt: Date;
	data: {
		databases: Database[];
		dashboards: Dashboard[];
		widgets: WidgetMetadata[];
		chatHistory: ChatHistoryItem[];
		chats: Chat[];
		settings: AppSettings;
	};
}

/**
 * Структура импорта данных приложения
 */
export interface AppDataImport {
	databases?: Database[];
	dashboards?: Dashboard[];
	widgets?: WidgetMetadata[];
	chatHistory?: ChatHistoryItem[];
	chats?: Chat[];
	settings?: Partial<AppSettings>;
}
