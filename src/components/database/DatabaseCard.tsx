import { Card } from '@/components/ui/card';
import { confirmDialog } from '@/lib/dialogs';
import { observer } from 'mobx-react';
import { Database } from '@/types/database';
import { databaseStore } from '@/stores/DatabaseStore';
import { Button } from '@/components/ui/button';
import { Database as DatabaseIcon } from 'lucide-react';

export const DatabaseCard = observer(
	({ database, onEdit }: { database: Database; onEdit: (database: Database) => void }) => {
		// Обработчик удаления базы данных
		const handleDelete = async (database: Database) => {
			const isConfirmed = await confirmDialog(
				`Вы уверены, что хотите удалить базу данных "${database.name}"? Это действие нельзя отменить.`,
			);

			if (isConfirmed) {
				await databaseStore.removeDatabase(database.id);
			}
		};

		return (
			<Card key={database.id} className="p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center space-x-3">
						<DatabaseIcon className="h-8 w-8 text-primary" />
						<div>
							<h3 className="font-medium">{database.name}</h3>
						</div>
					</div>
				</div>

				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex justify-between">
						<span>Хост:</span>
						<span className="text-right max-w-[260px] truncate">{database.credentials.host}</span>
					</div>
					<div className="flex justify-between">
						<span>Порт:</span>
						<span className="text-right">{database.credentials.port || 5432}</span>
					</div>
					<div className="flex justify-between">
						<span>База:</span>
						<span className="text-right">{database.credentials.database}</span>
					</div>
					<div className="flex justify-between">
						<span>Пользователь:</span>
						<span className="text-right">{database.credentials.username}</span>
					</div>
					{database.connection.version && (
						<div className="text-xs text-muted-foreground flex items-center justify-between">
							<span>Версия:</span>
							<span className="text-right">{database.connection.version?.split(',')[0]}</span>
						</div>
					)}
				</div>

				<div className="flex justify-between mt-4 space-x-2">
					<div className="flex space-x-2">
						<Button variant="outline" size="sm" onClick={() => onEdit(database)}>
							Редактировать
						</Button>
						<Button variant="outline" size="sm" onClick={() => handleDelete(database)}>
							Удалить
						</Button>
					</div>
				</div>
			</Card>
		);
	},
);
