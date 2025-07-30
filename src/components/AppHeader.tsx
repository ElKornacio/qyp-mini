import React from 'react';
import { observer } from 'mobx-react';
import { X, Plus, Settings, Database, Layout, Layers } from 'lucide-react';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { appTabsStore } from '@/stores/AppTabsStore';

const AppHeader: React.FC = observer(() => {
	const { allTabs } = appTabsStore;

	const handleTabClick = (tabId: string) => {
		appTabsStore.setActiveTab(tabId);
	};

	const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
		e.stopPropagation();
		appTabsStore.closeTab(tabId);
	};

	const handleNewTab = () => {
		appTabsStore.createNewTab();
	};

	const handleMenuItemClick = (action: string) => {
		switch (action) {
			case 'databases':
				// Открываем базы данных
				appTabsStore.openDatabase('all', 'Базы данных');
				break;
			case 'dashboards':
				appTabsStore.openDashboardList();
				break;
			case 'widgets-library':
				appTabsStore.openWidgetsLibrary();
				break;
			case 'playground':
				appTabsStore.openPlayground();
				break;
		}
	};

	const getTrimmedTitle = (title: string, maxLength: number = 20) => {
		return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
	};

	return (
		<div className="h-8 bg-card border-b border-border flex items-center">
			{/* Область вкладок */}
			<div className="flex-1 flex items-center h-full overflow-x-auto scrollbar-hide">
				{allTabs.map(tab => (
					<div
						key={tab.id}
						className={`
							h-full flex items-center px-3 border-r border-border cursor-pointer 
							hover:bg-accent/50 transition-colors relative group min-w-0 
							${tab.isActive ? 'bg-background text-foreground' : 'bg-card text-muted-foreground'}
						`}
						onClick={() => handleTabClick(tab.id)}
						style={{ maxWidth: '200px' }}
					>
						{/* Иконка вкладки */}
						<span className="text-xs mr-2 flex-shrink-0">{appTabsStore.getTabIcon(tab)}</span>

						{/* Заголовок вкладки */}
						<span className="text-xs font-medium truncate flex-1 min-w-0" title={tab.title}>
							{getTrimmedTitle(tab.title)}
						</span>

						{/* Кнопка закрытия вкладки */}
						{allTabs.length > 1 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
								onClick={e => handleCloseTab(e, tab.id)}
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
				))}

				{/* Кнопка добавления новой вкладки */}
				<Button
					variant="ghost"
					size="sm"
					className="h-full w-8 rounded-none border-r border-border hover:bg-accent/50"
					onClick={handleNewTab}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Меню настроек */}
			<div className="flex items-center h-full px-2">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Settings className="h-4 w-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" className="w-56">
						<DropdownMenuLabel>Навигация</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => handleMenuItemClick('databases')}>
							<Database className="mr-2 h-4 w-4" />
							Базы данных
						</DropdownMenuItem>

						<DropdownMenuItem onClick={() => handleMenuItemClick('dashboards')}>
							<Layout className="mr-2 h-4 w-4" />
							Дешборды
						</DropdownMenuItem>

						<DropdownMenuItem onClick={() => handleMenuItemClick('widgets-library')}>
							<Layers className="mr-2 h-4 w-4" />
							Библиотека виджетов
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => handleMenuItemClick('playground')}>
							<Layers className="mr-2 h-4 w-4" />
							Playground
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
});

export { AppHeader };
