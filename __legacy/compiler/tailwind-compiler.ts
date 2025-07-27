import fs from 'fs';
// @ts-ignore
import { compile, Instrumentation, optimize, toSourceMap } from '@tailwindcss/node';
// import { Scanner } from '@tailwindcss/oxide';

import { createError } from '../utils/index.js';
import { VirtualFile } from '../virtual-fs/types.js';
import { VirtualFS } from '../virtual-fs/VirtualFS.js';

const css = String.raw;

const logToFile = (content: string) => {
	fs.appendFileSync('./tailwind.log', content);
};

/**
 * Компилятор для CSS с использованием Tailwind CSS v4
 */
export class TailwindCompiler {
	private baseCss = css`
		@import 'tailwindcss';
	`;

	/**
	 * Компилирует CSS стили с Tailwind
	 */
	async compile(vfs: VirtualFS, options?: { minify?: boolean; optimize?: boolean }): Promise<{ css: string }> {
		try {
			using I = new Instrumentation();
			logToFile('[@tailwindcss/compiler] CSS compilation');

			// Получаем все TSX файлы из виртуальной файловой системы
			const tsxFiles = Array.from(vfs.filesNodes.entries()).filter(
				([filePath, fileNode]) => fileNode.metadata.externalized && fileNode.name.endsWith('.tsx'),
			);

			logToFile('Setup compiler');

			// Создаем компилятор
			const compiler = await compile(this.baseCss, {
				base: process.cwd(),
				onDependency: () => {},
			});

			// Настраиваем источники для сканирования
			const sources = this.createSources(tsxFiles);
			// const scanner = new Scanner({ sources });

			logToFile('Setup compiler');

			logToFile('Scan for candidates');
			// Сканируем содержимое виртуальных файлов на предмет классов Tailwind
			// const candidates = this.scanVirtualFiles(scanner, tsxFiles);
			logToFile('Scan for candidates');

			logToFile('Build CSS');
			// Компилируем CSS
			let compiledCss = compiler.build([]);
			logToFile('Build CSS');

			let sourceMap: any | null = null;

			// Оптимизация CSS если требуется
			if (options?.optimize || options?.minify) {
				logToFile('Optimize CSS');
				const optimized = optimize(compiledCss, {
					file: 'virtual.css',
					minify: options?.minify ?? false,
				});
				compiledCss = optimized.code;

				if (optimized.map) {
					sourceMap = toSourceMap(optimized.map);
				}
				logToFile('Optimize CSS');
			}

			logToFile('[@tailwindcss/compiler] CSS compilation');

			return {
				css: compiledCss,
			};
		} catch (error) {
			throw createError('Ошибка компиляции CSS с Tailwind', error);
		}
	}

	/**
	 * Создает источники содержимого для Scanner
	 */
	private createSources(tsxFiles: [string, VirtualFile][]) {
		// Если есть виртуальные файлы, создаем виртуальные источники
		if (tsxFiles.length > 0) {
			return tsxFiles.map(([filePath]) => ({
				base: '.',
				pattern: filePath,
				negated: false,
			}));
		}

		// Иначе используем базовые паттерны
		return [{ base: '.', pattern: '**/*.{html,js,ts,jsx,tsx,vue,svelte}', negated: false }];
	}

	// /**
	//  * Сканирует виртуальные файлы на предмет классов Tailwind
	//  */
	// private scanVirtualFiles(scanner: Scanner, tsxFiles: [string, VirtualFile][]) {
	// 	const candidates: string[] = [];

	// 	for (const [filePath, fileNode] of tsxFiles) {
	// 		try {
	// 			// Получаем содержимое файла
	// 			const content = fileNode.content;

	// 			if (!fileNode.metadata.externalized) {
	// 				// candidates.push(...scanner.scanFiles([{ file: filePath, extension: 'tsx' }]));
	// 				// no-op for now
	// 			}

	// 			// candidates.push(...fileCandidates);
	// 		} catch (error) {
	// 			console.warn(`Предупреждение: не удалось отсканировать файл ${filePath}:`, error);
	// 		}
	// 	}

	// 	return candidates;
	// }

	// 	// Если нет кандидатов из виртуальных файлов, делаем полное сканирование
	// 	if (candidates.length === 0) {
	// 		return scanner.scan();
	// 	}

	// 	return candidates;
	// }

	// /**
	//  * Компилирует CSS с базовыми настройками
	//  */
	// async compileBasic(): Promise<string> {
	// 	try {
	// 		const compiler = await compile(this.baseCss, {
	// 			base: process.cwd(),
	// 		});

	// 		const scanner = new Scanner({
	// 			sources: [{ base: '.', pattern: '**/*.{html,js,ts,jsx,tsx}', negated: false }],
	// 		});

	// 		const candidates = scanner.scan();
	// 		return compiler.build(candidates);
	// 	} catch (error) {
	// 		throw createError('Ошибка базовой компиляции CSS', error);
	// 	}
	// }
}
