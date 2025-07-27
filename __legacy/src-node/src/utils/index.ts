/**
 * Безопасно парсит JSON с обработкой ошибок
 */
export function safeJsonParse<T>(json: string): T | null {
	try {
		return JSON.parse(json) as T;
	} catch {
		return null;
	}
}

/**
 * Создает ошибку с дополнительной информацией
 */
export function createError(message: string, originalError?: unknown): Error {
	const error = new Error(message);

	if (originalError instanceof Error) {
		error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
	}

	return error;
}
