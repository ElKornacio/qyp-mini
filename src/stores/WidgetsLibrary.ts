import { observable, makeObservable, computed, action } from 'mobx';
import { ValidationResult } from '@/lib/compiler/ComponentCompiler';
import { WidgetDefaultSize } from '@/types/widget';
import { databaseStore } from './DatabaseStore';
import { WidgetRuntime } from '@/lib/runtime/WidgetRuntime';
import { widgetsRepositoryStore } from './WidgetsRepository';
import { getDefaultWidgetIndexTsxContent } from '@/virtual-fs/default-fs';
import { confirmDialog } from '@/lib/dialogs';

export class WidgetsLibraryStore {
	runtime: WidgetRuntime;

	@observable selectedWidgetId: 'new' | string | null = null;
	@observable widgetTsx: string = '';
	@observable widgetName: string = '';
	@observable widgetDefaultSize: WidgetDefaultSize = { width: 4, height: 3 };

	// Состояние компиляции и валидации
	@observable isCompiling: boolean = false;
	@observable isSaving: boolean = false;
	@observable isLoading: boolean = false;
	@observable compilationError: string = '';
	@observable validationResult: ValidationResult | null = null;

	// Превью
	@observable _previewDatabaseId: string | null = null;
	@observable isCompilingPreview: boolean = false;
	@observable previewError: string = '';

	constructor() {
		makeObservable(this);

		this.runtime = new WidgetRuntime();
	}

	@computed
	get hasCodeChanges() {
		return this.widgetTsx !== this.runtime.sourceCode?.widgetTsx;
	}

	@computed
	get hasUnsavedChanges(): boolean {
		if (!this.selectedWidgetId) {
			return false;
		} else if (this.selectedWidgetId === 'new') {
			return true;
		}

		const selectedWidget = widgetsRepositoryStore.getWidget(this.selectedWidgetId);
		if (!selectedWidget) {
			return false;
		}

		return (
			this.widgetTsx !== selectedWidget.widgetTsx ||
			this.widgetName !== selectedWidget.name ||
			this.widgetDefaultSize.width !== selectedWidget.defaultSize.width ||
			this.widgetDefaultSize.height !== selectedWidget.defaultSize.height ||
			this.runtime.compiledBundle?.jsBundle !== selectedWidget.jsBundle ||
			this.runtime.compiledBundle?.cssBundle !== selectedWidget.cssBundle
		);
	}

	// === МЕТОДЫ УПРАВЛЕНИЯ ВИДЖЕТАМИ ===

	async compileBundle() {
		this.runtime.sourceCode = { widgetTsx: this.widgetTsx };
		this.isCompiling = true;
		this.compilationError = '';
		try {
			await this.runtime.compileBundle();
			if (this._previewDatabaseId) {
				await this.compileComponent();
			}
		} catch (error) {
			this.compilationError = error instanceof Error ? error.message : 'Ошибка компиляции';
		} finally {
			this.isCompiling = false;
		}
	}

	async compileComponent() {
		if (!this.runtime.compiledBundle) {
			throw new Error('No compiled bundle');
		}

		if (!this._previewDatabaseId) {
			throw new Error('No database selected for preview compilation');
		}

		const database = databaseStore.getDatabase(this._previewDatabaseId);
		if (!database) {
			throw new Error('No database selected for preview compilation');
		}

		this.runtime.bundleWithDatabase = {
			...this.runtime.compiledBundle,
			database,
		};
		await this.runtime.buildModule();
	}

	async saveWidget() {
		if (!this.runtime.compiledBundle) {
			throw new Error('No compiled bundle');
		}
		if (!this.selectedWidgetId) {
			throw new Error('No widget selected');
		}

		this.isSaving = true;

		try {
			if (this.selectedWidgetId === 'new') {
				const newWidget = await widgetsRepositoryStore.addWidget({
					widgetTsx: this.widgetTsx,
					name: this.widgetName,
					defaultSize: this.widgetDefaultSize,
					props: this.runtime.compiledBundle.props,
					jsBundle: this.runtime.compiledBundle.jsBundle,
					cssBundle: this.runtime.compiledBundle.cssBundle,
				});

				this.selectWidget(newWidget.id);
			} else {
				await widgetsRepositoryStore.updateWidget(this.selectedWidgetId, {
					id: this.selectedWidgetId,
					widgetTsx: this.widgetTsx,
					name: this.widgetName,
					defaultSize: this.widgetDefaultSize,
					props: this.runtime.compiledBundle.props,
					jsBundle: this.runtime.compiledBundle.jsBundle,
					cssBundle: this.runtime.compiledBundle.cssBundle,
				});
			}
		} finally {
			this.isSaving = false;
		}
	}

	@action
	async createNewWidget() {
		this.selectedWidgetId = 'new';
		this.widgetTsx = getDefaultWidgetIndexTsxContent();
		this.widgetName = 'New Widget';
		this.widgetDefaultSize = { width: 4, height: 3 };

		await this.compileBundle();

		if (this._previewDatabaseId) {
			await this.compileComponent();
		}
	}

	@action
	async selectWidget(widgetId: string) {
		this.selectedWidgetId = widgetId;

		const widget = widgetsRepositoryStore.getWidget(widgetId);
		if (!widget) {
			throw new Error('Widget not found');
		}

		this.widgetTsx = widget.widgetTsx;
		this.widgetName = widget.name;
		this.widgetDefaultSize = widget.defaultSize;

		this.runtime.compiledBundle = {
			...widget,
		};

		if (this._previewDatabaseId) {
			await this.compileComponent();
		}
	}

	@computed
	get previewDatabaseId() {
		return this._previewDatabaseId;
	}

	@action
	setPreviewDatabaseId(databaseId: string | null) {
		this._previewDatabaseId = databaseId;
		if (this._previewDatabaseId && this.runtime.compiledBundle) {
			this.compileComponent();
		}
	}

	@action
	async deleteWidget(widgetId: string) {
		if (await confirmDialog('Are you sure you want to delete this widget?')) {
			await widgetsRepositoryStore.removeWidget(widgetId);
			if (this.selectedWidgetId === widgetId) {
				this.selectedWidgetId = null;
			}
		}
	}
}

export const widgetsLibraryStore = new WidgetsLibraryStore();

// @ts-ignore
window.widgetsLibraryStore = widgetsLibraryStore;
