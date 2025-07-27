import * as esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import { VirtualFS } from '../../virtual-fs/VirtualFS.js';
import { ESBuildVFS } from './ESBuildVFS.js';

interface CompileOptions {
	minify?: boolean;
}

const esbuildPromise = esbuild.initialize({
	wasmURL: esbuildWasmUrl,
});

/**
 * Компилятор для JavaScript/TypeScript с использованием ESBuild
 */
export class ESBuildCompiler {
	/**
	 * Компилирует виртуальные файлы в JavaScript
	 */
	async compile(vfs: VirtualFS, entryPoint: string, options: CompileOptions = {}): Promise<string> {
		// Проверяем существование entry point
		if (!vfs.fileExists(entryPoint)) {
			throw new Error(`Не найдена входная точка: ${entryPoint}`);
		}

		try {
			const vfsPlugin = new ESBuildVFS(vfs);

			await esbuildPromise;

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
				throw new Error(`Ошибки компиляции ESBuild:\n${errorMessages}`);
			}

			const outputFile = result.outputFiles?.[0];
			if (!outputFile) {
				throw new Error('ESBuild не создал выходной файл');
			}

			return outputFile.text;
		} catch (error) {
			throw error;
		}
	}
}
