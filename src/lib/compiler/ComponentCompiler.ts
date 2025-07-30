import { buildDefaultFS, getDefaultWidgetQuerySqlTsContent } from '@/virtual-fs/default-fs';
import { TailwindCompiler } from './TailwindCompiler';
import { ESBuildCompiler } from './ESBuildCompiler';
// import { ValidationStage } from '@/pipeline/ValidationStage';

export interface CompilationResult {
	jsBundle: string;
	cssBundle: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Класс для валидации и компиляции компонентов React в runtime
 */
export class ComponentCompiler {
	private esbuildCompiler: ESBuildCompiler;
	private tailwindCompiler: TailwindCompiler;
	// private validator: ValidationStage;

	constructor() {
		this.esbuildCompiler = new ESBuildCompiler();
		this.tailwindCompiler = new TailwindCompiler();
		// this.validator = new ValidationStage();
	}

	/**
	 * Валидация исходного кода компонента
	 * @param sourceCode - исходный код TypeScript/React компонента
	 * @returns результат валидации с ошибками и предупреждениями
	 */
	async validate(sourceCode: string): Promise<ValidationResult> {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Проверка на пустой код
		if (!sourceCode.trim()) {
			errors.push('Код не может быть пустым');
			return { isValid: false, errors, warnings };
		}

		// Базовая проверка синтаксиса React
		if (!sourceCode.includes('export default')) {
			errors.push('Компонент должен содержать export default');
		}

		// Проверка на наличие React импорта (если используется JSX)
		if (
			sourceCode.includes('<') &&
			sourceCode.includes('>') &&
			!sourceCode.includes('import') &&
			!sourceCode.includes('React')
		) {
			warnings.push('JSX код может потребовать импорт React');
		}

		// TODO: Здесь можно добавить более продвинутую валидацию:
		// - ESLint проверки
		// - TypeScript type checking
		// - Проверка разрешенных импортов
		// - Анализ безопасности кода

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Компиляция исходного кода в bundle и React компонент
	 * @param sourceCode - исходный код TypeScript/React компонента
	 * @returns скомпилированный результат с JS/CSS bundle и React компонентом
	 */
	async compile(sourceCode: string): Promise<CompilationResult> {
		// Валидируем код перед компиляцией
		const validationResult = await this.validate(sourceCode);
		if (!validationResult.isValid) {
			throw new Error(`Ошибки валидации: ${validationResult.errors.join(', ')}`);
		}

		try {
			// Создаем виртуальную файловую систему
			const vfs = await buildDefaultFS(sourceCode, getDefaultWidgetQuerySqlTsContent());

			// Компилируем JS и CSS параллельно
			const [jsBundle, cssBundle] = await Promise.all([
				this.esbuildCompiler.compile(vfs, '/src/widget/index.tsx'),
				this.tailwindCompiler.compile(vfs),
			]);

			return {
				jsBundle,
				cssBundle,
			};
		} catch (error) {
			throw new Error(`Ошибка компиляции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		}
	}
}
