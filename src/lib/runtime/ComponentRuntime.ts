import { tryToMockGlobalModule } from '@/pipeline/modules-mocks/mockGlobalModules';
import { tryToMockShadcnUiModules } from '@/pipeline/modules-mocks/mockShadcnUiModules';
import { tryToMockUtilsModule } from '@/pipeline/modules-mocks/mockUtilsModule';

export interface RuntimeContext {
	// Контекст для модулей - можно расширить в будущем
	[key: string]: any;
}

export interface ModuleResolver {
	(context: RuntimeContext, path: string): any;
}

/**
 * Класс для создания runtime-окружения и выполнения скомпилированных компонентов
 * Отвечает за предоставление внешних модулей и выполнение JavaScript кода
 */
export class ComponentRuntime {
	private context: RuntimeContext;
	private moduleResolvers: ModuleResolver[];

	constructor(context: RuntimeContext = {}) {
		this.context = context;
		this.moduleResolvers = [
			// Порядок важен - резолверы вызываются по очереди
			tryToMockGlobalModule,
			tryToMockShadcnUiModules,
			tryToMockUtilsModule,
		];
	}

	/**
	 * Выполняет скомпилированный JavaScript bundle и возвращает React компонент
	 * @param jsBundle - скомпилированный JavaScript код
	 * @returns React функциональный компонент
	 */
	compileComponentModule(jsBundle: string): React.FunctionComponent<any> {
		// Оборачиваем код в IIFE для изоляции
		const wrappedIIFE = `(function(module, require) {
			${jsBundle}
		})(__module__, __require__)`;

		// Создаем функцию для выполнения модуля
		const componentModule = new Function('__module__', '__require__', wrappedIIFE);

		// Создаем объект модуля
		const customModule: any = { exports: {} };

		const customRequire = this.createCustomRequire();

		try {
			// Выполняем модуль с нашим кастомным require
			componentModule(customModule, customRequire);
		} catch (error) {
			console.error('Ошибка при выполнении модуля:', error);
			throw error;
		}

		// Возвращаем default export как React компонент
		const component = customModule.exports.default;

		if (!component) {
			throw new Error('Модуль не экспортирует default export');
		}

		if (typeof component !== 'function') {
			throw new Error('Default export должен быть функцией React компонента');
		}

		return component;
	}

	/**
	 * Добавляет новый резолвер модулей
	 * @param resolver - функция для резолва модулей
	 */
	addModuleResolver(resolver: ModuleResolver): void {
		this.moduleResolvers.push(resolver);
	}

	/**
	 * Обновляет контекст runtime
	 * @param newContext - новый контекст
	 */
	updateContext(newContext: Partial<RuntimeContext>): void {
		this.context = { ...this.context, ...newContext };
	}

	/**
	 * Получает текущий контекст
	 * @returns текущий контекст runtime
	 */
	getContext(): RuntimeContext {
		return { ...this.context };
	}

	/**
	 * Создает кастомную функцию require для резолва модулей
	 * @returns функция require
	 */
	private createCustomRequire(): (path: string) => any {
		return (path: string) => {
			// Пытаемся резолвить модуль через все доступные резолверы
			for (const resolver of this.moduleResolvers) {
				try {
					const resolvedModule = resolver(this.context, path);
					if (resolvedModule !== null && resolvedModule !== undefined) {
						return resolvedModule;
					}
				} catch (error) {
					// Игнорируем ошибки от отдельных резолверов и пробуем следующий
					continue;
				}
			}

			// Если ни один резолвер не смог найти модуль
			throw new Error(`Модуль "${path}" не найден. Доступные резолверы: ${this.moduleResolvers.length}`);
		};
	}
}
