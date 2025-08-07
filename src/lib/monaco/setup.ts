// Все комментарии на русском языке
// Утилиты для настройки Monaco Editor: воркеры, тема, TS-компилятор и типы

// Импорты веб-воркеров Monaco должны быть на верхнем уровне модуля
// eslint-disable-next-line import/no-duplicates
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// eslint-disable-next-line import/no-duplicates
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

// Полные типы React и зависимостей как сырые тексты
// @ts-ignore
import reactIndexDts from '/node_modules/@types/react/index.d.ts?raw';
// @ts-ignore
import reactJsxRuntimeDts from '/node_modules/@types/react/jsx-runtime.d.ts?raw';
// @ts-ignore
import reactJsxDevRuntimeDts from '/node_modules/@types/react/jsx-dev-runtime.d.ts?raw';
// @ts-ignore
import reactExperimentalDts from '/node_modules/@types/react/experimental.d.ts?raw';
// @ts-ignore
import csstypeDts from '/node_modules/csstype/index.d.ts?raw';

// Тип Monaco подгружаем по месту применения, т.к. пакет монолитный
export type Monaco = typeof import('monaco-editor');

/**
 * Обеспечивает корректную инициализацию воркеров Monaco один раз на приложение
 */
export function ensureMonacoWorkers(): void {
	if (typeof globalThis === 'undefined') return;
	const g = globalThis as any;
	if (g.MonacoEnvironment) return;
	g.MonacoEnvironment = {
		getWorker(_workerId: string, label: string) {
			if (label === 'typescript' || label === 'javascript') return new TsWorker();
			if (label === 'json') return new JsonWorker();
			if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
			if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
			return new EditorWorker();
		},
	};
}

/**
 * Устанавливает дефолтную темную тему Monaco (соответствует VS Code Dark+)
 */
export function applyDefaultDarkTheme(monaco: Monaco): void {
	monaco.editor.setTheme('vs-dark');
}

/**
 * Конфигурирует TypeScript-компилятор под TSX/JSX и фичи проекта
 */
export function configureTypescript(monaco: Monaco): void {
	monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
		jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
		jsxFactory: 'React.createElement',
		jsxFragmentFactory: 'React.Fragment',
		target: monaco.languages.typescript.ScriptTarget.ES2020,
		module: monaco.languages.typescript.ModuleKind.ESNext,
		allowJs: true,
		allowNonTsExtensions: true,
		moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
		baseUrl: '/',
		paths: { '@/*': ['src/*'] },
		strict: false,
		noEmit: true,
		lib: ['es2020', 'dom', 'dom.iterable'],
		types: [],
	});
}

/**
 * Регистрирует реальные типы React и зависимостей в Monaco
 */
export function registerReactTypings(monaco: Monaco) {
	const disposables = [] as Array<{ dispose: () => void }>;
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			reactIndexDts as unknown as string,
			'file:///node_modules/@types/react/index.d.ts',
		),
	);
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			reactJsxRuntimeDts as unknown as string,
			'file:///node_modules/@types/react/jsx-runtime.d.ts',
		),
	);
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			reactJsxDevRuntimeDts as unknown as string,
			'file:///node_modules/@types/react/jsx-dev-runtime.d.ts',
		),
	);
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			reactExperimentalDts as unknown as string,
			'file:///node_modules/@types/react/experimental.d.ts',
		),
	);
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			csstypeDts as unknown as string,
			'file:///node_modules/csstype/index.d.ts',
		),
	);
	return disposables;
}

/**
 * Регистрирует d.ts для виртуальных модулей проекта
 */
export function registerProjectVirtualTypings(monaco: Monaco) {
	const disposables = [] as Array<{ dispose: () => void }>;

	const uiButtonDts = [
		"declare module '@/components/ui/button' {",
		"  import React from 'react';",
		'  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}',
		'  export const Button: React.FC<ButtonProps>;',
		'  export default Button;',
		'}',
	].join('\n');
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			uiButtonDts,
			'ts:virtual/@/components/ui/button.d.ts',
		),
	);

	const utilsDts = [
		"declare module '@/lib/utils' {",
		'  export function runSql<T = any>(query: string): Promise<T>;',
		'}',
	].join('\n');
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(utilsDts, 'ts:virtual/@/lib/utils.d.ts'),
	);

	const querySqlDts = [
		"declare module '@/widget/query.sql' {",
		'  const fn: <T = any>() => Promise<T>;',
		'  export default fn;',
		'}',
	].join('\n');
	disposables.push(
		monaco.languages.typescript.typescriptDefaults.addExtraLib(querySqlDts, 'ts:virtual/@/widget/query.sql.d.ts'),
	);

	return disposables;
}
