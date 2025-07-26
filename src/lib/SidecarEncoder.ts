import { SmartBuffer } from '@tiny-utils/bytes';

// Типы для запросов к sidecar
export interface SidecarRequest {
	command: string;
	code?: string;
	[key: string]: any;
}

// Типы для ответов от sidecar
export interface SidecarResponse {
	status: 'success' | 'error';
	message?: string;
	timestamp: string;
}

/**
 * Утилиты для кодирования/декодирования запросов и ответов sidecar
 */
export class SidecarEncoder {
	/**
	 * Кодирует запрос в формат base64+\n для отправки в sidecar
	 * @param request - JSON объект запроса
	 * @returns Закодированная строка
	 */
	static encodeRequest(request: SidecarRequest): string {
		const jsonString = JSON.stringify(request);
		const base64String = SmartBuffer.ofUTF8String(jsonString).toBase64String();
		return base64String + '\n';
	}

	/**
	 * Декодирует ответ от sidecar из формата base64
	 * @param base64Response - base64 строка ответа
	 * @returns Декодированный JSON объект
	 */
	static decodeResponse(base64Response: string): any {
		try {
			const jsonString = SmartBuffer.ofBase64String(base64Response.trim()).toUTF8String();
			return JSON.parse(jsonString);
		} catch (error) {
			throw new Error(`Ошибка декодирования ответа от sidecar: ${error}`);
		}
	}
}
