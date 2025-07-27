import path from 'path';
import type { PluginBuild, Loader, OnLoadArgs, OnResolveArgs } from 'esbuild-wasm';

import { VirtualFS } from '../../virtual-fs/VirtualFS.js';

export class ESBuildVFS {
	name = 'virtual-files';

	constructor(private vfs: VirtualFS) {}

	get() {
		return {
			name: this.name,
			setup: this.setup,
		};
	}

	private setup = (build: PluginBuild) => {
		// Резолвим импорты виртуальных файлов
		build.onResolve({ filter: /.*/ }, this.handleResolve);
		// Загружаем содержимое виртуальных файлов
		build.onLoad({ filter: /.*/, namespace: 'virtual' }, this.handleLoad);
	};

	private handleResolve = (args: OnResolveArgs) => {
		// Пропускаем внешние модули (node_modules)
		if (!args.path.startsWith('.') && !args.path.startsWith('/') && !args.path.startsWith('@')) {
			return { external: true };
		}

		const resolvedPath = args.path.startsWith('@')
			? args.path.replace('@/', '/src/')
			: this.resolveVirtualPath(args.path, args.importer);

		let foundPath: string | undefined = undefined;

		if (this.vfs.fileExists(resolvedPath)) {
			foundPath = resolvedPath;
		} else if (this.vfs.fileExists(resolvedPath + '.tsx')) {
			foundPath = resolvedPath + '.tsx';
		} else if (this.vfs.fileExists(resolvedPath + '.ts')) {
			foundPath = resolvedPath + '.ts';
		}

		if (foundPath) {
			const meta = this.vfs.readFileMetadata(foundPath);

			if (meta.externalized) {
				return { external: true };
			} else {
				return {
					path: foundPath,
					namespace: 'virtual',
				};
			}
		} else {
			return undefined;
		}
	};

	private handleLoad = (args: OnLoadArgs) => {
		try {
			const file = this.vfs.readFile(args.path);
			return {
				contents: file.content,
				loader: this.getLoader(args.path),
			};
		} catch (error) {
			throw new Error(`Ошибка загрузки виртуального файла ${args.path}`);
		}
	};

	/**
	 * Резолвит путь в виртуальной файловой системе
	 */
	private resolveVirtualPath(importPath: string, importer?: string): string {
		// Если путь абсолютный, возвращаем как есть
		if (path.isAbsolute(importPath)) {
			return path.resolve(importPath);
		}

		// Если есть импортер, резолвим относительно него
		if (importer) {
			const importerDir = path.dirname(importer);
			return path.resolve(importerDir, importPath);
		}

		// Иначе резолвим относительно корня
		return path.resolve('/', importPath);
	}

	/**
	 * Определяет загрузчик для файла по расширению
	 */
	private getLoader(filePath: string): Loader {
		if (filePath.endsWith('.tsx')) return 'tsx';
		if (filePath.endsWith('.ts')) return 'ts';
		if (filePath.endsWith('.jsx')) return 'jsx';
		if (filePath.endsWith('.js')) return 'js';
		if (filePath.endsWith('.css')) return 'css';
		if (filePath.endsWith('.json')) return 'json';

		return 'js'; // fallback
	}
}
