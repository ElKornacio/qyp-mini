import { observable, action, makeObservable, computed } from 'mobx';

export type TabType =
	| 'empty-tab'
	| 'dashboard-list'
	| 'dashboard'
	| 'database'
	| 'widgets-library'
	| 'playground'
	| 'welcome';

export interface AppTab {
	id: string;
	type: TabType;
	title: string;
	isActive: boolean;
	// Дополнительные данные в зависимости от типа вкладки
	payload?: {
		dashboardId?: string;
		dashboardIcon?: string; // emoji иконка дешборда
		databaseId?: string;
		[key: string]: any;
	};
}

export class AppTabsStore {
	// Хранилище вкладок
	@observable private tabs = new Map<string, AppTab>();
	@observable private activeTabId: string | null = null;

	// Вычисляемые свойства
	@computed
	get allTabs(): AppTab[] {
		return Array.from(this.tabs.values());
	}

	@computed
	get activeTab(): AppTab | undefined {
		return this.activeTabId ? this.tabs.get(this.activeTabId) : undefined;
	}

	/**
	 * Получает иконку для вкладки
	 */
	getTabIcon(tab: AppTab): string {
		switch (tab.type) {
			case 'empty-tab':
				return '🏠'; // Home
			case 'dashboard-list':
				return '📊'; // Dashboard list
			case 'dashboard':
				return tab.payload?.dashboardIcon || '📈'; // Dashboard или дефолтная иконка дешборда
			case 'database':
				return '🗃️'; // Database
			case 'widgets-library':
				return '🧩'; // Widgets/Components
			case 'playground':
				return '⚡'; // Playground/Code
			case 'welcome':
				return '👋'; // Welcome/Wave
			default:
				return '📄'; // Default page
		}
	}

	constructor() {
		makeObservable(this);
		this.initializeWithDefaultTab();
	}

	/**
	 * Инициализирует приложение с первой пустой вкладкой
	 */
	@action
	private initializeWithDefaultTab(): void {
		const defaultTab: AppTab = {
			id: 'default-tab',
			type: 'empty-tab',
			title: 'Главная',
			isActive: true,
		};

		this.tabs.set(defaultTab.id, defaultTab);
		this.activeTabId = defaultTab.id;
	}

	/**
	 * Создает новую пустую вкладку
	 */
	@action
	createNewTab(): void {
		const id = `tab-${Date.now()}`;
		const newTab: AppTab = {
			id,
			type: 'empty-tab',
			title: 'Главная',
			isActive: false,
		};

		// Деактивируем все вкладки
		this.allTabs.forEach(tab => {
			tab.isActive = false;
		});

		// Добавляем новую активную вкладку
		newTab.isActive = true;
		this.tabs.set(id, newTab);
		this.activeTabId = id;
	}

	/**
	 * Открывает дешборд в текущей вкладке
	 */
	@action
	openDashboard(dashboardId: string, dashboardTitle: string, dashboardIcon?: string, tabId?: string): void {
		const targetTabId = tabId || this.activeTabId;

		if (!targetTabId) {
			this.createNewTab();
			const newTabId = this.activeTabId!;
			this.openDashboard(dashboardId, dashboardTitle, dashboardIcon, newTabId);
			return;
		}

		const tab = this.tabs.get(targetTabId);
		if (tab) {
			tab.type = 'dashboard';
			tab.title = dashboardTitle;
			tab.payload = {
				dashboardId,
				dashboardIcon,
			};
			this.setActiveTab(targetTabId);
		}
	}

	/**
	 * Открывает базу данных в новой вкладке или текущей (если пустая)
	 */
	@action
	openDatabase(databaseId: string, databaseTitle: string): void {
		// Если текущая вкладка пустая, используем её
		if (this.isEmptyTab()) {
			const tab = this.tabs.get(this.activeTabId!);
			if (tab) {
				tab.type = 'database';
				tab.title = databaseTitle;
				tab.payload = { databaseId };
			}
		} else {
			// Иначе создаем новую вкладку
			const id = `database-${Date.now()}`;
			const newTab: AppTab = {
				id,
				type: 'database',
				title: databaseTitle,
				isActive: false,
				payload: { databaseId },
			};

			this.tabs.set(id, newTab);
			this.setActiveTab(id);
		}
	}

