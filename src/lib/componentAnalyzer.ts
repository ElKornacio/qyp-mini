import { ComponentPropInfo } from '@/types/widget';

/**
 * Анализирует исходный код для извлечения информации о пропах компонента
 * Базовая реализация - в будущем можно улучшить с помощью AST парсинга
 * @param sourceCode - исходный код компонента
 * @returns массив информации о пропах
 */
export function analyzeComponentProps(sourceCode: string): ComponentPropInfo[] {
	const props: ComponentPropInfo[] = [];

	// Простой regex для поиска интерфейса Props
	const propsInterfaceMatch = sourceCode.match(/interface\s+\w*Props\s*{([^}]*)}/);
	if (propsInterfaceMatch) {
		const propsBody = propsInterfaceMatch[1];

		// Ищем поля в интерфейсе
		const propMatches = propsBody.matchAll(/(\w+)(\?)?\s*:\s*([^;,\n]+)/g);

		for (const match of propMatches) {
			const [, name, optional, type] = match;
			props.push({
				name,
				type: type.trim(),
				required: !optional,
				description: `Проп ${name} типа ${type.trim()}`,
			});
		}
	}

	// TODO: Более продвинутый анализ с помощью TypeScript AST
	// - Анализ JSDoc комментариев
	// - Определение defaultValues из defaultProps
	// - Поддержка union types и generic types

	return props;
}

