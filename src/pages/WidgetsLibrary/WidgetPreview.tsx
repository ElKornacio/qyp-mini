import { observer } from 'mobx-react';
import { createElement } from 'react';
import { widgetsLibraryStore } from '@/stores/WidgetsLibrary';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const WidgetPreview = observer(() => {
	if (!widgetsLibraryStore.runtime.compiledBundle) {
		return (
			<div className="bg-background border rounded p-4 text-center text-muted-foreground">
				<div className="text-2xl mb-2">⚙️</div>
				<p className="text-sm">
					{(() => {
						if (widgetsLibraryStore.compilationError) {
							return `Error: ${widgetsLibraryStore.compilationError}`;
						}
						if (widgetsLibraryStore.isCompiling) {
							return 'Компиляция бандла...';
						}
						return 'Нажмите "Скомпилировать" для просмотра';
					})()}
				</p>
			</div>
		);
	}

	if (!widgetsLibraryStore.previewDatabaseId) {
		return (
			<div className="bg-background border rounded p-4 text-center text-muted-foreground">
				<div className="text-2xl mb-2">⚙️</div>
				<p className="text-sm">Выберите базу данных для просмотра</p>
			</div>
		);
	}

	if (!widgetsLibraryStore.runtime.runtimeComponent) {
		return (
			<div className="bg-background border rounded p-4 text-center text-muted-foreground">
				<div className="text-2xl mb-2">⚙️</div>
				<p className="text-sm">Компиляция компонента...</p>
			</div>
		);
	}

	const renderPreview = () => {
		return (
			<ErrorBoundary
				fallback={error => (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						<div className="text-center">
							<div className="text-2xl mb-2">💥</div>
							<p className="text-sm">Ошибка рендеринга</p>
							<p className="text-xs opacity-70">
								{error instanceof Error ? error.message : 'Неизвестная ошибка'}
							</p>
						</div>
					</div>
				)}
			>
				<div className="space-y-2">
					{createElement(widgetsLibraryStore.runtime.runtimeComponent!.component, {})}
				</div>
			</ErrorBoundary>
		);
	};

	return (
		<div className="h-full bg-card">
			<div className="h-full p-4 flex flex-col">
				<div className="flex-1 overflow-auto">
					{widgetsLibraryStore.compilationError ? (
						<div className="bg-destructive/10 border border-destructive/20 rounded p-3">
							<p className="text-destructive text-sm">{widgetsLibraryStore.compilationError}</p>
						</div>
					) : (
						renderPreview()
					)}
				</div>
			</div>
		</div>
	);
});
