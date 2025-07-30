import { Database } from '@/types/database';
import { ComponentCompiler } from '../compiler/ComponentCompiler';
import {
	WidgetBundleWithDatabase,
	WidgetCompiledBundle,
	WidgetRuntimeComponent,
	WidgetSourceCode,
} from '@/types/widget';
import { ComponentRuntime } from './ComponentRuntime';
import { computed, makeObservable, observable } from 'mobx';
import { analyzeComponentProps } from '../componentAnalyzer';

export class WidgetRuntime {
	private compiler: ComponentCompiler;

	@observable private _sourceCode: WidgetSourceCode | null = null;
	@observable private _compiledBundle: WidgetCompiledBundle | null = null;
	@observable private _bundleWithDatabase: WidgetBundleWithDatabase | null = null;
	@observable private _runtimeComponent: WidgetRuntimeComponent | null = null;

	constructor() {
		this.compiler = new ComponentCompiler();

		makeObservable(this);
	}

	set sourceCode(sourceCode: WidgetSourceCode) {
		this._sourceCode = sourceCode;
		this._compiledBundle = null;
		this._bundleWithDatabase = null;
		this._runtimeComponent = null;
	}

	@computed
	get sourceCode(): WidgetSourceCode | null {
		return this._sourceCode;
	}

	set compiledBundle(compiledBundle: WidgetCompiledBundle) {
		this._sourceCode = compiledBundle;
		this._compiledBundle = compiledBundle;
		this._bundleWithDatabase = null;
		this._runtimeComponent = null;
	}

	@computed
	get compiledBundle(): WidgetCompiledBundle | null {
		return this._compiledBundle;
	}

	set bundleWithDatabase(bundleWithDatabase: WidgetBundleWithDatabase) {
		this._sourceCode = bundleWithDatabase;
		this._compiledBundle = bundleWithDatabase;
		this._bundleWithDatabase = bundleWithDatabase;
		this._runtimeComponent = null;
	}

	@computed
	get bundleWithDatabase(): WidgetBundleWithDatabase | null {
		return this._bundleWithDatabase;
	}

	set runtimeComponent(runtimeComponent: WidgetRuntimeComponent) {
		this._sourceCode = runtimeComponent;
		this._compiledBundle = runtimeComponent;
		this._bundleWithDatabase = runtimeComponent;
		this._runtimeComponent = runtimeComponent;
	}

	get runtimeComponent(): WidgetRuntimeComponent | null {
		return this._runtimeComponent;
	}

	async compileBundle() {
		if (!this._sourceCode) {
			throw new Error('Source code is not set');
		}

		const validationResult = await this.compiler.validate(this._sourceCode.widgetTsx);
		if (!validationResult.isValid) {
			throw new Error('Widget TSX source code is not valid');
		}

		const compilationResult = await this.compiler.compile(this._sourceCode.widgetTsx);
		const props = analyzeComponentProps(this._sourceCode.widgetTsx);

		this.compiledBundle = {
			...this._sourceCode,
			props,
			...compilationResult,
		};
	}

	attachDatabase(database: Database) {
		if (!this._compiledBundle) {
			throw new Error('Compiled bundle is not set');
		}

		const bundleWithDatabase: WidgetBundleWithDatabase = {
			...this._compiledBundle,
			database,
		};

		this.bundleWithDatabase = bundleWithDatabase;
	}

	async buildModule() {
		if (!this._bundleWithDatabase) {
			throw new Error('Bundle with database is not set');
		}

		const runtime = new ComponentRuntime({ database: this._bundleWithDatabase.database });

		const runtimeComponent: WidgetRuntimeComponent = {
			...this._bundleWithDatabase,
			component: runtime.compileComponentModule(this._bundleWithDatabase.jsBundle),
		};

		this.runtimeComponent = runtimeComponent;
	}
}
