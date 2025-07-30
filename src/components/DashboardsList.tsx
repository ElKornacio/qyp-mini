import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Layout, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { DashboardFormModal } from './modals/DashboardFormModal';
import { appTabsStore } from '@/stores/AppTabsStore';
import { dashboardsRepository } from '@/stores/DashboardsRepository';
import { DashboardCard } from './DashboardCard';
import { EmptyState } from './EmptyState';

const DashboardsList: React.FC = observer(() => {
	const { allDashboards } = dashboardsRepository;
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const handleDashboardClick = (dashboardId: string, dashboardTitle: string, dashboardIcon?: string) => {
		appTabsStore.openDashboard(dashboardId, dashboardTitle, dashboardIcon);
	};

	const handleCreateDashboard = () => {
		setIsCreateDialogOpen(true);
	};

	const handleCloseCreateDialog = () => {
		setIsCreateDialogOpen(false);
	};

	return (
		<div className="p-6 h-full overflow-auto">
			<div className="max-w-6xl mx-auto">
				{/* Заголовок */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Дешборды</h1>
						<p className="text-muted-foreground mt-1">Управляйте своими дешбордами и создавайте новые</p>
					</div>
					<Button onClick={handleCreateDashboard} className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Создать дешборд
					</Button>
				</div>

				{/* Список дешбордов */}
				{allDashboards.length === 0 ? (
					<EmptyState
						icon={Layout}
						title="Нет дешбордов"
						description="Создайте свой первый дешборд для визуализации данных из базы данных"
						action={{
							label: 'Создать первый дешборд',
							onClick: handleCreateDashboard,
						}}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{allDashboards.map(dashboard => (
							<DashboardCard
								key={dashboard.data.id}
								dashboard={dashboard.data}
								onClick={handleDashboardClick}
							/>
						))}
					</div>
				)}
			</div>

			{/* Модальное окно создания дешборда */}
			<DashboardFormModal open={isCreateDialogOpen} onClose={handleCloseCreateDialog} />
		</div>
	);
});

export { DashboardsList };
