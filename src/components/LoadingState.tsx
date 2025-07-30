import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
	message?: string;
	size?: 'sm' | 'md' | 'lg';
	fullScreen?: boolean;
}

/**
 * Компонент для отображения состояния загрузки
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
	message = 'Загрузка...',
	size = 'md',
	fullScreen = false,
}) => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
	};

	const content = (
		<div className="flex flex-col items-center justify-center gap-4">
			<RefreshCw className={`${sizeClasses[size]} text-primary animate-spin`} />
			{message && (
				<p className={`text-muted-foreground ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''}`}>
					{message}
				</p>
			)}
		</div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
				{content}
			</div>
		);
	}

	return content;
};
