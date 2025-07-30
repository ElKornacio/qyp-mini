import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Trash2 } from 'lucide-react';
import { Dashboard } from '@/types/dashboard';
import { databaseStore } from '@/stores/DatabaseStore';
import { dashboardsRepository } from '@/stores/DashboardsRepository';
import { confirmDialog } from '@/lib/dialogs';
import { observer } from 'mobx-react';

interface DashboardCardProps {
	dashboard: Dashboard;
	onClick: (dashboardId: string, dashboardTitle: string, dashboardIcon?: string) => void;
	showDetails?: boolean;
	onDelete?: (dashboardId: string) => void;
}

/**
 * Компонент карточки дашборда
 * Используется для отображения информации о дашборде в списках
 */
export const DashboardCard: React.FC<DashboardCardProps> = observer(
	({ dashboard, onClick, showDetails = true, onDelete }) => {
		const databaseName = databaseStore.getDatabase(dashboard.databaseId)?.name || 'Неизвестная база данных';

		const handleDelete = async (e: React.MouseEvent) => {
			e.stopPropagation(); // Предотвращаем открытие дашборда при клике на кнопку

			const isConfirmed = await confirmDialog(
				`Вы уверены, что хотите удалить дашборд "${dashboard.name}"? Это действие нельзя отменить.`,
			);

			if (isConfirmed) {
				if (onDelete) {
					onDelete(dashboard.id);
				} else {
					await dashboardsRepository.removeDashboard(dashboard.id);
				}
			}
		};

		return (
			<Card
				className="group cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
				onClick={() => onClick(dashboard.id, dashboard.name, dashboard.icon)}
			>
				<CardHeader className={showDetails ? '' : 'pb-3'}>
					<div className="flex items-start justify-between">
						<div className="flex items-start gap-3 flex-1">
							{/* Иконка дашборда */}
							<div className={`${showDetails ? 'text-3xl' : 'text-2xl'} flex-shrink-0`}>
								{dashboard.icon || '📈'}
							</div>
							<div className="flex-1 min-w-0">
								<CardTitle
									className={`${showDetails ? 'text-lg' : 'text-base'} font-medium text-foreground line-clamp-${showDetails ? '2' : '1'}`}
								>
									{dashboard.name}
								</CardTitle>
							</div>
						</div>
						{/* Кнопка удаления */}
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
							onClick={handleDelete}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className={showDetails ? '' : 'pt-0'}>
					<div className={`flex items-center justify-between ${showDetails ? 'text-sm' : 'text-xs'}`}>
						<div className="flex items-center text-muted-foreground">
							<Database
								className={`${showDetails ? 'h-4 w-4' : 'h-3 w-3'} mr-${showDetails ? '2' : '1'}`}
							/>
							{databaseName}
						</div>
						<div className="text-muted-foreground">{dashboard.widgets?.length || 0} виджетов</div>
					</div>
				</CardContent>
			</Card>
		);
	},
);
