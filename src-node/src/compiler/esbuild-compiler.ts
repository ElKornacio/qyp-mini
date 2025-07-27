import * as esbuild from 'esbuild';

import { VirtualFS } from '../virtual-fs/VirtualFS';
import { createError } from '../utils';
import { ESBuildVFS } from './esbuild-vfs';

interface CompileOptions {
	minify?: boolean;
}

/**
 * Компилятор для JavaScript/TypeScript с использованием ESBuild
 */
export class ESBuildCompiler {
	/**
	 * Компилирует виртуальные файлы в JavaScript
	 */
	async compile(vfs: VirtualFS, entryPoint: string, options: CompileOptions = {}): Promise<{ code: string }> {
		// Проверяем существование entry point
		if (!vfs.fileExists(entryPoint)) {
			throw createError(`Не найдена входная точка: ${entryPoint}`);
		}

		try {
			const vfsPlugin = new ESBuildVFS(vfs);

			const result = await esbuild.build({
				entryPoints: [entryPoint],
				bundle: true,
				write: false,
				format: 'cjs',
				target: 'es2020',
				jsx: 'automatic',
				minify: options.minify || false,
				sourcemap: false,

				// Плагин для работы с виртуальными файлами
				plugins: [vfsPlugin.get()],
			});

			if (result.errors.length > 0) {
				const errorMessages = result.errors.map(err => err.text).join('\n');
				throw createError(`Ошибки компиляции ESBuild:\n${errorMessages}`);
			}

			const outputFile = result.outputFiles?.[0];
			if (!outputFile) {
				throw createError('ESBuild не создал выходной файл');
			}

			return {
				code: outputFile.text,
			};
		} catch (error) {
			throw createError('Ошибка компиляции с ESBuild', error);
		}
	}
}
