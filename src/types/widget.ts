import { Database } from './database';

export interface WidgetSourceCode {
	widgetTsx: string;
}

export interface WidgetCompiledBundle extends WidgetSourceCode {
	props: ComponentPropInfo[];
	jsBundle: string;
	cssBundle: string;
}

export interface WidgetBundleWithDatabase extends WidgetCompiledBundle {
	database: Database;
}

export interface WidgetRuntimeComponent extends WidgetBundleWithDatabase {
	component: React.FunctionComponent<any>;
}

/**
 * Информация о пропах компонента
 */
export interface ComponentPropInfo {
	name: string;
	type: string;
	required: boolean;
	defaultValue?: any;
	description?: string;
}

/**
 * Размер виджета по умолчанию для дашборда
 */
export interface WidgetDefaultSize {
	width: number; // количество колонок
	height: number; // количество строк
}

/**
 * Метаданные виджета (только результаты компиляции)
 */
export interface WidgetMetadata extends WidgetCompiledBundle {
	id: string;
	name: string;
	defaultSize: WidgetDefaultSize;
}

/**
 * Опции для рендеринга компонента
 */
export interface RenderOptions {
	props?: Record<string, any>;
	wrapperClassName?: string;
	onError?: (error: Error) => void;
}
