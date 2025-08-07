import { observer } from 'mobx-react';
import { Button } from '@/components/ui/button';
import { widgetsLibraryStore } from '@/stores/WidgetsLibrary';
import { Save, RefreshCw } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
	ensureMonacoWorkers,
	applyDefaultDarkTheme,
	configureTypescript,
	registerReactTypings,
	registerProjectVirtualTypings,
} from '@/lib/monaco/setup';
import { useEffect, useRef } from 'react';

export const CodeEditor = observer(() => {
	// Настраиваем воркеры Monaco один раз
	ensureMonacoWorkers();

	// Список добавленных дополнительных typings, чтобы корректно очищать при размонтировании
	const extraLibDisposablesRef = useRef<any[] | null>(null);

	// Настройка Monaco после монтирования редактора
	const handleEditorMount: OnMount = (editor, monaco) => {
		// Включаем автоподстройку размера редактора
		editor.updateOptions({ automaticLayout: true });

		// Тема
		applyDefaultDarkTheme(monaco);

		// TypeScript опции
		configureTypescript(monaco);

		// Регистрация полных типов и внутренних d.ts
		const extraLibDisposables: any[] = [];
		extraLibDisposables.push(...registerReactTypings(monaco));
		extraLibDisposables.push(...registerProjectVirtualTypings(monaco));

		// 4) Типинги для виртуальных модулей проекта
		const uiButtonDts = [
			"declare module '@/components/ui/button' {",
			"  import React from 'react';",
			'  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}',
			'  export const Button: React.FC<ButtonProps>;',
			'  export default Button;',
			'}',
		].join('\n');
		extraLibDisposables.push(
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
		extraLibDisposables.push(
			monaco.languages.typescript.typescriptDefaults.addExtraLib(utilsDts, 'ts:virtual/@/lib/utils.d.ts'),
		);

		const querySqlDts = [
			"declare module '@/widget/query.sql' {",
			'  const fn: <T = any>() => Promise<T>;',
			'  export default fn;',
			'}',
		].join('\n');
		extraLibDisposables.push(
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				querySqlDts,
				'ts:virtual/@/widget/query.sql.d.ts',
			),
		);

		// Сохраняем disposables для очистки при размонтировании
		extraLibDisposablesRef.current = extraLibDisposables;
	};

	// Чистим добавленные extraLibs при размонтировании компонента
	useEffect(() => {
		return () => {
			if (extraLibDisposablesRef.current) {
				for (const d of extraLibDisposablesRef.current) {
					try {
						d?.dispose?.();
					} catch (_) {}
				}
				extraLibDisposablesRef.current = null;
			}
		};
	}, []);

	return (
		<div className="h-full flex flex-col p-4 flex-1 min-h-0">
			{/* Заголовок и панель управления */}
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-medium">Исходный код</h3>
				<div className="flex gap-2">
					<Button
						onClick={() => widgetsLibraryStore.compileBundle()}
						disabled={
							widgetsLibraryStore.isCompiling ||
							!widgetsLibraryStore.widgetTsx.trim() ||
							!widgetsLibraryStore.hasCodeChanges
						}
						variant="outline"
					>
						{widgetsLibraryStore.isCompiling ? (
							<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<RefreshCw className="w-4 h-4 mr-2" />
						)}
						Компилировать
					</Button>
					<Button
						onClick={() => widgetsLibraryStore.saveWidget()}
						disabled={
							widgetsLibraryStore.isSaving ||
							!widgetsLibraryStore.hasUnsavedChanges ||
							widgetsLibraryStore.hasCodeChanges ||
							widgetsLibraryStore.isCompiling ||
							!widgetsLibraryStore.runtime.compiledBundle
						}
					>
						{widgetsLibraryStore.isSaving ? (
							<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Save className="w-4 h-4 mr-2" />
						)}
						Сохранить
					</Button>
				</div>
			</div>

			{/* Предупреждения валидации */}
			{widgetsLibraryStore.validationResult?.warnings.length ? (
				<div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
					<h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
						Предупреждения валидации:
					</h4>
					<ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
						{widgetsLibraryStore.validationResult.warnings.map((warning, index) => (
							<li key={index}>• {warning}</li>
						))}
					</ul>
				</div>
			) : null}

			{/* Monaco Editor */}
			<div className="flex-1 min-h-0 border rounded">
				<Editor
					height="100%"
					language="typescript"
					path="Widget.tsx"
					theme="vs-dark"
					value={widgetsLibraryStore.widgetTsx}
					onChange={value => {
						// Безопасно обновляем стор даже при undefined
						widgetsLibraryStore.widgetTsx = value ?? '';
					}}
					onMount={handleEditorMount}
					options={{
						fontFamily:
							'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
						fontSize: 13,
						minimap: { enabled: false },
						wordWrap: 'on',
						tabSize: 2,
						insertSpaces: true,
						renderWhitespace: 'selection',
						scrollBeyondLastLine: false,
						smoothScrolling: true,
						occurrencesHighlight: 'singleFile',
						contextmenu: true,
						automaticLayout: true,
					}}
				/>
			</div>
		</div>
	);
});
