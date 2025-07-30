import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, DatabaseCredentials } from '@/types/database';
import { databaseStore } from '@/stores/DatabaseStore';

interface DatabaseFormModalProps {
	open: boolean;
	onClose: () => void;
	database?: Database | null;
}

interface DatabaseFormData extends DatabaseCredentials {
	name: string;
}

const defaultFormData: DatabaseFormData = {
	name: '',
	host: 'localhost',
	port: 5432,
	database: '',
	username: '',
	password: '',
	type: 'postgres',
	ssl: false,
};

export const DatabaseFormModal: React.FC<DatabaseFormModalProps> = observer(({ open, onClose, database }) => {
	const [formData, setFormData] = useState<DatabaseFormData>(defaultFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Инициализация формы при открытии
	useEffect(() => {
		if (open) {
			if (database) {
				setFormData({
					name: database.name,
					host: database.credentials.host,
					port: database.credentials.port,
					database: database.credentials.database,
					username: database.credentials.username,
					password: database.credentials.password,
					type: database.credentials.type,
					ssl: database.credentials.ssl || false,
				});
			} else {
				setFormData(defaultFormData);
			}
			setErrors({});
		}
	}, [open, database]);

	// Валидация формы
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Название обязательно';
		}
		if (!formData.host.trim()) {
			newErrors.host = 'Хост обязателен';
		}
		if (!formData.database.trim()) {
			newErrors.database = 'Название базы данных обязательно';
		}
		if (!formData.username.trim()) {
			newErrors.username = 'Имя пользователя обязательно';
		}
		if (!formData.password.trim()) {
			newErrors.password = 'Пароль обязателен';
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
			const credentials: DatabaseCredentials = {
				host: formData.host,
				port: formData.port,
				database: formData.database,
				username: formData.username,
				password: formData.password,
				type: formData.type,
				ssl: formData.ssl,
			};

			if (database) {
				await databaseStore.updateDatabase(database.id, {
					name: formData.name,
					credentials,
				});
			} else {
				await databaseStore.createDatabase({
					name: formData.name,
					credentials,
				});
			}

			onClose();
		} catch (error) {
			console.error('Ошибка сохранения базы данных:', error);
			setErrors({
				general: 'Не удалось сохранить базу данных. Попробуйте еще раз.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: keyof DatabaseFormData, value: string | number | boolean) => {
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
					<DialogTitle>{database ? 'Редактировать базу данных' : 'Добавить базу данных'}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Название */}
					<div className="space-y-2">
						<Label htmlFor="name">
							Название <span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={e => handleInputChange('name', e.target.value)}
							placeholder="Название подключения"
							className={errors.name ? 'border-red-500' : ''}
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
						/>
						{errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
					</div>

					{/* Тип БД */}
					<div className="space-y-2">
						<Label htmlFor="type">
							Тип БД <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.type}
							onValueChange={value => handleInputChange('type', value as 'postgres' | 'mysql' | 'sqlite')}
						>
							<SelectTrigger>
								<SelectValue placeholder="Выберите тип базы данных" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="postgres">PostgreSQL</SelectItem>
								<SelectItem value="mysql">MySQL</SelectItem>
							</SelectContent>
						</Select>
						{errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
					</div>

					{/* Хост и порт */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="host">
								Хост <span className="text-red-500">*</span>
							</Label>
							<Input
								id="host"
								value={formData.host}
								onChange={e => handleInputChange('host', e.target.value)}
								placeholder="localhost"
								className={errors.host ? 'border-red-500' : ''}
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
							/>
							{errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="port">Порт</Label>
							<Input
								id="port"
								type="number"
								value={formData.port}
								onChange={e => handleInputChange('port', parseInt(e.target.value) || 5432)}
								placeholder="5432"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* База данных */}
					<div className="space-y-2">
						<Label htmlFor="database">
							База данных <span className="text-red-500">*</span>
						</Label>
						<Input
							id="database"
							value={formData.database}
							onChange={e => handleInputChange('database', e.target.value)}
							placeholder="Название базы данных"
							className={errors.database ? 'border-red-500' : ''}
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
						/>
						{errors.database && <p className="text-sm text-red-500">{errors.database}</p>}
					</div>

					{/* Пользователь */}
					<div className="space-y-2">
						<Label htmlFor="username">
							Пользователь <span className="text-red-500">*</span>
						</Label>
						<Input
							id="username"
							value={formData.username}
							onChange={e => handleInputChange('username', e.target.value)}
							placeholder="Имя пользователя"
							className={errors.username ? 'border-red-500' : ''}
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
						/>
						{errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
					</div>

					{/* Пароль */}
					<div className="space-y-2">
						<Label htmlFor="password">
							Пароль <span className="text-red-500">*</span>
						</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={e => handleInputChange('password', e.target.value)}
							placeholder="Пароль"
							className={errors.password ? 'border-red-500' : ''}
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
						/>
						{errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
					</div>

					{/* SSL */}
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="ssl"
							checked={formData.ssl}
							onChange={e => handleInputChange('ssl', e.target.checked)}
							className="h-4 w-4"
						/>
						<Label htmlFor="ssl" className="text-sm font-normal">
							Использовать SSL
						</Label>
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
							{isSubmitting ? 'Сохранение...' : database ? 'Сохранить' : 'Создать'}
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
