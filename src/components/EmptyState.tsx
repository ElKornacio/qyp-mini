import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?: 'default' | 'outline' | 'secondary';
	};
	className?: string;
}

/**
 * Компонент для отображения пустого состояния
 * Используется когда нет данных для отображения
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = '' }) => {
	return (
		<div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
			<Icon className="h-12 w-12 text-muted-foreground mb-4" />
			<h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
			{description && <p className="text-muted-foreground mb-4 max-w-md">{description}</p>}
			{action && (
				<Button variant={action.variant || 'default'} onClick={action.onClick}>
					{action.label}
				</Button>
			)}
		</div>
	);
};
