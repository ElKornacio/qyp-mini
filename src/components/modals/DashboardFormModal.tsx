import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dashboard } from '@/types/dashboard';
import { databaseStore } from '@/stores/DatabaseStore';
import { dashboardsRepository } from '@/stores/DashboardsRepository';
import { cn } from '@/lib/utils';

interface DashboardFormModalProps {
	open: boolean;
	onClose: () => void;
	dashboard?: Dashboard | null;
}

interface DashboardFormData {
	name: string;
	databaseId: string;
	icon: string;
}

const defaultFormData: DashboardFormData = {
	name: '',
	databaseId: '',
	icon: '📈',
};

export const DashboardFormModal: React.FC<DashboardFormModalProps> = observer(({ open, onClose, dashboard }) => {
	const [formData, setFormData] = useState<DashboardFormData>(defaultFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { allDatabases } = databaseStore;

	// Инициализация формы при открытии
	useEffect(() => {
		if (open) {
			if (dashboard) {
				setFormData({
					name: dashboard.name,
					databaseId: dashboard.databaseId,
					icon: dashboard.icon || '📈',
				});
			} else {
				setFormData(defaultFormData);
			}
			setErrors({});
		}
	}, [open, dashboard]);

	// Валидация формы
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Название дешборда обязательно';
		}

		if (!formData.databaseId) {
			newErrors.databaseId = 'Выберите базу данных';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Обработка отправки формы
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		try {
			if (dashboard) {
				await dashboardsRepository.updateDashboard(dashboard.id, {
					name: formData.name.trim(),
					icon: formData.icon.trim() || '📈',
					databaseId: formData.databaseId,
				});
			} else {
				await dashboardsRepository.createDashboard({
					name: formData.name.trim(),
					icon: formData.icon.trim() || '📈',
					databaseId: formData.databaseId,
				});
			}

			onClose();
		} catch (error) {
			console.error('Ошибка сохранения дешборда:', error);
			setErrors({
				general: 'Не удалось сохранить дешборд. Попробуйте еще раз.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: keyof DashboardFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Очищаем ошибку при изменении поля
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{dashboard ? 'Редактировать дешборд' : 'Создать новый дешборд'}</DialogTitle>
					{!dashboard && (
						<DialogDescription>
							Создайте дешборд для визуализации данных из выбранной базы данных
						</DialogDescription>
					)}
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Название дешборда */}
					<div className="flex flex-row gap-2">
						<div className="space-y-2 flex-1">
							<Label htmlFor="name">
								Название дешборда <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={e => handleInputChange('name', e.target.value)}
								placeholder="Введите название дешборда"
								className={errors.name ? 'border-red-500' : ''}
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
							/>
							{errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
						</div>
						<div className="space-y-2 max-w-[70px]">
							<Label htmlFor="icon">Иконка</Label>
							<Input
								id="icon"
								value={formData.icon}
								onChange={e => handleInputChange('icon', e.target.value)}
								placeholder="📈"
								maxLength={10}
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* База данных */}
					<div className="space-y-2">
						<Label htmlFor="databaseId">
							База данных <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.databaseId}
							onValueChange={value => handleInputChange('databaseId', value)}
							disabled={!!dashboard} // Нельзя менять БД у существующего дешборда
						>
							<SelectTrigger className={cn(errors.databaseId ? 'border-red-500' : '', 'w-full')}>
								<SelectValue placeholder="Выберите базу данных" />
							</SelectTrigger>
							<SelectContent>
								{allDatabases.length === 0 ? (
									<SelectItem value="" disabled>
										Нет доступных баз данных
									</SelectItem>
								) : (
									allDatabases.map(database => (
										<SelectItem key={database.id} value={database.id}>
											<span className="text-sm font-medium">{database.name}</span>
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						{errors.databaseId && <p className="text-sm text-red-500">{errors.databaseId}</p>}
					</div>

					{/* Общая ошибка */}
					{errors.general && (
						<div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
							{errors.general}
						</div>
					)}

					{/* Кнопки действий */}
					<div className="flex gap-3 pt-4">
						<Button type="submit" disabled={isSubmitting} className="flex-1">
							{isSubmitting ? 'Сохранение...' : dashboard ? 'Сохранить' : 'Создать'}
						</Button>
						<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
							Отмена
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
});
