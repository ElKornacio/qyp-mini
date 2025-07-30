/**
 * Абстрактный интерфейс для работы с файловой системой
 */

export interface DirectoryEntry {
	name: string;
	isFile: boolean;
	isDirectory: boolean;
}

export interface StorageManager {
	/**
	 * Записывает текст в файл
	 */
	writeTextFile(path: string, content: string): Promise<void>;

	/**
	 * Читает текст из файла
	 */
	readTextFile(path: string): Promise<string>;

	/**
	 * Проверяет существование файла или директории
	 */
	exists(path: string): Promise<boolean>;

	/**
	 * Создает директорию
	 */
	mkdir(path: string, recursive?: boolean): Promise<void>;

	/**
	 * Читает содержимое директории
	 */
	readDir(path: string): Promise<DirectoryEntry[]>;

	/**
	 * Удаляет файл
	 */
	removeFile(path: string): Promise<void>;

	/**
	 * Удаляет директорию
	 */
	removeDir(path: string, recursive?: boolean): Promise<void>;

	/**
	 * Получает путь к директории пользовательских данных приложения
	 */
	getAppDataPath(): Promise<string>;

	/**
	 * Получает путь к директории документов пользователя
	 */
	getDocumentsPath(): Promise<string>;

	/**
	 * Получает путь к временной директории
	 */
	getTempPath(): Promise<string>;
}
