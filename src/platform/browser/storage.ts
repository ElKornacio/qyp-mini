import { StorageManager, DirectoryEntry } from '../abstract/storage';

/**
 * Browser-реализация менеджера файловой системы
 * Использует IndexedDB для эмуляции файловой системы
 */
export class BrowserStorageManager implements StorageManager {
	private readonly dbName = 'qyp-mini-fs';
	private readonly dbVersion = 1;
	private readonly storeName = 'files';

	private async getDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName, { keyPath: 'path' });
				}
			};
		});
	}

	private normalizePath(path: string): string {
		// Удаляем ведущие слеши и нормализуем путь
		return path.replace(/^\/+/, '');
	}

	async writeTextFile(path: string, content: string): Promise<void> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readwrite');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		await new Promise<void>((resolve, reject) => {
			const request = store.put({
				path: normalizedPath,
				content,
				isDirectory: false,
				lastModified: Date.now(),
			});

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async readTextFile(path: string): Promise<string> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readonly');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		return new Promise((resolve, reject) => {
			const request = store.get(normalizedPath);

			request.onsuccess = () => {
				const result = request.result;
				if (result && !result.isDirectory) {
					resolve(result.content || '');
				} else {
					reject(new Error(`Файл не найден: ${path}`));
				}
			};

			request.onerror = () => reject(request.error);
		});
	}

	async exists(path: string): Promise<boolean> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readonly');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		return new Promise(resolve => {
			const request = store.get(normalizedPath);

			request.onsuccess = () => {
				resolve(!!request.result);
			};

			request.onerror = () => resolve(false);
		});
	}

	async mkdir(path: string, recursive = true): Promise<void> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readwrite');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		if (recursive) {
			// Создаем все родительские директории
			const parts = normalizedPath.split('/').filter(p => p);
			let currentPath = '';

			for (const part of parts) {
				currentPath = currentPath ? `${currentPath}/${part}` : part;

				await new Promise<void>((resolve, reject) => {
					const request = store.put({
						path: currentPath,
						content: '',
						isDirectory: true,
						lastModified: Date.now(),
					});

					request.onsuccess = () => resolve();
					request.onerror = () => reject(request.error);
				});
			}
		} else {
			await new Promise<void>((resolve, reject) => {
				const request = store.put({
					path: normalizedPath,
					content: '',
					isDirectory: true,
					lastModified: Date.now(),
				});

				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		}
	}

	async readDir(path: string): Promise<DirectoryEntry[]> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readonly');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);
		const prefix = normalizedPath ? `${normalizedPath}/` : '';

		return new Promise((resolve, reject) => {
			const request = store.getAll();

			request.onsuccess = () => {
				const allFiles = request.result;
				const entries: DirectoryEntry[] = [];
				const seen = new Set<string>();

				for (const file of allFiles) {
					if (file.path.startsWith(prefix)) {
						const relativePath = file.path.substring(prefix.length);
						const firstSegment = relativePath.split('/')[0];

						if (firstSegment && !seen.has(firstSegment)) {
							seen.add(firstSegment);

							const isDirectory = relativePath.includes('/') || file.isDirectory;
							entries.push({
								name: firstSegment,
								isFile: !isDirectory,
								isDirectory,
							});
						}
					}
				}

				resolve(entries);
			};

			request.onerror = () => reject(request.error);
		});
	}

	async removeFile(path: string): Promise<void> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readwrite');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		await new Promise<void>((resolve, reject) => {
			const request = store.delete(normalizedPath);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async removeDir(path: string, recursive = true): Promise<void> {
		const db = await this.getDB();
		const transaction = db.transaction([this.storeName], 'readwrite');
		const store = transaction.objectStore(this.storeName);

		const normalizedPath = this.normalizePath(path);

		if (recursive) {
			// Удаляем все файлы в директории
			const request = store.getAll();

			await new Promise<void>((resolve, reject) => {
				request.onsuccess = () => {
					const allFiles = request.result;
					const promises: Promise<void>[] = [];

					for (const file of allFiles) {
						if (file.path.startsWith(normalizedPath)) {
							promises.push(
								new Promise<void>((res, rej) => {
									const deleteRequest = store.delete(file.path);
									deleteRequest.onsuccess = () => res();
									deleteRequest.onerror = () => rej(deleteRequest.error);
								}),
							);
						}
					}

					Promise.all(promises)
						.then(() => resolve())
						.catch(reject);
				};

				request.onerror = () => reject(request.error);
			});
		} else {
			await this.removeFile(path);
		}
	}

	async getAppDataPath(): Promise<string> {
		// В браузере возвращаем виртуальный путь
		return '/browser-appdata';
	}

	async getDocumentsPath(): Promise<string> {
		// В браузере возвращаем виртуальный путь
		return '/browser-documents';
	}

	async getTempPath(): Promise<string> {
		// В браузере возвращаем виртуальный путь
		return '/browser-temp';
	}
}
