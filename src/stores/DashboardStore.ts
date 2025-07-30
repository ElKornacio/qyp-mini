import { observable, action, makeObservable } from 'mobx';
import {
	Dashboard,
	DashboardWidget,
	AddWidgetToDashboardOptions,
	UpdateDashboardWidgetOptions,
} from '@/types/dashboard';
import { WidgetMetadata } from '@/types/widget';
import { databaseStore } from './DatabaseStore';
import { WidgetRuntime } from '@/lib/runtime/WidgetRuntime';
import type { DashboardsRepository } from './DashboardsRepository';
import { widgetsRepositoryStore } from './WidgetsRepository';

export interface WidgetDescriptior {
	data: DashboardWidget;
	widget: WidgetMetadata;
	runtime: WidgetRuntime;
}

export class DashboardStore {
	@observable data: Dashboard;
	@observable widgets = new Map<string, WidgetDescriptior>();

	// UI состояние
	@observable isEditMode: boolean = false;
	@observable isLoading: boolean = false;

	constructor(
		public readonly repository: DashboardsRepository,
		data: Dashboard,
	) {
		this.data = data;
		for (const widget of data.widgets) {
			const widgetMetadata = widgetsRepositoryStore.getWidget(widget.widgetId);
			if (!widgetMetadata) {
				throw new Error(`Виджет с ID "${widget.widgetId}" не найден`);
			}
			const runtime = new WidgetRuntime();
			runtime.bundleWithDatabase = {
				widgetTsx: widgetMetadata.widgetTsx,
				jsBundle: widgetMetadata.jsBundle,
				cssBundle: widgetMetadata.cssBundle,
				props: widgetMetadata.props,
				database: databaseStore.getDatabase(data.databaseId)!,
			};
			this.widgets.set(widget.id, { data: widget, widget: widgetMetadata, runtime });

			runtime.buildModule();
		}

		makeObservable(this);
	}

	/**
	 * Добавляет виджет в дашборд
	 */
	@action
	async addWidgetToDashboard(options: AddWidgetToDashboardOptions): Promise<WidgetDescriptior> {
		const widget = widgetsRepositoryStore.getWidget(options.widgetId);
		if (!widget) {
			throw new Error(`Виджет с ID "${options.widgetId}" не найден`);
		}
		const database = databaseStore.getDatabase(this.data.databaseId);
		if (!database) {
			throw new Error(`База данных с ID "${this.data.databaseId}" не найдена`);
		}

		const data: DashboardWidget = {
			id: `widget_${Date.now()}`,
			widgetId: options.widgetId,
			layout: options.layout,
			props: options.props,
			title: options.title,
		};

		const runtime = new WidgetRuntime();

		runtime.bundleWithDatabase = {
			widgetTsx: widget.widgetTsx,
			jsBundle: widget.jsBundle,
			cssBundle: widget.cssBundle,
			props: widget.props,
			database,
		};

		await runtime.buildModule();

		const widgetDescriptior: WidgetDescriptior = { data, widget, runtime };

		this.widgets.set(data.id, widgetDescriptior);
		this.data.widgets.push(data);

		await this.repository.updateDashboard(this.data.id, this.data);

		return widgetDescriptior;
	}

	/**
	 * Обновляет виджет в дашборде
	 */
	@action
	async updateDashboardWidget(widgetId: string, options: UpdateDashboardWidgetOptions): Promise<WidgetDescriptior> {
		const widgetDescriptior = this.widgets.get(widgetId);
		if (!widgetDescriptior) {
			throw new Error(`Виджет с ID "${widgetId}" не найден`);
		}

		const widget = this.data.widgets.find(w => w.id === widgetId);
		if (!widget) {
			throw new Error(`Виджет с ID "${widgetId}" не найден в дашборде`);
		}

		if (widgetDescriptior.data !== widget) {
			console.warn('widgetDescriptior.data !== widget', widgetDescriptior.data, widget);
		}

		Object.assign(widgetDescriptior.data, {
			...widget,
			...options,
			layout: {
				...widget.layout,
				...options.layout,
			},
		});

		await this.repository.updateDashboard(this.data.id, this.data);

		return widgetDescriptior;
	}

	/**
	 * Удаляет виджет из дашборда
	 */
	@action
	async removeWidgetFromDashboard(widgetId: string): Promise<boolean> {
		const widgetDescriptior = this.widgets.get(widgetId);
		if (!widgetDescriptior) {
			return false;
		}

		const updatedWidgets = this.data.widgets.filter(w => w.id !== widgetId);
		if (updatedWidgets.length === this.data.widgets.length) {
			return false; // Виджет не найден
		}

		this.data.widgets = updatedWidgets;
		this.widgets.delete(widgetId);

		await this.repository.updateDashboard(this.data.id, this.data);

		return true;
	}

	/**
	 * Обновляет позиции всех виджетов в дашборде (для drag & drop)
	 */
	@action
	async updateWidgetsPositions(layouts: Array<{ id: string; layout: DashboardWidget['layout'] }>): Promise<void> {
		for (const layout of layouts) {
			const widgetDescriptior = this.widgets.get(layout.id);
			if (!widgetDescriptior) {
				throw new Error(`Виджет с ID "${layout.id}" не найден`);
			}
			widgetDescriptior.data.layout = layout.layout;
		}

		await this.repository.updateDashboard(this.data.id, this.data);
	}

	// === UI МЕТОДЫ ===

	/**
	 * Переключает режим редактирования сетки
	 */
	@action
	toggleGridEditMode(): void {
		this.isEditMode = !this.isEditMode;
	}

	/**
	 * Устанавливает режим редактирования сетки
	 */
	@action
	setGridEditMode(enabled: boolean): void {
		this.isEditMode = enabled;
	}

	isOccupied(x: number, y: number, width: number, height: number): boolean {
		return this.data.widgets.some(widget => {
			return !(
				x >= widget.layout.x + widget.layout.width ||
				x + width <= widget.layout.x ||
				y >= widget.layout.y + widget.layout.height ||
				y + height <= widget.layout.y
			);
		});
	}

	findAvailablePosition(width: number, height: number): { x: number; y: number } {
		for (let y = 0; y <= this.data.grid.rows - height; y++) {
			for (let x = 0; x <= this.data.grid.cols - width; x++) {
				if (!this.isOccupied(x, y, width, height)) {
					return { x, y };
				}
			}
		}
		return { x: 0, y: 0 }; // Fallback position
	}
}
