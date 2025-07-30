import { observable, action, makeObservable, runInAction, computed } from 'mobx';
import { Dashboard, CreateDashboardOptions, UpdateDashboardOptions, DEFAULT_GRID } from '@/types/dashboard';
import { persistentStorage } from '@/lib/PersistentStorage';
import { DashboardStore } from './DashboardStore';

export class DashboardsRepository {
	// Хранилище дашбордов
	@observable private dashboards = new Map<string, DashboardStore>();
	@observable isLoading: boolean = false;

	constructor() {
		makeObservable(this);
	}

	// Вычисляемые свойства
	@computed
	get allDashboards(): DashboardStore[] {
		return Array.from(this.dashboards.values());
	}

	/**
	 * Получает дашборды для конкретной базы данных
	 */
	@computed
	get dashboardsByDatabase(): Map<string, DashboardStore[]> {
		const result = new Map<string, DashboardStore[]>();

		this.allDashboards.forEach(dashboard => {
			const existing = result.get(dashboard.data.databaseId) || [];
			existing.push(dashboard);
			result.set(dashboard.data.databaseId, existing);
		});

		return result;
	}

	// === МЕТОДЫ УПРАВЛЕНИЯ ДАШБОРДАМИ ===

	/**
	 * Создает новый дашборд
	 */
	@action
	async createDashboard(options: CreateDashboardOptions): Promise<DashboardStore> {
		const id = `dashboard_${Date.now()}`;

		const dashboard: Dashboard = {
			id,
			name: options.name,
			icon: options.icon,
			databaseId: options.databaseId,
			widgets: [],
			grid: { ...DEFAULT_GRID, ...options.grid },
		};

		const dashboardStore = new DashboardStore(this, dashboard);

		this.dashboards.set(id, dashboardStore);

		// Сохраняем конкретный дашборд в файловую систему
		await persistentStorage.saveDashboard(id, dashboard);

		return dashboardStore;
	}

	/**
	 * Обновляет существующий дашборд
	 */
	@action
	async updateDashboard(id: string, options: UpdateDashboardOptions): Promise<DashboardStore> {
		const dashboard = this.dashboards.get(id);
		if (!dashboard) {
			throw new Error(`Дашборд с ID "${id}" не найден`);
		}

		Object.assign(dashboard.data, {
			...options,
			grid: options.grid ? { ...dashboard.data.grid, ...options.grid } : dashboard.data.grid,
		});

		// Сохраняем обновленный дашборд в файловую систему
		await persistentStorage.saveDashboard(id, dashboard.data);

		return dashboard;
	}

	/**
	 * Удаляет дашборд
	 */
	@action
	async removeDashboard(id: string): Promise<boolean> {
		const dashboard = this.dashboards.get(id);
		if (!dashboard) {
			return false;
		}

		this.dashboards.delete(id);

		// Удаляем из файловой системы
		await persistentStorage.deleteDashboard(id);

		return true;
	}

	/**
	 * Дублирует дашборд
	 */
	@action
	async duplicateDashboard(id: string, newName?: string): Promise<DashboardStore> {
		const originalDashboard = this.dashboards.get(id);
		if (!originalDashboard) {
			throw new Error(`Дашборд с ID "${id}" не найден`);
		}

		const newId = `dashboard_${Date.now()}`;
		const duplicatedDashboard: Dashboard = {
			...originalDashboard.data,
			id: newId,
			name: newName || `${originalDashboard.data.name} (копия)`,
			// Дублируем виджеты с новыми ID
			widgets: Array.from(originalDashboard.widgets.values()).map(widget => ({
				...widget.data,
				id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			})),
		};

		const dashboard = new DashboardStore(this, duplicatedDashboard);
		this.dashboards.set(newId, dashboard);

		// Сохраняем дублированный дашборд в файловую систему
		await persistentStorage.saveDashboard(newId, duplicatedDashboard);

		return dashboard;
	}

	/**
	 * Получает дашборд по ID
	 */
	getDashboard(id: string): DashboardStore | undefined {
		return this.dashboards.get(id);
	}

	/**
	 * Получает все дашборды для указанной базы данных
	 */
	getDashboardsForDatabase(databaseId: string): DashboardStore[] {
		return this.allDashboards.filter(dashboard => dashboard.data.databaseId === databaseId);
	}

	// === ПРИВАТНЫЕ МЕТОДЫ ===

	/**
	 * Загружает дашборды из PersistentStorage
	 */
	@action
	async loadDashboards() {
		try {
			this.isLoading = true;

			const dashboards: Dashboard[] = await persistentStorage.loadAllDashboards();

			runInAction(() => {
				this.dashboards.clear();
				dashboards.forEach(dashboard => {
					this.dashboards.set(dashboard.id, new DashboardStore(this, dashboard));
				});
			});
		} catch (error) {
			console.error('Ошибка загрузки дашбордов:', error);
		} finally {
			this.isLoading = false;
		}
	}
}

export const dashboardsRepository = new DashboardsRepository();

// @ts-ignore
window.dashboardsRepository = dashboardsRepository;
