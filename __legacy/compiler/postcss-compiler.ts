import { VirtualFile, CompileOptions } from '../types/index.js';
import { getTsxFilePaths, createError } from '../utils/index.js';

/**
 * Компилятор для CSS с использованием PostCSS и Tailwind CSS
 */
export class PostCSSCompiler {
	/**
	 * Компилирует CSS стили с Tailwind
	 */
	async compile(files: VirtualFile[], options: CompileOptions = {}): Promise<string> {
		try {
			const tsxPaths = getTsxFilePaths(files);

			// Создаем конфигурацию Tailwind
			const tailwindConfig = this.createTailwindConfig(tsxPaths, options.tailwindConfig);

			// Создаем PostCSS процессор
			// const processor = postcss([tailwindcss(tailwindConfig)]);

			// // Обрабатываем CSS
			// const result = await processor.process(this.baseCss, {
			// 	from: undefined, // Виртуальный файл
			// 	to: undefined,
			// });

			return '// test'; // result.css;
		} catch (error) {
			throw createError('Ошибка компиляции CSS с PostCSS', error);
		}
	}

	/**
	 * Создает конфигурацию для Tailwind CSS
	 */
	private createTailwindConfig(tsxPaths: string[], customConfig?: Record<string, any>) {
		const defaultConfig = {
			darkMode: 'class',
			content: tsxPaths,
			prefix: '',
			theme: {
				container: {
					center: true,
					padding: '2rem',
					screens: {
						'2xl': '1400px',
					},
				},
				extend: {
					colors: {
						border: 'hsl(var(--border))',
						input: 'hsl(var(--input))',
						ring: 'hsl(var(--ring))',
						background: 'hsl(var(--background))',
						foreground: 'hsl(var(--foreground))',
						primary: {
							DEFAULT: 'hsl(var(--primary))',
							foreground: 'hsl(var(--primary-foreground))',
						},
						secondary: {
							DEFAULT: 'hsl(var(--secondary))',
							foreground: 'hsl(var(--secondary-foreground))',
						},
						destructive: {
							DEFAULT: 'hsl(var(--destructive))',
							foreground: 'hsl(var(--destructive-foreground))',
						},
						muted: {
							DEFAULT: 'hsl(var(--muted))',
							foreground: 'hsl(var(--muted-foreground))',
						},
						accent: {
							DEFAULT: 'hsl(var(--accent))',
							foreground: 'hsl(var(--accent-foreground))',
						},
						popover: {
							DEFAULT: 'hsl(var(--popover))',
							foreground: 'hsl(var(--popover-foreground))',
						},
						card: {
							DEFAULT: 'hsl(var(--card))',
							foreground: 'hsl(var(--card-foreground))',
						},
					},
					borderRadius: {
						lg: 'var(--radius)',
						md: 'calc(var(--radius) - 2px)',
						sm: 'calc(var(--radius) - 4px)',
					},
					keyframes: {
						'accordion-down': {
							from: { height: '0' },
							to: { height: 'var(--radix-accordion-content-height)' },
						},
						'accordion-up': {
							from: { height: 'var(--radix-accordion-content-height)' },
							to: { height: '0' },
						},
					},
					animation: {
						'accordion-down': 'accordion-down 0.2s ease-out',
						'accordion-up': 'accordion-up 0.2s ease-out',
					},
				},
			},
		};

		// Объединяем с пользовательской конфигурацией, если есть
		if (customConfig) {
			return this.mergeDeep(defaultConfig, customConfig);
		}

		return defaultConfig;
	}

	/**
	 * Глубокое слияние объектов
	 */
	private mergeDeep(target: any, source: any): any {
		const output = Object.assign({}, target);

		if (this.isObject(target) && this.isObject(source)) {
			Object.keys(source).forEach(key => {
				if (this.isObject(source[key])) {
					if (!(key in target)) {
						Object.assign(output, { [key]: source[key] });
					} else {
						output[key] = this.mergeDeep(target[key], source[key]);
					}
				} else {
					Object.assign(output, { [key]: source[key] });
				}
			});
		}

		return output;
	}

	/**
	 * Проверяет, является ли значение объектом
	 */
	private isObject(item: any): boolean {
		return item && typeof item === 'object' && !Array.isArray(item);
	}
}
