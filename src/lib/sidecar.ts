import { SidecarExecutor } from './SidecarExecutor';
import { SerializedVirtualNode } from 'src-node/src/virtual-fs/types';
import { CompileComponentRequest, CompileComponentResponse, PingRequest, PingResponse } from 'src-node/src/types';

/**
 * Класс для работы с Node.js sidecar
 */
export class QypSidecar {
	static async ping(msg: string): Promise<PingResponse> {
		const request: PingRequest = {
			command: 'ping',
			message: msg,
		};

		const response = await SidecarExecutor.execute<PingResponse>({
			args: ['ping', msg],
			request,
		});

		if (response.status === 'error') {
			throw new Error(response.error || 'Ошибка пинга Node.js sidecar');
		}

		return response.result;
	}

	/**
	 * Компилирует код компонента через Node.js sidecar
	 * @param code - TSX/React код для компиляции
	 * @returns Результат компиляции
	 */
	static async compile(
		serializedVFS: SerializedVirtualNode[],
		entryPoint: string,
	): Promise<CompileComponentResponse> {
		// Подготавливаем запрос для компиляции
		const request: CompileComponentRequest = {
			command: 'compile',
			serializedVFS,
			entryPoint,
		};

		// Выполняем команду через sidecar
		const response = await SidecarExecutor.execute<CompileComponentResponse>({
			args: ['compile'],
			request,
		});

		if (response.status === 'error') {
			throw new Error(response.error || 'Ошибка компиляции в sidecar');
		}

		return response.result;
	}
}
