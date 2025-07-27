import { compile } from 'tailwindcss';
// @ts-ignore
import { defaultExtractor as createDefaultExtractor } from 'tailwindcss-v3/lib/lib/defaultExtractor';

import tailwindcssFile from 'tailwindcss/index.css?raw';
import { VirtualFS } from '@/virtual-fs/VirtualFS';

import initLightningCssModule, * as lightningcss from 'lightningcss-wasm';
import lightningcssWasmModule from 'lightningcss-wasm/lightningcss_node.wasm?url';

const moduleLoaded = initLightningCssModule(lightningcssWasmModule);

export class TailwindCompiler {
	private readonly defaultExtractor: (content: string) => string[];

	constructor() {
		this.defaultExtractor = createDefaultExtractor({
			tailwindConfig: { separator: ':' },
		});
	}

	getBaseCss() {
		return `@import 'tailwindcss';`;
	}

	/**
	 * Проходит по всем файлам в виртуальной файловой системе,
	 * извлекает CSS кандидатов из файлов, которые не отмечены как externalized
	 * @returns массив уникальных CSS кандидатов
	 */
	buildCandidates(vfs: VirtualFS): string[] {
		const candidatesSet = new Set<string>();

		// Проходим по всем файлам в VFS
		for (const [_filePath, fileNode] of vfs.filesNodes) {
			// Пропускаем файлы, отмеченные как externalized
			if (fileNode.metadata.externalized === true) {
				continue;
			}

			// Извлекаем кандидатов из содержимого файла
			const fileCandidates = this.defaultExtractor(fileNode.content);

			// Добавляем всех кандидатов в глобальный Set
			fileCandidates.forEach(candidate => candidatesSet.add(candidate));
		}

		// Возвращаем массив уникальных кандидатов
		return Array.from(candidatesSet);
	}

	async compile(vfs: VirtualFS, baseCss: string = this.getBaseCss()) {
		const result = await compile(baseCss, {
			loadStylesheet: async url => {
				if (url === 'tailwindcss') {
					return {
						path: url,
						base: url,
						content: tailwindcssFile,
					};
				} else {
					throw new Error(`Unknown stylesheet: ${url}`);
				}
			},
		});

		const intermediateCss = await result.build(this.buildCandidates(vfs));

		await moduleLoaded;

		const resultCss = new TextDecoder().decode(
			lightningcss.transform({
				filename: 'input.css',
				code: new TextEncoder().encode(intermediateCss),
				drafts: {
					customMedia: true,
				},
				nonStandard: {
					deepSelectorCombinator: true,
				},
				include: lightningcss.Features.Nesting,
				exclude: lightningcss.Features.LogicalProperties,
				targets: {
					safari: (16 << 16) | (4 << 8),
				},
				errorRecovery: true,
			}).code,
		);

		return resultCss;
	}
}
