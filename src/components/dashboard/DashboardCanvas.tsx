import { useCellSize } from '@/hooks/useCellSize';
import { DashboardWidgetComponent } from './DashboardWidgetComponent';
import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { WidgetDescriptior } from '@/stores/DashboardStore';

interface DashboardCanvasProps {
	cols: number;
	rows: number;
	widgets?: WidgetDescriptior[];
	onWidgetMove?: (widgetId: string, x: number, y: number) => void;
	onWidgetRemove?: (widgetId: string) => void;
}

export const DashboardCanvas = observer(
	({ cols, rows, widgets = [], onWidgetMove, onWidgetRemove }: DashboardCanvasProps) => {
		const { containerRef, containerWidth, cellSize } = useCellSize(cols);
		const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
		const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
		const [isShiftPressed, setIsShiftPressed] = useState(false);

		// Track shift key state and global mouse events for dragging
		useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Shift') {
					setIsShiftPressed(true);
				}
			};

			const handleKeyUp = (e: KeyboardEvent) => {
				if (e.key === 'Shift') {
					setIsShiftPressed(false);
					// Cancel drag if shift is released
					if (draggedWidget) {
						setDraggedWidget(null);
						setDragOffset({ x: 0, y: 0 });
						document.body.style.userSelect = '';
						document.body.style.cursor = '';
					}
				}
			};

			const handleGlobalMouseMove = (e: MouseEvent) => {
				if (!draggedWidget || !isShiftPressed) return;

				e.preventDefault();

				const gridElement = document.querySelector('.dashboard-canvas');
				if (!gridElement) return;

				const gridRect = gridElement.getBoundingClientRect();
				const mouseX = e.clientX - gridRect.left - dragOffset.x;
				const mouseY = e.clientY - gridRect.top - dragOffset.y;

				console.log('mouseX, mouseY', mouseX, mouseY);

				const gridX = Math.round(mouseX / cellSize);
				const gridY = Math.round(mouseY / cellSize);

				console.log('gridX, gridY', gridX, gridY);

				const clampedX = Math.max(0, Math.min(gridX, cols - 1));
				const clampedY = Math.max(0, Math.min(gridY, rows - 1));

				console.log('clampedX, clampedY', clampedX, clampedY);

				const widget = widgets.find(w => w.data.id === draggedWidget);
				if (widget) {
					const maxX = cols - widget.data.layout.width;
					const maxY = rows - widget.data.layout.height;

					console.log('widget.data.layout', widget.data.layout);
					console.log('maxX, maxY', maxX, maxY);

					const finalX = Math.max(0, Math.min(clampedX, maxX));
					const finalY = Math.max(0, Math.min(clampedY, maxY));

					console.log('finalX, finalY', finalX, finalY);

					if (widget.data.layout.x !== finalX || widget.data.layout.y !== finalY) {
						onWidgetMove?.(draggedWidget, finalX, finalY);
					}
				}
			};

			const handleGlobalMouseUp = () => {
				if (draggedWidget) {
					setDraggedWidget(null);
					setDragOffset({ x: 0, y: 0 });

					// Восстанавливаем стили
					document.body.style.userSelect = '';
					document.body.style.cursor = '';
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
			window.addEventListener('mousemove', handleGlobalMouseMove);
			window.addEventListener('mouseup', handleGlobalMouseUp);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				window.removeEventListener('keyup', handleKeyUp);
				window.removeEventListener('mousemove', handleGlobalMouseMove);
				window.removeEventListener('mouseup', handleGlobalMouseUp);
			};
		}, [draggedWidget, dragOffset, isShiftPressed, cellSize, cols, rows, widgets, onWidgetMove]);

		// Validate props
		if (!cols || !rows || cellSize === undefined) {
			console.error('DashboardCanvas: Invalid props!', { cols, rows, cellSize });
			return (
				<div className="border-2 border-red-500 bg-red-100 p-4">
					<p className="text-red-700">Error: Invalid grid settings</p>
					<pre className="text-xs">{JSON.stringify({ cols, rows, cellSize }, null, 2)}</pre>
				</div>
			);
		}

		const canvasWidth = '100%';
		const canvasHeight = rows * cellSize; // Промежутки только между ячейками

		const getPositionFromGridCoords = useCallback(
			(gridX: number, gridY: number) => {
				return {
					x: gridX * cellSize,
					y: gridY * cellSize,
				};
			},
			[cellSize],
		);

		const handleWidgetMouseDown = useCallback(
			(e: React.MouseEvent, widgetId: string) => {
				if (!isShiftPressed) return;

				e.preventDefault();
				e.stopPropagation();

				// Предотвращаем выделение текста и другие сайд-эффекты
				document.body.style.userSelect = 'none';
				document.body.style.cursor = 'grabbing';

				setDraggedWidget(widgetId);

				const rect = e.currentTarget.getBoundingClientRect();
				setDragOffset({
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				});
			},
			[isShiftPressed],
		);

		const handleWidgetRemove = useCallback(
			(widgetId: string) => {
				onWidgetRemove?.(widgetId);
			},
			[onWidgetRemove],
		);

		return (
			<div
				ref={containerRef}
				className={`dashboard-canvas border-2 border-dashed border-gray-400 bg-white relative ${isShiftPressed ? 'select-none' : ''}`}
				style={{
					width: canvasWidth,
					height: canvasHeight,
					backgroundImage: `
					radial-gradient(circle at 0 0, #374151 2px, transparent 2px),
					radial-gradient(circle at 100% 0, #374151 2px, transparent 2px),
					radial-gradient(circle at 0 100%, #374151 2px, transparent 2px),
					radial-gradient(circle at 100% 100%, #374151 2px, transparent 2px)
				`,
					backgroundSize: `${cellSize}px ${cellSize}px`,
					backgroundPosition: `${0}px ${0}px`,
				}}
			>
				{/* Debug info */}
				<div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 text-xs font-mono rounded">
					{containerWidth}×{Math.round(canvasHeight)}px ({cols}×{rows} grid, cell: {Math.round(cellSize)}px)
				</div>

				{/* Widgets */}
				{widgets.map(widget => {
					const position = getPositionFromGridCoords(widget.data.layout.x, widget.data.layout.y);
					const size = {
						width: widget.data.layout.width * cellSize,
						height: widget.data.layout.height * cellSize,
					};

					return (
						<DashboardWidgetComponent
							key={widget.data.id}
							descriptor={widget}
							position={position}
							size={size}
							isDragging={draggedWidget === widget.data.id}
							isEditMode={isShiftPressed}
							onMouseDown={e => handleWidgetMouseDown(e, widget.data.id)}
							onRemove={() => handleWidgetRemove(widget.data.id)}
						/>
					);
				})}
			</div>
		);
	},
);
