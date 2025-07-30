import { WindowManager, WindowSize } from '../abstract/window';

/**
 * Browser-реализация менеджера окна
 * Ограниченная функциональность из-за безопасности браузера
 */
export class BrowserWindowManager implements WindowManager {
	async setSize(width: number, height: number): Promise<void> {
		// В браузере нельзя изменить размер окна из соображений безопасности
		console.warn('setSize не поддерживается в браузере');

		// Можем попробовать изменить размер через window.resizeTo,
		// но это работает только для окон, открытых скриптом
		try {
			window.resizeTo(width, height);
		} catch (error) {
			// Игнорируем ошибку, так как это ожидаемо
		}
	}

	async getSize(): Promise<WindowSize> {
		return {
			width: window.innerWidth,
			height: window.innerHeight,
		};
	}

	async minimize(): Promise<void> {
		console.warn('minimize не поддерживается в браузере');
		// В браузере нет API для минимизации окна
	}

	async maximize(): Promise<void> {
		console.warn('maximize не поддерживается в браузере');
		// Пытаемся эмулировать через fullscreen API
		if (document.documentElement.requestFullscreen) {
			try {
				await document.documentElement.requestFullscreen();
			} catch (error) {
				// Игнорируем ошибку
			}
		}
	}

	async close(): Promise<void> {
		// В браузере можем только попробовать закрыть окно
		// Работает только для окон, открытых скриптом
		try {
			window.close();
		} catch (error) {
			console.warn('Невозможно закрыть окно браузера программно');
		}
	}

	async isMaximized(): Promise<boolean> {
		// Проверяем, находится ли браузер в полноэкранном режиме
		return !!document.fullscreenElement;
	}

	async setTitle(title: string): Promise<void> {
		document.title = title;
	}
}
