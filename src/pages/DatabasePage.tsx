import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database';
import { DatabaseFormModal } from '@/components/modals/DatabaseFormModal';
import { Database as DatabaseIcon } from 'lucide-react';
import { databaseStore } from '@/stores/DatabaseStore';
import { PageHeader } from '@/components/PageHeader';
import { DatabaseCard } from '@/components/database/DatabaseCard';

export const DatabasePage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingDatabase, setEditingDatabase] = useState<Database | null>(null);

	// Обработчики для модального окна
	const handleOpenForm = (database?: Database) => {
		setEditingDatabase(database || null);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setEditingDatabase(null);
	};

	// Обработчик создания подключения к тестовой БД
	const handleCreateTestDatabase = async () => {
		try {
			await databaseStore.createDatabase({
				name: 'Тестовая БД (Pagila)',
				credentials: {
					host: 'example-database-do-user-1261283-0.j.db.ondigitalocean.com',
					port: 25060,
					username: 'readonly',
					password: 'AVNS_PHiKtaU9YG1vRyKWjGV',
					database: 'pagila',
					type: 'postgres',
					ssl: true,
				},
			});
		} catch (error) {
			console.error('Ошибка создания тестовой БД:', error);
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Заголовок */}
			<PageHeader title="Базы данных" subtitle="Управление подключениями к базам данных">
				<Button onClick={() => handleOpenForm()}>Добавить базу данных</Button>
			</PageHeader>

			{/* Список баз данных */}
			<div className="flex-1 p-6">
				{databaseStore.allDatabases.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-foreground mb-2">Нет подключений к базам данных</h3>
						<p className="text-muted-foreground mb-6 max-w-md">
							Создайте первое подключение для начала работы
						</p>
						<div className="flex gap-3">
							<Button onClick={() => handleOpenForm()}>Добавить базу данных</Button>
							<Button variant="outline" onClick={handleCreateTestDatabase}>
								Подключить тестовую БД
							</Button>
						</div>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{databaseStore.allDatabases.map(database => (
							<DatabaseCard key={database.id} database={database} onEdit={handleOpenForm} />
						))}
					</div>
				)}
			</div>

			{/* Модальное окно формы */}
			<DatabaseFormModal open={isFormOpen} onClose={handleCloseForm} database={editingDatabase} />
		</div>
	);
});
