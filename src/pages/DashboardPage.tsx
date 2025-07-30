import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@/components/ui/button';
import { dashboardsRepository } from '@/stores/DashboardsRepository';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { AddWidgetModal } from '@/components/dashboard/AddWidgetModal';
import { Plus } from 'lucide-react';

interface DashboardPageProps {
	dashboardId: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = observer(({ dashboardId }) => {
	const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

	// Получаем дашборд по ID
	const dashboard = dashboardsRepository.getDashboard(dashboardId);

	// Если дашборд не найден
	if (!dashboard) {
		return (
			<div className="h-full flex flex-col bg-background">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-semibold text-muted-foreground mb-2">Дашборд не найден</h1>
						<p className="text-muted-foreground">
							Дашборд с ID "{dashboardId}" не существует или был удален
						</p>
						<Button className="mt-4" variant="outline">
							Вернуться к списку дашбордов
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Widget management functions
	const handleAddWidget = async (widgetId: string, title: string, width: number, height: number) => {
		if (!dashboard) return;

		// Find an available position
		const position = dashboard.findAvailablePosition(width, height);

		await dashboard.addWidgetToDashboard({
			widgetId,
			title,
			layout: {
				x: position.x,
				y: position.y,
				width,
				height,
			},
		});
	};

	const handleWidgetMove = async (widgetId: string, x: number, y: number) => {
		console.log('handleWidgetMove', widgetId, x, y);
		await dashboard.updateDashboardWidget(widgetId, {
			layout: { x, y },
		});
	};

	const handleWidgetRemove = async (widgetId: string) => {
		await dashboard.removeWidgetFromDashboard(widgetId);
	};

	return (
		<div className="h-full flex flex-col bg-background">
			{/* Заголовок дашборда */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						{/* Иконка дашборда */}
						<div className="text-4xl">{dashboard.data.icon || '📈'}</div>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">{dashboard.data.name}</h1>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
							Зажмите Shift для перетаскивания виджетов
						</div>
						<Button onClick={() => setIsAddWidgetModalOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Добавить виджет
						</Button>
					</div>
				</div>
			</div>

			{/* Холст для виджетов */}
			<div className="flex-1 overflow-auto p-6 bg-gray-50">
				<DashboardCanvas
					cols={dashboard.data.grid.cols || 12}
					rows={dashboard.data.grid.rows || 20}
					widgets={Array.from(dashboard.widgets.values())}
					onWidgetMove={handleWidgetMove}
					onWidgetRemove={handleWidgetRemove}
				/>
			</div>

			{/* Modal for adding widgets */}
			<AddWidgetModal
				isOpen={isAddWidgetModalOpen}
				onClose={() => setIsAddWidgetModalOpen(false)}
				onAddWidget={handleAddWidget}
				gridSettings={dashboard.data.grid}
			/>
		</div>
	);
});
