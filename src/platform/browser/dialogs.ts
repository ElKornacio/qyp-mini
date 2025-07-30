import { DialogManager, ConfirmOptions, AlertOptions, MessageBoxOptions } from '../abstract/dialogs';

/**
 * Browser-реализация менеджера диалогов
 * Использует нативные браузерные диалоги и эмуляцию через DOM
 */
export class BrowserDialogManager implements DialogManager {
	async confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
		// Используем нативный confirm браузера
		const title = options?.title ? `${options.title}\n\n` : '';
		return window.confirm(`${title}${message}`);
	}

	async alert(message: string, options?: AlertOptions): Promise<void> {
		// Используем нативный alert браузера
		const title = options?.title ? `${options.title}\n\n` : '';
		window.alert(`${title}${message}`);
	}

	async messageBox(message: string, options?: MessageBoxOptions): Promise<number> {
		// Для простых случаев используем confirm
		if (!options?.buttons || options.buttons.length <= 2) {
			const result = await this.confirm(message, {
				title: options?.title,
			});
			return result ? options?.defaultButton || 0 : options?.cancelButton || 1;
		}

		// Для сложных диалогов создаем кастомный modal
		return new Promise(resolve => {
			const modal = this.createModal(message, options);
			document.body.appendChild(modal);

			// Добавляем обработчики для кнопок
			const buttons = modal.querySelectorAll('button[data-index]');
			buttons.forEach((button, index) => {
				button.addEventListener('click', () => {
					document.body.removeChild(modal);
					resolve(index);
				});
			});

			// Обработка Escape
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					document.removeEventListener('keydown', handleKeyDown);
					document.body.removeChild(modal);
					resolve(options?.cancelButton || buttons.length - 1);
				}
			};
			document.addEventListener('keydown', handleKeyDown);
		});
	}

	async openFile(options?: {
		title?: string;
		filters?: { name: string; extensions: string[] }[];
		multiple?: boolean;
		directory?: boolean;
	}): Promise<string | string[] | null> {
		return new Promise(resolve => {
			const input = document.createElement('input');
			input.type = 'file';
			input.multiple = !!options?.multiple;

			if (options?.directory) {
				// @ts-ignore - webkitdirectory не в стандартных типах
				input.webkitdirectory = true;
			}

			if (options?.filters) {
				const accept = options.filters
					.flatMap(filter => filter.extensions)
					.map(ext => `.${ext}`)
					.join(',');
				input.accept = accept;
			}

			input.onchange = () => {
				const files = Array.from(input.files || []);
				if (files.length === 0) {
					resolve(null);
					return;
				}

				if (options?.multiple) {
					resolve(files.map(file => file.name));
				} else {
					resolve(files[0].name);
				}
			};

			input.oncancel = () => resolve(null);
			input.click();
		});
	}

	async saveFile(options?: {
		title?: string;
		defaultPath?: string;
		filters?: { name: string; extensions: string[] }[];
	}): Promise<string | null> {
		// В браузере нет прямого API для "Save As" диалога
		// Возвращаем имя файла по умолчанию или запрашиваем у пользователя
		const filename = options?.defaultPath || window.prompt(options?.title || 'Введите имя файла:', 'untitled.txt');

		return filename;
	}

	private createModal(message: string, options?: MessageBoxOptions): HTMLElement {
		const modal = document.createElement('div');
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
			font-family: system-ui, sans-serif;
		`;

		const dialog = document.createElement('div');
		dialog.style.cssText = `
			background: white;
			border-radius: 8px;
			padding: 24px;
			max-width: 400px;
			box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		`;

		if (options?.title) {
			const title = document.createElement('h3');
			title.textContent = options.title;
			title.style.cssText = `
				margin: 0 0 16px 0;
				font-size: 18px;
				font-weight: 600;
			`;
			dialog.appendChild(title);
		}

		const messageEl = document.createElement('p');
		messageEl.textContent = message;
		messageEl.style.cssText = `
			margin: 0 0 24px 0;
			color: #374151;
			line-height: 1.5;
		`;
		dialog.appendChild(messageEl);

		const buttonsContainer = document.createElement('div');
		buttonsContainer.style.cssText = `
			display: flex;
			gap: 8px;
			justify-content: flex-end;
		`;

		const buttons = options?.buttons || ['OK'];
		buttons.forEach((buttonText, index) => {
			const button = document.createElement('button');
			button.textContent = buttonText;
			button.setAttribute('data-index', index.toString());
			button.style.cssText = `
				padding: 8px 16px;
				border-radius: 6px;
				border: 1px solid #d1d5db;
				background: ${index === (options?.defaultButton || 0) ? '#3b82f6' : 'white'};
				color: ${index === (options?.defaultButton || 0) ? 'white' : '#374151'};
				cursor: pointer;
				font-size: 14px;
			`;

			button.onmouseover = () => {
				if (index !== (options?.defaultButton || 0)) {
					button.style.background = '#f9fafb';
				}
			};

			button.onmouseout = () => {
				if (index !== (options?.defaultButton || 0)) {
					button.style.background = 'white';
				}
			};

			buttonsContainer.appendChild(button);
		});

		dialog.appendChild(buttonsContainer);
		modal.appendChild(dialog);

		return modal;
	}
}
