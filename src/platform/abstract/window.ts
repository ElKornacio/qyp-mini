/**
 * Абстрактный интерфейс для управления окном приложения
 */
export interface WindowSize {
	width: number;
	height: number;
}

export interface WindowManager {
	/**
	 * Устанавливает размер окна
	 */
	setSize(width: number, height: number): Promise<void>;

	/**
	 * Получает текущий размер окна
	 */
	getSize(): Promise<WindowSize>;

	/**
	 * Минимизирует окно
	 */
	minimize(): Promise<void>;

	/**
	 * Максимизирует окно
	 */
	maximize(): Promise<void>;

	/**
	 * Закрывает окно
	 */
	close(): Promise<void>;

	/**
	 * Проверяет, максимизировано ли окно
	 */
	isMaximized(): Promise<boolean>;

	/**
	 * Устанавливает заголовок окна
	 */
	setTitle(title: string): Promise<void>;
}
