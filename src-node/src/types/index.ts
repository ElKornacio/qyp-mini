import { BaseRequest } from '../ipc/index.js';

/**
 * Интерфейс для файла в виртуальной файловой системе
 */
export interface VirtualFile {
	/** Относительный путь к файлу */
	path: string;
	/** Содержимое файла */
	content: string;
}

/**
 * Настройки компиляции
 */
export interface CompileOptions {
	/** Минифицировать код */
	minify?: boolean;
	/** Включить source maps */
	sourcemap?: boolean;
	/** Дополнительные настройки Tailwind */
	tailwindConfig?: Record<string, any>;
}

/**
 * Запрос на компиляцию
 */
export interface CompileRequest extends BaseRequest {
	command: 'compile';
	/** Массив файлов для компиляции */
	files: VirtualFile[];
	/** Настройки компиляции (опционально) */
	options?: CompileOptions;
}

/**
 * Запрос ping для проверки работоспособности
 */
export interface PingRequest extends BaseRequest {
	command: 'ping';
	/** Сообщение для ответа */
	message?: string;
}

/**
 * Результат компиляции
 */
export interface CompileResult {
	/** Скомпилированный JavaScript код */
	javascript: string;
	/** Скомпилированные CSS стили */
	css: string;
	/** Source maps (если включены) */
	sourcemap?: string;
}

/**
 * Результат ping команды
 */
export interface PingResult {
	/** Ответное сообщение */
	message: string;
}

/**
 * Успешный ответ от сервиса
 */
export interface SuccessResponse<T = any> {
	status: 'success';
	result: T;
}

/**
 * Ответ с ошибкой
 */
export interface ErrorResponse {
	status: 'error';
	message: string;
	stack?: string;
}

/**
 * Объединенный тип ответа
 */
export type Response<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Объединение всех типов запросов
 */
export type Request = CompileRequest | PingRequest;
