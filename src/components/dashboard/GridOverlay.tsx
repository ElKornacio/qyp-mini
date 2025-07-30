interface GridOverlayProps {
	cellSize: number;
	gap: number;
	showEditMode?: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ cellSize, gap, showEditMode = false }) => {
	const cellWithGap = cellSize + gap;

	// Create CSS pattern for grid dots - more visible colors
	const dotColor = showEditMode ? '#3b82f6' : '#64748b';
	const dotSize = showEditMode ? '2px' : '2px';

	const gridDots = `radial-gradient(circle at center, ${dotColor} ${dotSize}, transparent ${dotSize})`;

	// Optional grid lines for edit mode
	const gridLines = showEditMode
		? `linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
		   linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`
		: '';

	const backgroundImage = gridLines ? `${gridDots}, ${gridLines}` : gridDots;

	// Debug log
	console.log('GridOverlay render:', {
		cellWithGap,
		showEditMode,
		dotColor,
		backgroundImage,
	});

	return (
		<div
			className="absolute inset-0 pointer-events-none transition-all duration-300"
			style={{
				backgroundImage,
				backgroundSize: `${cellWithGap}px ${cellWithGap}px`,
				backgroundPosition: `${gap}px ${gap}px`,
				opacity: showEditMode ? 1 : 0.8,
			}}
		>
			{showEditMode && <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-lg" />}
		</div>
	);
};
