import { createInterface } from 'readline';
import { SmartBuffer } from '@tiny-utils/bytes';

async function compile(code: string) {
	// Заглушка для компиляции кода
	// TODO: Реализовать настоящую компиляцию TSX/React компонентов
	return `// Компилированный код\n${code}`;
}

/**
 * Обрабатывает JSON запрос от sidecar
 * @param {object} request - Декодированный JSON запрос
 * @returns {Promise<object>} - Ответ для sidecar
 */
async function processRequest(request: { command: string; code: string }) {
	try {
		switch (request.command) {
			case 'compile':
				if (!request.code) {
					throw new Error('Отсутствует код для компиляции');
				}
				const compiledCode = await compile(request.code);
				return {
					status: 'success',
					compiledCode: compiledCode,
				};

			default:
				throw new Error(`Неизвестная команда: ${request.command}`);
		}
	} catch (error) {
		return {
			status: 'error',
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Отправляет ответ в stdout как JSON+base64+\n
 * @param {object} response - Объект ответа
 */
function sendResponse(response: { status: string; message?: string; compiledCode?: string }) {
	const jsonString = JSON.stringify(response);
	const base64String = SmartBuffer.ofUTF8String(jsonString).toBase64String();
	process.stdout.write(base64String + '\n');
}

const command = process.argv[2];

switch (command) {
	case 'compile':
		// Читаем строки из stdin
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});

		rl.on('line', async line => {
			try {
				// Декодируем base64
				const jsonString = SmartBuffer.ofBase64String(line.trim()).toUTF8String();
				// Парсим JSON
				const request = JSON.parse(jsonString);

				// Обрабатываем запрос
				const response = await processRequest(request);

				// Отправляем ответ
				sendResponse(response);

				// Завершаем процесс после обработки
				process.exit(0);
			} catch (error) {
				console.error('Ошибка обработки запроса:', error);
				sendResponse({
					status: 'error',
					message: `Ошибка декодирования запроса: ${error instanceof Error ? error.message : String(error)}`,
				});
				process.exit(1);
			}
		});

		rl.on('close', () => {
			// Завершение чтения stdin
			process.exit(0);
		});
		break;

	case 'ping':
		const message = process.argv[3] || 'qYp-mini';
		console.log(`pong, ${message}`);
		break;

	default:
		console.error(`Неизвестная команда: ${command}`);
		process.exit(1);
}
