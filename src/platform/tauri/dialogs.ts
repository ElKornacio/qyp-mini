import { DialogManager, ConfirmOptions, AlertOptions, MessageBoxOptions } from '../abstract/dialogs';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { open, save } from '@tauri-apps/plugin-dialog';

/**
 * Tauri-реализация менеджера диалогов
 */
export class TauriDialogManager implements DialogManager {
	async confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
		return await confirm(message, {
			title: options?.title || 'Подтверждение',
			kind: options?.kind || 'warning',
			okLabel: options?.okLabel,
			cancelLabel: options?.cancelLabel,
		});
	}

	async alert(msg: string, options?: AlertOptions): Promise<void> {
		await message(msg, {
			title: options?.title || 'Информация',
			kind: options?.kind || 'info',
			okLabel: options?.okLabel,
		});
	}

	async messageBox(msg: string, options?: MessageBoxOptions): Promise<number> {
		// Tauri не поддерживает произвольные кнопки в диалогах,
		// поэтому используем confirm для простых случаев
		if (!options?.buttons || options.buttons.length <= 2) {
			const result = await this.confirm(msg, {
				title: options?.title,
				kind: options?.type === 'error' ? 'error' : options?.type === 'warning' ? 'warning' : 'info',
			});
			return result ? 0 : 1;
		}

		// Для сложных диалогов используем alert и возвращаем 0
		await this.alert(msg, {
			title: options.title,
			kind: options.type === 'error' ? 'error' : options.type === 'warning' ? 'warning' : 'info',
		});
		return 0;
	}

	async openFile(options?: {
		title?: string;
		filters?: { name: string; extensions: string[] }[];
		multiple?: boolean;
		directory?: boolean;
	}): Promise<string | string[] | null> {
		const result = await open({
			title: options?.title,
			filters: options?.filters,
			multiple: options?.multiple,
			directory: options?.directory,
		});

		return result;
	}

	async saveFile(options?: {
		title?: string;
		defaultPath?: string;
		filters?: { name: string; extensions: string[] }[];
	}): Promise<string | null> {
		return await save({
			title: options?.title,
			defaultPath: options?.defaultPath,
			filters: options?.filters,
		});
	}
}
