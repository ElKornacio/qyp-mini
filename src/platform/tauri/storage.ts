import { StorageManager, DirectoryEntry } from '../abstract/storage';
import { writeTextFile, readTextFile, exists, mkdir, readDir, remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appDataDir, documentDir, tempDir } from '@tauri-apps/api/path';

/**
 * Tauri-реализация менеджера файловой системы
 */
export class TauriStorageManager implements StorageManager {
	async writeTextFile(path: string, content: string): Promise<void> {
		await writeTextFile(path, content, {
			baseDir: BaseDirectory.AppData,
		});
	}

	async readTextFile(path: string): Promise<string> {
		return await readTextFile(path, {
			baseDir: BaseDirectory.AppData,
		});
	}

	async exists(path: string): Promise<boolean> {
		return await exists(path, {
			baseDir: BaseDirectory.AppData,
		});
	}

	async mkdir(path: string, recursive = true): Promise<void> {
		await mkdir(path, {
			baseDir: BaseDirectory.AppData,
			recursive,
		});
	}

	async readDir(path: string): Promise<DirectoryEntry[]> {
		const entries = await readDir(path, {
			baseDir: BaseDirectory.AppData,
		});

		return entries.map(entry => ({
			name: entry.name || '',
			isFile: !!entry.isFile,
			isDirectory: !!entry.isDirectory,
		}));
	}

	async removeFile(path: string): Promise<void> {
		await remove(path, {
			baseDir: BaseDirectory.AppData,
		});
	}

	async removeDir(path: string, recursive = true): Promise<void> {
		await remove(path, {
			baseDir: BaseDirectory.AppData,
			recursive,
		});
	}

	async getAppDataPath(): Promise<string> {
		return await appDataDir();
	}

	async getDocumentsPath(): Promise<string> {
		return await documentDir();
	}

	async getTempPath(): Promise<string> {
		return await tempDir();
	}
}
