import { CompileComponentResponse } from '../types';
import { SerializedVirtualNode } from '../virtual-fs/types';
import { VirtualFS } from '../virtual-fs/VirtualFS';

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
	constructor() {}

	async compile(serializedVfs: SerializedVirtualNode[], entryPoint: string): Promise<CompileComponentResponse> {
		const vfs = new VirtualFS();
		vfs.deserialize(serializedVfs);

		// const result = await vfs.compile(entryPoint);

		const entryPointFile = vfs.readFile(entryPoint);
		const entryPointSource = entryPointFile.content;

		return {
			jsBundle: `// mocking compilation, original source code:\n\n${entryPointSource}`,
			cssBundle: '/* mock-css-bundle */',
		};
	}
}
