import { CompileComponentResponse } from '../types/index.js';
import { SerializedVirtualNode } from '../../../src/virtual-fs/types.js';
import { VirtualFS } from '../../../src/virtual-fs/VirtualFS.js';
import { ESBuildCompiler } from './esbuild-compiler.js';
// import { TailwindCompiler } from './tailwind-compiler.js';

/**
 * Virtual directory structure:
 * src/                   # Корневая директория
 * ├── components/
 * │   ├── ui/            # Базовые UI-компоненты, readonly (shadcn)
 * ├── widget/
 * │   ├── index.tsx      # Главный файл, которые будет генерировать ИИ - React-компонент с виджетом
 * │   ├── query.sql.ts   # Файл с sql-запросом в базу, экспортирует одну async-функцию, делающую запрос. Тоже генерирует ИИ
 * ├── lib/
 * │   ├── utils.ts       # readonly, здесь будут утилитарные функции аля `cn`
 */

export class Compiler {
	private esbuildCompiler: ESBuildCompiler;
	// private tailwindCompiler: TailwindCompiler;

	constructor() {
		this.esbuildCompiler = new ESBuildCompiler();
		// this.tailwindCompiler = new TailwindCompiler();
	}

	async compile(serializedVfs: SerializedVirtualNode[], entryPoint: string): Promise<CompileComponentResponse> {
		const vfs = new VirtualFS();
		vfs.deserialize(serializedVfs);

		try {
			// Компилируем используя ESBuild
			const result = await this.esbuildCompiler.compile(vfs, entryPoint, {
				minify: false,
			});

			// const tailwindResult = await this.tailwindCompiler.compile(vfs, {
			// 	minify: false,
			// });

			return {
				jsBundle: result.code,
				cssBundle: '',
				// cssBundle: tailwindResult.css,
			};
		} catch (error) {
			// В случае ошибки возвращаем исходный код для отладки
			const entryPointFile = vfs.readFile(entryPoint);
			const entryPointSource = entryPointFile.content;

			return {
				jsBundle: `// Ошибка компиляции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}\n\n// Исходный код:\n\n${entryPointSource}`,
				cssBundle: '/* Ошибка компиляции CSS */',
			};
		}
	}
}
