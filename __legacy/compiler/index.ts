import { VirtualFile, CompileOptions, CompileResult } from '../types/index.js';
import { createError } from '../utils/index.js';
import { ESBuildCompiler } from '../../src-node/src/compiler/esbuild-compiler.js';
import { PostCSSCompiler } from './postcss-compiler.js';

/**
 * Основной компилятор, который координирует работу всех компиляторов
 */
export class Compiler {
	private esbuildCompiler: ESBuildCompiler;
	private postcssCompiler: PostCSSCompiler;

	constructor() {
		this.esbuildCompiler = new ESBuildCompiler();
		this.postcssCompiler = new PostCSSCompiler();
	}

	/**
	 * Компилирует виртуальные файлы в JavaScript и CSS
	 */
	async compile(files: VirtualFile[], options: CompileOptions = {}): Promise<CompileResult> {
		try {
			// Валидация входных данных
			this.validateFiles(files);

			// Параллельная компиляция JavaScript и CSS
			const [jsResult, css] = await Promise.all([
				this.esbuildCompiler.compile(files, options),
				this.postcssCompiler.compile(files, options),
			]);

			return {
				javascript: jsResult.code,
				css: css,
				sourcemap: jsResult.sourcemap,
			};
		} catch (error) {
			throw createError('Ошибка компиляции', error);
		}
	}

	/**
	 * Валидирует входные файлы
	 */
	private validateFiles(files: VirtualFile[]): void {
		if (!files || files.length === 0) {
			throw createError('Не предоставлены файлы для компиляции');
		}

		// Проверяем, что есть хотя бы один .tsx файл
		const hasTsxFiles = files.some(file => file.path.endsWith('.tsx'));
		if (!hasTsxFiles) {
			throw createError('Отсутствуют .tsx файлы для компиляции');
		}

		// Валидируем каждый файл
		for (const file of files) {
			if (!file.path) {
				throw createError('Файл должен иметь путь');
			}

			if (typeof file.content !== 'string') {
				throw createError(`Содержимое файла ${file.path} должно быть строкой`);
			}

			// Проверяем допустимые расширения
			const allowedExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];
			const hasAllowedExtension = allowedExtensions.some(ext => file.path.endsWith(ext));

			if (!hasAllowedExtension) {
				throw createError(
					`Файл ${file.path} имеет недопустимое расширение. ` + `Разрешены: ${allowedExtensions.join(', ')}`,
				);
			}
		}
	}
}

// Экспортируем также отдельные компиляторы для гибкости
export { ESBuildCompiler } from '../../src-node/src/compiler/esbuild-compiler.js';
export { PostCSSCompiler } from './postcss-compiler.js';
