import { CompileRequest, CompileResult } from '../types/index.js';
import { createError } from '../utils/index.js';
import { Compiler } from '../compiler/index.js';

/**
 * Обработчик команды компиляции
 */
export class CompileCommandHandler {
	private compiler: Compiler;

	constructor() {
		this.compiler = new Compiler();
	}

	/**
	 * Обрабатывает запрос на компиляцию
	 */
	async handle(request: CompileRequest): Promise<CompileResult> {
		try {
			// Валидация запроса
			if (!request.files || !Array.isArray(request.files)) {
				throw createError('Отсутствуют файлы для компиляции');
			}

			if (request.files.length === 0) {
				throw createError('Массив файлов пуст');
			}

			// Компиляция
			const result = await this.compiler.compile(request.files, request.options);

			return result;
		} catch (error) {
			throw createError('Ошибка обработки запроса компиляции', error);
		}
	}
}
