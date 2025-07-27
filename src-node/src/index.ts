import { BaseResponse, CommandHandler, IPCProtocol } from './ipc/index.js';
import { CompileCommandHandler } from './request-handler/index.js';
import { CompileRequest, CompileResult } from './types/index.js';

/**
 * Обработчик команды ping для проверки работоспособности
 */
async function handlePingCommand(request: { command: 'ping'; message?: string }): Promise<{ message: string }> {
	const message = request.message || 'qYp-mini';
	return { message: `pong, ${message}` };
}

/**
 * Настройка и запуск приложения
 */
async function main(): Promise<void> {
	// Инициализируем обработчики команд
	const commandHandler = new CommandHandler();
	const compileHandler = new CompileCommandHandler();

	// Регистрируем команду compile
	commandHandler.registerCommand<CompileRequest, CompileResult>('compile', async request => {
		return await compileHandler.handle(request);
	});

	// Регистрируем команду ping (для тестирования через IPC)
	commandHandler.registerCommand<{ command: 'ping'; message?: string }, { message: string }>(
		'ping',
		handlePingCommand,
	);

	// Запускаем обработку команд через stdin/stdout
	await commandHandler.start();
}

/**
 * Показывает справку по использованию
 */
function showHelp(): void {
	console.log(`
qYp-mini Node.js Compiler Service

Использование:
  node index.js compile   - Запуск в режиме компиляции (основной режим)
  node index.js ping      - Проверка работоспособности (простой режим)  
  node index.js help      - Показать эту справку

Режим компиляции:
  Читает base64-encoded JSON запросы из stdin и возвращает результаты в stdout.
  
Формат запроса для compile:
  {
    "command": "compile",
    "files": [
      {
        "path": "index.tsx",
        "content": "import React from 'react'; ..."
      }
    ],
    "options": {
      "minify": false,
      "sourcemap": true
    }
  }

Формат запроса для ping:
  {
    "command": "ping",
    "message": "test"
  }
`);
}

// Обработчики для некорректного завершения процесса
process.on('uncaughtException', error => {
	console.error('Необработанное исключение:', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Необработанное отклонение промиса:', reason);
	process.exit(1);
});

// Запуск приложения
main().catch(error => {
	console.error('Ошибка запуска:', error);
	process.exit(1);
});
