// Экспорт типов
export * from './abstract';

// Экспорт конкретных реализаций
export * from './tauri';
export * from './browser';

// Импорт платформ для автоматической детекции
import { TauriPlatform } from './tauri';
import { BrowserPlatform } from './browser';
import { PlatformManager } from './abstract';

/**
 * Автоматическое определение и создание подходящей платформы
 */
function createPlatform(): PlatformManager {
	// Проверяем наличие Tauri API
	if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
		const tauriPlatform = new TauriPlatform();
		console.log('🖥️ Используется Tauri платформа');
		return tauriPlatform;
	} else {
		const browserPlatform = new BrowserPlatform();
		console.log('🌐 Используется Browser платформа');
		return browserPlatform;
	}
}

/**
 * Глобальный экземпляр платформы
 * Автоматически определяется при импорте
 */
export const platform = createPlatform();
