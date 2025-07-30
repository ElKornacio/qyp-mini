/**
 * Абстрактный интерфейс для работы с диалогами
 */

export interface ConfirmOptions {
	title?: string;
	kind?: 'info' | 'warning' | 'error';
	okLabel?: string;
	cancelLabel?: string;
}

export interface AlertOptions {
	title?: string;
	kind?: 'info' | 'warning' | 'error';
	okLabel?: string;
}

export interface MessageBoxOptions {
	title?: string;
	type?: 'info' | 'warning' | 'error' | 'question';
	buttons?: string[];
	defaultButton?: number;
	cancelButton?: number;
}

export interface DialogManager {
	/**
	 * Показывает диалог подтверждения (да/нет)
	 */
	confirm(message: string, options?: ConfirmOptions): Promise<boolean>;

	/**
	 * Показывает диалог с информацией
	 */
	alert(message: string, options?: AlertOptions): Promise<void>;

	/**
	 * Показывает диалог с произвольными кнопками
	 */
	messageBox(message: string, options?: MessageBoxOptions): Promise<number>;

	/**
	 * Показывает диалог выбора файла для открытия
	 */
	openFile(options?: {
		title?: string;
		filters?: { name: string; extensions: string[] }[];
		multiple?: boolean;
		directory?: boolean;
	}): Promise<string | string[] | null>;

	/**
	 * Показывает диалог выбора файла для сохранения
	 */
	saveFile(options?: {
		title?: string;
		defaultPath?: string;
		filters?: { name: string; extensions: string[] }[];
	}): Promise<string | null>;
}
