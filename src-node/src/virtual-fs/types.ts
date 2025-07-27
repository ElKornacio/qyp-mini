export interface VirtualFileMetadata {
	readonly?: boolean; // индикатор что ИИ можно только читать
	externalized?: boolean; // индикатор, что этот файл не нужен для компиляции - он будет подключен в рантайме
}

export interface VirtualDirectoryMetadata {
	readonly?: boolean; // индикатор что ИИ можно только читать файлы из этой директории
}

export interface VirtualFile {
	type: 'file';
	/** Имя файла */
	name: string;
	/** Содержимое файла */
	content: string;
	/** Метаданные файла */
	metadata: VirtualFileMetadata;
}

export interface VirtualDirectory {
	type: 'directory';
	/** Имя директории */
	name: string;
	/** Метаданные директории */
	metadata: VirtualDirectoryMetadata;
}

export type VirtualNode = VirtualDirectory | VirtualFile;

export type SerializedVirtualNode = {
	path: string;
} & VirtualNode;
