import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Layout, Database, Plus, ArrowRight, Puzzle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appTabsStore } from '@/stores/AppTabsStore';
import { dashboardsRepository } from '@/stores/DashboardsRepository';
import { databaseStore } from '@/stores/DatabaseStore';
import { DashboardFormModal } from './modals/DashboardFormModal';
import { DashboardCard } from './DashboardCard';

const EmptyTab: React.FC = observer(() => {
	const { allDashboards } = dashboardsRepository;
	const { allDatabases } = databaseStore;

	// Получаем последние 5 дешбордов (по дате обновления)
	const recentDashboards = React.useMemo(() => {
		return allDashboards.slice(0, 5);
	}, [allDashboards]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const handleDashboardClick = (dashboardId: string, dashboardTitle: string, dashboardIcon?: string) => {
		appTabsStore.openDashboard(dashboardId, dashboardTitle, dashboardIcon);
	};

	const handleCreateDashboard = () => {
		setIsCreateDialogOpen(true);
	};

	const handleConnectDatabase = () => {
		// Переходим к странице баз данных
		appTabsStore.openDatabase('all', 'Базы данных');
	};

	const handleViewAllDashboards = () => {
		appTabsStore.openDashboardList();
	};

	const handleOpenWidgetsLibrary = () => {
		appTabsStore.openWidgetsLibrary();
	};

	// Если нет баз данных - показываем приглашение подключить БД
	if (allDatabases.length === 0) {
		return (
			<div className="p-6 h-full flex items-center justify-center">
				<div className="max-w-md text-center">
					<Database className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
					<h2 className="text-2xl font-bold text-foreground mb-4">Подключите вашу первую базу данных</h2>
					<p className="text-muted-foreground mb-6">
						Чтобы создавать дешборды в нашем приложении, сначала необходимо подключить базу данных. Мы
						поддерживаем различные типы баз данных.
					</p>
					<Button onClick={handleConnectDatabase} size="lg" className="w-full">
						<Database className="h-5 w-5 mr-2" />
						Подключить базу данных
					</Button>
				</div>
			</div>
		);
	}

	// Если нет дешбордов - показываем приглашение создать дешборд
	if (allDashboards.length === 0) {
		return (
			<div className="p-6 h-full flex items-center justify-center">
				<div className="max-w-md text-center">
					<Layout className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
					<h2 className="text-2xl font-bold text-foreground mb-4">Создайте ваш первый дешборд</h2>
					<p className="text-muted-foreground mb-6">
						Дешборды помогают визуализировать данные из ваших баз данных. Создайте первый дешборд, чтобы
						начать работу с данными.
					</p>
					<Button onClick={handleCreateDashboard} size="lg" className="w-full">
						<Plus className="h-5 w-5 mr-2" />
						Создать дешборд
					</Button>
				</div>
				<DashboardFormModal open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
			</div>
		);
	}

	// Показываем ярлыки последних дешбордов
	return (
		<div className="p-6 h-full overflow-auto">
			<div className="max-w-4xl mx-auto">
				{/* Заголовок */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">Добро пожаловать в qYp-mini</h1>
					<p className="text-muted-foreground">Выберите один из последних дешбордов или создайте новый</p>
				</div>

				{/* Быстрые действия */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card
						className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
						onClick={handleCreateDashboard}
					>
						<CardContent className="p-6 text-center">
							<Plus className="h-8 w-8 text-primary mx-auto mb-3" />
							<h3 className="font-medium text-foreground">Создать дешборд</h3>
							<p className="text-sm text-muted-foreground mt-1">Новый дешборд для анализа данных</p>
						</CardContent>
					</Card>

					<Card
						className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
						onClick={handleViewAllDashboards}
					>
						<CardContent className="p-6 text-center">
							<Layout className="h-8 w-8 text-primary mx-auto mb-3" />
							<h3 className="font-medium text-foreground">Все дешборды</h3>
							<p className="text-sm text-muted-foreground mt-1">Управление существующими дешбордами</p>
						</CardContent>
					</Card>

					<Card
						className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
						onClick={handleConnectDatabase}
					>
						<CardContent className="p-6 text-center">
							<Database className="h-8 w-8 text-primary mx-auto mb-3" />
							<h3 className="font-medium text-foreground">Базы данных</h3>
							<p className="text-sm text-muted-foreground mt-1">Управление подключениями к БД</p>
						</CardContent>
					</Card>

					<Card
						className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
						onClick={handleOpenWidgetsLibrary}
					>
						<CardContent className="p-6 text-center">
							<Puzzle className="h-8 w-8 text-primary mx-auto mb-3" />
							<h3 className="font-medium text-foreground">Библиотека виджетов</h3>
							<p className="text-sm text-muted-foreground mt-1">Создание и управление виджетами</p>
						</CardContent>
					</Card>
				</div>

				{/* Последние дешборды */}
				{recentDashboards.length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-foreground">Последние дешборды</h2>
							<Button
								variant="ghost"
								onClick={handleViewAllDashboards}
								className="text-primary hover:text-primary/80"
							>
								Посмотреть все
								<ArrowRight className="h-4 w-4 ml-1" />
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{recentDashboards.map(dashboard => (
								<DashboardCard
									key={dashboard.data.id}
									dashboard={dashboard.data}
									onClick={() =>
										handleDashboardClick(
											dashboard.data.id,
											dashboard.data.name,
											dashboard.data.icon,
										)
									}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

export { EmptyTab };
