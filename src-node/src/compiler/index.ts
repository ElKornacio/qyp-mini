import { CompileResult, VirtualFile } from '../types';

import { CompileOptions } from '../types';

export class Compiler {
	constructor() {}

	compile(files: VirtualFile[], options: CompileOptions = {}): Promise<CompileResult> {
		return Promise.resolve({
			javascript: '',
			css: '',
		});
	}
}
