import { BaseRequest } from '../ipc/index.js';
import { SerializedVirtualNode } from '../../../src/virtual-fs/types.js';

export interface PingRequest extends BaseRequest {
	message: string;
}

export interface PingResponse {
	message: string;
}

export interface CompileComponentRequest extends BaseRequest {
	serializedVFS: SerializedVirtualNode[];
	entryPoint: string;
}

export interface CompileComponentResponse {
	jsBundle: string;
	cssBundle: string;
}
