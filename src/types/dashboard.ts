import { Database } from './database';

/**
 * Позиция и размер виджета на дашборде
 */
export interface WidgetLayout {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Виджет размещенный на дашборде
 */
export interface DashboardWidget {
	id: string;
	widgetId: string; // ссылка на виджет из библиотеки
	layout: WidgetLayout;
	props?: Record<string, any>; // пропы для виджета
	title?: string;
}

/**
 * Рантайм контекст для выполнения виджетов на дашборде
 */
export interface WidgetRuntimeContext {
	database: Database;
}

/**
 * Настройки сетки дашборда
 */
export interface DashboardGrid {
	cols: number; // количество колонок (fixed at 12)
	rows: number; // количество строк (customizable height)
}

/**
 * Сущность дашборда
 */
export interface Dashboard {
	id: string;
	name: string;
	icon?: string; // emoji иконка для дешборда
	databaseId: string; // привязка к базе данных
	widgets: DashboardWidget[];
	grid: DashboardGrid;
}

/**
 * Опции для создания нового дашборда
 */
export interface CreateDashboardOptions {
	name: string;
	description?: string;
	icon?: string; // emoji иконка для дешборда
	databaseId: string;
	grid?: Partial<DashboardGrid>;
}

/**
 * Опции для обновления дашборда
 */
export interface UpdateDashboardOptions {
	name?: string;
	description?: string;
	icon?: string; // emoji иконка для дешборда
	databaseId?: string;
	grid?: Partial<DashboardGrid>;
}

/**
 * Опции для добавления виджета на дашборд
 */
export interface AddWidgetToDashboardOptions {
	widgetId: string;
	layout: WidgetLayout;
	props?: Record<string, any>;
	title?: string;
}

/**
 * Опции для обновления виджета на дашборде
 */
export interface UpdateDashboardWidgetOptions {
	layout?: Partial<WidgetLayout>;
	props?: Record<string, any>;
	title?: string;
}

/**
 * Дефолтные настройки сетки
 */
export const DEFAULT_GRID: DashboardGrid = {
	cols: 12,
	rows: 20,
};
