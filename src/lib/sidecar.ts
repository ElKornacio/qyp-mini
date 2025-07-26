import { SidecarRequest, SidecarResponse } from './SidecarEncoder';
import { SidecarExecutor } from './SidecarExecutor';

export interface CompileComponentResponse extends SidecarResponse {
	compiled?: boolean;
	component?: string;
	compiledCode?: string;
}

/**
 * Класс для работы с Node.js sidecar
 */
export class QypSidecar {
	/**
	 * Компилирует код компонента через Node.js sidecar
	 * @param code - TSX/React код для компиляции
	 * @returns Результат компиляции
	 */
	static async compile(code: string): Promise<CompileComponentResponse> {
		try {
			// Подготавливаем запрос для компиляции
			const request: SidecarRequest = {
				command: 'compile',
				code: code,
			};

			// Выполняем команду через sidecar
			const response = await SidecarExecutor.execute<CompileComponentResponse>({
				args: ['compile'],
				request,
			});

			if (response.status === 'error') {
				throw new Error(response.message || 'Ошибка компиляции в sidecar');
			}

			return {
				status: 'success',
				compiled: true,
				compiledCode: response.compiledCode,
				timestamp: response.timestamp,
			};
		} catch (error) {
			console.error('Ошибка компиляции в sidecar:', error);
			return {
				status: 'error',
				compiled: false,
				message: error instanceof Error ? error.message : 'Неизвестная ошибка компиляции',
				timestamp: new Date().toISOString(),
			};
		}
	}
}
