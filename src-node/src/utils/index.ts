import { VirtualFile } from '../types/index.js';

/**
 * Создает карту виртуальных файлов для удобного доступа
 */
export function createVirtualFileMap(files: VirtualFile[]): Map<string, string> {
	const fileMap = new Map<string, string>();

	for (const file of files) {
		fileMap.set(file.path, file.content);
	}

	return fileMap;
}

/**
 * Находит входную точку (.tsx файл) среди предоставленных файлов
 */
export function findEntryPoint(files: VirtualFile[]): string | null {
	// Ищем index.tsx или первый .tsx файл
	const indexFile = files.find(f => f.path.endsWith('index.tsx'));
	if (indexFile) {
		return indexFile.path;
	}

	const tsxFile = files.find(f => f.path.endsWith('.tsx'));
	return tsxFile?.path || null;
}

/**
 * Извлекает все пути .tsx файлов для настройки Tailwind content
 */
export function getTsxFilePaths(files: VirtualFile[]): string[] {
	return files.filter(f => f.path.endsWith('.tsx')).map(f => f.path);
}

/**
 * Создает временный резолвер для esbuild для работы с виртуальными файлами
 */
export function createVirtualFileResolver(fileMap: Map<string, string>) {
	return {
		/**
		 * Резолвит путь к виртуальному файлу
		 */
		resolve: (path: string): string | null => {
			if (fileMap.has(path)) {
				return path;
			}

			// Попробуем найти с добавлением расширений
			const withExtensions = ['.tsx', '.ts', '.jsx', '.js'];
			for (const ext of withExtensions) {
				const pathWithExt = path + ext;
				if (fileMap.has(pathWithExt)) {
					return pathWithExt;
				}
			}

			// Попробуем найти index файл в директории
			const indexPaths = [`${path}/index.tsx`, `${path}/index.ts`, `${path}/index.jsx`, `${path}/index.js`];

			for (const indexPath of indexPaths) {
				if (fileMap.has(indexPath)) {
					return indexPath;
				}
			}

			return null;
		},

		/**
		 * Получает содержимое файла
		 */
		load: (path: string): string | null => {
			return fileMap.get(path) || null;
		},
	};
}

/**
 * Безопасно парсит JSON с обработкой ошибок
 */
export function safeJsonParse<T>(json: string): T | null {
	try {
		return JSON.parse(json) as T;
	} catch {
		return null;
	}
}

/**
 * Создает ошибку с дополнительной информацией
 */
export function createError(message: string, originalError?: unknown): Error {
	const error = new Error(message);

	if (originalError instanceof Error) {
		error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
	}

	return error;
}
