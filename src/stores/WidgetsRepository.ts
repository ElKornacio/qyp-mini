import { observable, action, makeObservable, computed } from 'mobx';
import { WidgetMetadata } from '@/types/widget';
import { persistentStorage } from '@/lib/PersistentStorage';

export class WidgetsRepositoryStore {
	// Хранилище виджетов (только метаданные с бандлами)
	@observable private widgets = new Map<string, WidgetMetadata>();
	@observable isLoading = false;

	constructor() {
		makeObservable(this);
	}

	// Вычисляемые свойства
	@computed
	get allWidgets(): WidgetMetadata[] {
		return Array.from(this.widgets.values());
	}

	getWidget(id: string): WidgetMetadata | undefined {
		return this.widgets.get(id);
	}

	/**
	 * Добавляет новый виджет
	 */
	@action
	async addWidget(data: Omit<WidgetMetadata, 'id'>): Promise<WidgetMetadata> {
		const id = `widget_${Date.now()}`;

		const widgetMetadata: WidgetMetadata = {
			id,
			...data,
		};

		this.widgets.set(id, widgetMetadata);

		// Сохраняем виджет в файловую систему
		await persistentStorage.saveWidgetMetadata(id, widgetMetadata);

		return widgetMetadata;
	}

	/**
	 * Обновляет существующий виджет
	 */
	@action
	async updateWidget(id: string, data: WidgetMetadata): Promise<WidgetMetadata> {
		const existingWidget = this.widgets.get(id);
		if (!existingWidget) {
			throw new Error(`Виджет с ID "${id}" не найден`);
		}

		const updatedMetadata: WidgetMetadata = {
			...existingWidget,
			...data,
		};

		this.widgets.set(id, updatedMetadata);

		// Сохраняем обновленный виджет в файловую систему
		await persistentStorage.saveWidgetMetadata(id, updatedMetadata);

		return updatedMetadata;
	}

	/**
	 * Удаляет виджет из репозитория
	 */
	@action
	async removeWidget(id: string): Promise<boolean> {
		if (!this.widgets.has(id)) {
			return false;
		}

		this.widgets.delete(id);

		// Удаляем из файловой системы
		await persistentStorage.deleteWidgetMetadata(id);

		return true;
	}

	// === UI МЕТОДЫ ===

	/**
	 * Загрузка всех виджетов из PersistentStorage
	 */
	@action
	async loadWidgets() {
		this.isLoading = true;
		// Загружаем метаданные виджетов
		const widgetMetadataList: WidgetMetadata[] = await persistentStorage.loadAllWidgetMetadata();

		const loadedWidgets = new Map<string, WidgetMetadata>();

		for (const metadata of widgetMetadataList) {
			try {
				loadedWidgets.set(metadata.id, metadata);
			} catch (error) {
				console.error(`Ошибка загрузки виджета ${metadata.id}:`, error);
				// Пропускаем виджеты с ошибками
			}
		}

		this.widgets = loadedWidgets;
		this.isLoading = false;
	}
}

export const widgetsRepositoryStore = new WidgetsRepositoryStore();

// @ts-ignore
window.widgetsRepositoryStore = widgetsRepositoryStore;
