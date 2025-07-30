import { observer } from 'mobx-react';
import { createElement } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Move } from 'lucide-react';
import { WidgetDescriptior } from '@/stores/DashboardStore';

interface DashboardWidgetComponentProps {
	descriptor: WidgetDescriptior;
	position: { x: number; y: number };
	size: { width: number; height: number };
	isDragging: boolean;
	isEditMode: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
	onRemove: () => void;
}

export const DashboardWidgetComponent: React.FC<DashboardWidgetComponentProps> = observer(
	({ descriptor, position, size, isDragging, isEditMode, onMouseDown, onRemove }) => {
		const widgetMetadata = descriptor.widget;
		const runtime = descriptor.runtime;

		const renderWidgetContent = () => {
			if (!widgetMetadata) {
				return (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<div className="text-2xl mb-2">⚠️</div>
							<p className="text-sm">Виджет не найден</p>
							<p className="text-xs opacity-70">ID: {descriptor.data.id}</p>
						</div>
					</div>
				);
			}

			if (!runtime.runtimeComponent) {
				return (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<div className="text-2xl mb-2">❓</div>
							<p className="text-sm">Компонент не готов</p>
						</div>
					</div>
				);
			}

			try {
				return createElement(runtime.runtimeComponent.component, descriptor.data.props || {});
			} catch (error) {
				return (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<div className="text-2xl mb-2">💥</div>
							<p className="text-sm">Ошибка рендеринга</p>
							<p className="text-xs opacity-70">
								{error instanceof Error ? error.message : 'Неизвестная ошибка'}
							</p>
						</div>
					</div>
				);
			}
		};

		return (
			<div
				className={`absolute border-2 rounded-lg bg-background transition-all duration-200 ${
					isDragging
						? 'border-primary shadow-lg z-50 scale-105'
						: isEditMode
							? 'border-dashed border-primary/60 shadow-md'
							: 'border-border hover:border-primary/40'
				} ${isEditMode ? 'cursor-move' : ''}`}
				style={{
					left: position.x,
					top: position.y,
					width: size.width,
					height: size.height,
				}}
				onMouseDown={isEditMode ? onMouseDown : undefined}
			>
				{/* Widget Header - only show in edit mode */}
				{isEditMode && (
					<div className="absolute -top-8 left-0 flex items-center gap-2 bg-background border border-border rounded-t-md px-2 py-1 shadow-sm">
						<Move className="w-3 h-3 text-muted-foreground" />
						<span className="text-xs font-medium truncate max-w-32">
							{descriptor.data.title || widgetMetadata?.name || `Widget ${descriptor.data.id.slice(-4)}`}
						</span>
						<Badge variant="outline" className="text-xs px-1 py-0">
							{descriptor.data.layout.width}×{descriptor.data.layout.height}
						</Badge>
						<div className="flex gap-1">
							<Button
								size="sm"
								variant="ghost"
								className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
								onClick={e => {
									e.stopPropagation();
									e.preventDefault();
									if (!isDragging) {
										onRemove();
									}
								}}
								onMouseDown={e => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								<Trash2 className="w-3 h-3" />
							</Button>
						</div>
					</div>
				)}

				{/* Widget Content */}
				<div
					className={`w-full h-full overflow-hidden rounded-lg ${isEditMode ? 'pointer-events-none select-none' : ''}`}
					onClick={e => {
						if (isEditMode) {
							e.stopPropagation();
							e.preventDefault();
						}
					}}
				>
					{renderWidgetContent()}
				</div>

				{/* Edit Mode Overlay */}
				{isEditMode && <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />}
			</div>
		);
	},
);
