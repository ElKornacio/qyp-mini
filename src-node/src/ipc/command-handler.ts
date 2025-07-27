import { createInterface } from 'readline';
import { IPCProtocol } from './protocol.js';
import { BaseRequest, BaseResponse } from './types.js';

/**
 * Тип обработчика команды
 */
export type CommandProcessor<TRequest = any, TResponse = any> = (request: TRequest) => Promise<TResponse>;

/**
 * Универсальный обработчик команд через stdin/stdout
 */
export class CommandHandler {
	private processors = new Map<string, CommandProcessor>();

	/**
	 * Регистрирует обработчик команды
	 */
	registerCommand<TRequest extends BaseRequest = BaseRequest, TResponse = any>(
		command: string,
		processor: CommandProcessor<TRequest, TResponse>,
	): void {
		this.processors.set(command, processor);
	}

	/**
	 * Запускает обработку команд через stdin/stdout
	 */
	async start(): Promise<void> {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});

		rl.on('line', async (line: string) => {
			try {
				await this.processLine(line);
			} catch (error) {
				console.error('Критическая ошибка обработки строки:', error);
				this.sendErrorAndExit('Критическая ошибка обработки запроса', error);
			}
		});

		rl.on('close', () => {
			process.exit(0);
		});

		rl.on('error', error => {
			console.error('Ошибка чтения stdin:', error);
			this.sendErrorAndExit('Ошибка чтения stdin', error);
		});
	}

	/**
	 * Обрабатывает одну строку входных данных
	 */
	private async processLine(line: string): Promise<void> {
		// Декодируем запрос
		const request = IPCProtocol.decodeRequest<BaseRequest>(line);

		if (!request) {
			this.sendErrorAndExit('Не удалось декодировать запрос');
			return;
		}

		// Находим обработчик команды
		const processor = this.processors.get(request.command);

		if (!processor) {
			this.sendErrorAndExit(`Неизвестная команда: ${request.command}`);
			return;
		}

		try {
			// Выполняем команду
			const result = await processor(request);

			// Отправляем результат
			const response = IPCProtocol.createSuccessResponse(result);
			IPCProtocol.sendResponse(response);

			// Завершаем процесс успешно
			process.exit(0);
		} catch (error) {
			console.error(`Ошибка выполнения команды ${request.command}:`, error);
			this.sendErrorAndExit(`Ошибка выполнения команды ${request.command}`, error);
		}
	}

	/**
	 * Отправляет ошибку и завершает процесс
	 */
	private sendErrorAndExit(message: string, originalError?: unknown): void {
		const errorResponse = IPCProtocol.createErrorResponse(
			originalError
				? new Error(
						`${message}: ${originalError instanceof Error ? originalError.message : String(originalError)}`,
					)
				: new Error(message),
		);

		IPCProtocol.sendResponse(errorResponse);
		process.exit(1);
	}
}
