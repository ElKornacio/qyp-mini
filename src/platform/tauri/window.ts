import { WindowManager, WindowSize } from '../abstract/window';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

/**
 * Tauri-реализация менеджера окна
 */
export class TauriWindowManager implements WindowManager {
	private window = getCurrentWindow();

	async setSize(width: number, height: number): Promise<void> {
		await this.window.setSize(new LogicalSize(width, height));
	}

	async getSize(): Promise<WindowSize> {
		const size = await this.window.innerSize();
		return {
			width: size.width,
			height: size.height,
		};
	}

	async minimize(): Promise<void> {
		await this.window.minimize();
	}

	async maximize(): Promise<void> {
		await this.window.maximize();
	}

	async close(): Promise<void> {
		await this.window.close();
	}

	async isMaximized(): Promise<boolean> {
		return await this.window.isMaximized();
	}

	async setTitle(title: string): Promise<void> {
		await this.window.setTitle(title);
	}
}