	/**
	 * Открывает библиотеку виджетов в новой вкладке или текущей (если пустая)
	 */
	@action
	openWidgetsLibrary(): void {
		// Проверяем, есть ли уже открытая вкладка с библиотекой виджетов
		const existingTab = this.allTabs.find(tab => tab.type === 'widgets-library');

		if (existingTab) {
			this.setActiveTab(existingTab.id);
			return;
		}

		// Если текущая вкладка пустая, используем её
		if (this.isEmptyTab()) {
			const tab = this.tabs.get(this.activeTabId!);
			if (tab) {
				tab.type = 'widgets-library';
				tab.title = 'Библиотека виджетов';
				tab.payload = undefined;
			}
		} else {
			// Иначе создаем новую вкладку
			const id = `widgets-lib-${Date.now()}`;
			const newTab: AppTab = {
				id,
				type: 'widgets-library',
				title: 'Библиотека виджетов',
				isActive: false,
			};

			this.tabs.set(id, newTab);
			this.setActiveTab(id);
		}
	}

	/**
	 * Открывает playground в новой вкладке или текущей (если пустая)
	 */
	@action
	openPlayground(): void {
		// Если текущая вкладка пустая, используем её
		if (this.isEmptyTab()) {
			const tab = this.tabs.get(this.activeTabId!);
			if (tab) {
				tab.type = 'playground';
				tab.title = 'Playground';
				tab.payload = undefined;
			}
		} else {
			// Иначе создаем новую вкладку
			const id = `playground-${Date.now()}`;
			const newTab: AppTab = {
				id,
				type: 'playground',
				title: 'Playground',
				isActive: false,
			};

			this.tabs.set(id, newTab);
			this.setActiveTab(id);
		}
	}

	/**
	 * Активирует указанную вкладку
	 */
	@action
	setActiveTab(tabId: string): void {
		// Деактивируем все вкладки
		this.allTabs.forEach(tab => {
			tab.isActive = false;
		});

		// Активируем указанную вкладку
		const tab = this.tabs.get(tabId);
		if (tab) {
			tab.isActive = true;
			this.activeTabId = tabId;
		}
	}

	/**
	 * Закрывает вкладку
	 */
	@action
	closeTab(tabId: string): void {
		const tab = this.tabs.get(tabId);
		if (!tab) return;

		// Если закрываем активную вкладку
		const wasActive = tab.isActive;
		this.tabs.delete(tabId);

		// Если это была последняя вкладка, создаем новую
		if (this.tabs.size === 0) {
			this.initializeWithDefaultTab();
			return;
		}

		// Если была активная вкладка, активируем другую
		if (wasActive) {
			const remainingTabs = this.allTabs;
			if (remainingTabs.length > 0) {
				this.setActiveTab(remainingTabs[0].id);
			}
		}
	}

	/**
	 * Проверяет, является ли вкладка пустой (empty-tab)
	 */
	isEmptyTab(tabId?: string): boolean {
		const targetTabId = tabId || this.activeTabId;
		if (!targetTabId) return false;

		const tab = this.tabs.get(targetTabId);
		return tab?.type === 'empty-tab';
	}

	/**
	 * Открывает список дешбордов в указанной или новой вкладке
	 */
	@action
	openDashboardList(): void {
		// Если текущая вкладка пустая, используем её
		if (this.isEmptyTab()) {
			const tab = this.tabs.get(this.activeTabId!);
			if (tab) {
				tab.type = 'dashboard-list';
				tab.title = 'Дешборды';
				tab.payload = undefined;
			}
		} else {
			// Иначе создаем новую вкладку
			const id = `dashboard-list-${Date.now()}`;
			const newTab: AppTab = {
				id,
				type: 'dashboard-list',
				title: 'Дешборды',
				isActive: false,
			};

			this.tabs.set(id, newTab);
			this.setActiveTab(id);
		}
	}

	/**
	 * Возвращает к пустой вкладке в текущей вкладке
	 */
	@action
	showEmptyTab(tabId?: string): void {
		const targetTabId = tabId || this.activeTabId;

		if (!targetTabId) return;

		const tab = this.tabs.get(targetTabId);
		if (tab) {
			tab.type = 'empty-tab';
			tab.title = 'Главная';
			tab.payload = undefined;
		}
	}
}

// Экспортируем singleton
export const appTabsStore = new AppTabsStore();
