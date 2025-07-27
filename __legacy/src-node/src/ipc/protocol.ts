import { SmartBuffer } from '@tiny-utils/bytes';
import { safeJsonParse, createError } from '../utils/index.js';
import { BaseErrorResponse, BaseResponse, BaseSuccessResponse } from './types.js';

/**
 * Универсальный IPC протокол для работы с stdin/stdout через base64 + JSON
 */
export class IPCProtocol {
	/**
	 * Декодирует запрос из base64 строки
	 */
	static decodeRequest<T = any>(base64String: string): T | null {
		try {
			const jsonString = SmartBuffer.ofBase64String(base64String.trim()).toUTF8String();
			const request = safeJsonParse<T>(jsonString);

			if (!request) {
				throw createError('Не удалось парсить JSON запрос');
			}

			return request;
		} catch (error) {
			console.error('Ошибка декодирования запроса:', error);
			return null;
		}
	}

	/**
	 * Кодирует ответ в base64 строку
	 */
	static encodeResponse<T = any>(response: T): string {
		try {
			const jsonString = JSON.stringify(response);
			return SmartBuffer.ofUTF8String(jsonString).toBase64String();
		} catch (error) {
			// Fallback для критических ошибок кодирования
			const fallbackResponse = {
				status: 'error',
				message: `Ошибка кодирования ответа: ${error instanceof Error ? error.message : String(error)}`,
			};

			const fallbackJson = JSON.stringify(fallbackResponse);
			return SmartBuffer.ofUTF8String(fallbackJson).toBase64String();
		}
	}

	/**
	 * Отправляет ответ в stdout
	 */
	static sendResponse<T extends BaseResponse>(response: T): void {
		const encodedResponse = this.encodeResponse(response);
		process.stdout.write(encodedResponse + '\n');
	}

	/**
	 * Создает стандартный ответ с ошибкой
	 */
	static createErrorResponse(error: unknown): BaseErrorResponse {
		if (error instanceof Error) {
			return {
				status: 'error',
				error: error.message,
				stack: error.stack,
			};
		}

		return {
			status: 'error',
			error: String(error),
		};
	}

	/**
	 * Создает стандартный успешный ответ
	 */
	static createSuccessResponse<T = any>(result: T): BaseSuccessResponse<T> {
		return {
			status: 'success',
			result: result,
		};
	}
}
