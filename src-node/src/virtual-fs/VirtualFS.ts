import path from 'path';
import {
	VirtualFile,
	VirtualDirectory,
	VirtualDirectoryMetadata,
	VirtualFileMetadata,
	SerializedVirtualNode,
	VirtualNode,
} from './types';

export class VirtualFS {
	private readonly directoriesNodes: Map<string, VirtualDirectory> = new Map();
	private readonly directoriesChildren: Map<string, VirtualNode[]> = new Map();
	private readonly filesNodes: Map<string, VirtualFile> = new Map();

	constructor() {
		this.directoriesNodes.set('/', { name: '', type: 'directory', metadata: {} });
		this.directoriesChildren.set('/', []);
	}

	serialize(predicate: (filePath: string, fileNode: VirtualFile) => boolean = () => true): SerializedVirtualNode[] {
		const dirsPaths = Array.from(this.directoriesNodes.keys()).filter(path => path !== '/');

		// to ensure that dirs will be created in the correct order
		dirsPaths.sort((a, b) => {
			const aDepth = a.split('/').length;
			const bDepth = b.split('/').length;
			if (aDepth === bDepth) {
				return a.localeCompare(b);
			}
			return aDepth - bDepth;
		});

		const result = [];
		for (const dirPath of dirsPaths) {
			const dir = this.directoriesNodes.get(dirPath);
			if (!dir) {
				throw new Error(`Directory ${dirPath} not found`);
			}
			result.push({
				...dir,
				path: dirPath,
			});
		}

		const filesPaths = Array.from(this.filesNodes.keys());

		for (const filePath of filesPaths) {
			const file = this.filesNodes.get(filePath);
			if (!file) {
				throw new Error(`File ${filePath} not found`);
			}
			if (!predicate(filePath, file)) {
				continue;
			}
			result.push({
				...file,
				path: filePath,
			});
		}

		return result;
	}

	deserialize(data: SerializedVirtualNode[]) {
		for (const item of data) {
			if (item.type === 'directory') {
				this.makeDirectory(item.path, item.metadata);
			} else {
				this.writeFile(item.path, item.content, item.metadata);
			}
		}
	}

	readFile(path: string): VirtualFile {
		const file = this.filesNodes.get(path);
		if (!file) {
			throw new Error(`File ${path} not found`);
		}
		return file;
	}

	readDirectory(path: string): VirtualNode[] {
		const directory = this.directoriesNodes.get(path);
		if (!directory) {
			throw new Error(`Directory ${path} not found`);
		}
		const nodes = this.directoriesChildren.get(path);
		if (!nodes) {
			throw new Error(`Directory ${path} no children found`);
		}
		return nodes;
	}

	readDirectoryMetadata(path: string): VirtualDirectoryMetadata {
		const directory = this.directoriesNodes.get(path);
		if (!directory) {
			throw new Error(`Directory ${path} not found`);
		}
		return directory.metadata;
	}

	writeFile(filePath: string, content: string, metadata?: VirtualFileMetadata): void {
		const absPath = path.resolve(filePath);

		const file = this.filesNodes.get(absPath);
		if (file) {
			file.content = content;
		} else {
			const parentDir = path.dirname(absPath);
			const parentDirNode = this.directoriesNodes.get(parentDir);
			if (!parentDirNode) {
				throw new Error(`Parent directory ${parentDir} not found`);
			}
			const parentDirChildren = this.directoriesChildren.get(parentDir);
			if (!parentDirChildren) {
				throw new Error(`Parent directory ${parentDir} no children found`);
			}

			const fileNode: VirtualFile = {
				name: path.basename(absPath),
				type: 'file',
				content,
				metadata: metadata || {},
			};

			parentDirChildren.push(fileNode);
			this.filesNodes.set(absPath, fileNode);
		}
	}

	writeFileMetadata(filePath: string, metadata: VirtualFileMetadata): void {
		const absPath = path.resolve(filePath);
		const file = this.filesNodes.get(absPath);
		if (!file) {
			throw new Error(`File ${absPath} not found`);
		}

		file.metadata = metadata;
	}

	makeDirectory(dirPath: string, metadata?: VirtualDirectoryMetadata): void {
		const absPath = path.resolve(dirPath);
		const directory = this.directoriesNodes.get(absPath);
		if (directory) {
			throw new Error(`Directory ${absPath} already exists`);
		}

		const parentDir = path.dirname(absPath);
		const parentDirNode = this.directoriesNodes.get(parentDir);
		if (!parentDirNode) {
			throw new Error(`Parent directory ${parentDir} not found`);
		}
		const parentDirChildren = this.directoriesChildren.get(parentDir);
		if (!parentDirChildren) {
			throw new Error(`Parent directory ${parentDir} no children found`);
		}

		const directoryNode: VirtualDirectory = {
			name: path.basename(absPath),
			type: 'directory',
			metadata: metadata || {},
		};

		parentDirChildren.push(directoryNode);

		this.directoriesNodes.set(absPath, directoryNode);
		this.directoriesChildren.set(absPath, []);
	}

	fileExists(filePath: string): boolean {
		const absPath = path.resolve(filePath);
		return this.filesNodes.has(absPath);
	}

	directoryExists(dirPath: string): boolean {
		const absPath = path.resolve(dirPath);
		return this.directoriesNodes.has(absPath);
	}

	unlinkFile(filePath: string): void {
		const absPath = path.resolve(filePath);

		const parentDir = path.dirname(absPath);
		const parentDirChildren = this.directoriesChildren.get(parentDir);
		if (!parentDirChildren) {
			throw new Error(`Parent directory ${parentDir} no children found`);
		}

		const fileNode = this.filesNodes.get(absPath);
		if (!fileNode) {
			throw new Error(`File ${absPath} not found`);
		}

		const fileIndex = parentDirChildren.indexOf(fileNode);
		if (fileIndex === -1) {
			throw new Error(`File ${absPath} not found in parent directory ${parentDir}`);
		}
		parentDirChildren.splice(fileIndex, 1);

		this.filesNodes.delete(absPath);
	}

	unlinkDirectory(dirPath: string): void {
		const absPath = path.resolve(dirPath);

		const parentDir = path.dirname(absPath);
		const parentDirChildren = this.directoriesChildren.get(parentDir);
		if (!parentDirChildren) {
			throw new Error(`Parent directory ${parentDir} no children found`);
		}

		const directoryNode = this.directoriesNodes.get(absPath);
		if (!directoryNode) {
			throw new Error(`Directory ${absPath} not found`);
		}

		const directoryIndex = parentDirChildren.indexOf(directoryNode);
		if (directoryIndex === -1) {
			throw new Error(`Directory ${absPath} not found in parent directory ${parentDir}`);
		}
		parentDirChildren.splice(directoryIndex, 1);

		this.directoriesNodes.delete(absPath);
		this.directoriesChildren.delete(absPath);
	}
}
