import { CompileComponentResponse } from '../types';
import { SerializedVirtualNode } from '../virtual-fs/types';
import { VirtualFS } from '../virtual-fs/VirtualFS';
import { ESBuildCompiler } from './esbuild-compiler';

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

	constructor() {
		this.esbuildCompiler = new ESBuildCompiler();
	}

	async compile(serializedVfs: SerializedVirtualNode[], entryPoint: string): Promise<CompileComponentResponse> {
		const vfs = new VirtualFS();
		vfs.deserialize(serializedVfs);

		try {
			// Компилируем используя ESBuild
			const result = await this.esbuildCompiler.compile(vfs, entryPoint, {
				minify: false,
			});

			return {
				jsBundle: result.code,
				cssBundle: '', // CSS пока не извлекаем отдельно
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
