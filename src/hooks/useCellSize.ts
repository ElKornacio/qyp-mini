import { useRef, useLayoutEffect, useState } from 'react';

export const useCellSize = (cols: number) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState(0);

	// Измеряем ширину контейнера
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateWidth = () => {
			// Получаем computed width, который учитывает все стили
			const rect = container.getBoundingClientRect();
			setContainerWidth(rect.width);
		};

		// Используем ResizeObserver для точного отслеживания изменений размера
		const resizeObserver = new ResizeObserver(() => {
			updateWidth();
		});

		resizeObserver.observe(container);

		// Первоначальное измерение
		updateWidth();

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Рассчитываем размер ячейки динамически
	// Доступная ширина = общая ширина - промежутки между ячейками
	const availableWidth = containerWidth;
	const cellSize = availableWidth > 0 ? availableWidth / cols : 0;

	return {
		containerRef,
		containerWidth,
		cellSize,
	};
};
