import { observer } from 'mobx-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { widgetsLibraryStore } from '@/stores/WidgetsLibrary';
import { Save, RefreshCw } from 'lucide-react';

export const CodeEditor = observer(() => {
	return (
		<div className="h-full flex flex-col p-4 flex-1">
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

			{/* Текстовая область для кода */}
			<Textarea
				value={widgetsLibraryStore.widgetTsx}
				onChange={e => (widgetsLibraryStore.widgetTsx = e.target.value)}
				placeholder="Введите код React компонента..."
				className="flex-1 h-full font-mono text-sm resize-none"
			/>
		</div>
	);
});
