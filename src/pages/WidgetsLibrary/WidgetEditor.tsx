import { observer } from 'mobx-react';
import { widgetsLibraryStore } from '@/stores/WidgetsLibrary';
import { databaseStore } from '@/stores/DatabaseStore';
import { WidgetPreview } from './WidgetPreview';
import { CodeEditor } from './CodeEditor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WidgetEditor = observer(() => {
	if (!widgetsLibraryStore.selectedWidgetId) {
		return (
			<div className="flex-1 flex flex-col">
				<div className="flex-1 flex items-center justify-center text-muted-foreground">
					<div className="text-center">
						<p className="mb-4">Выберите виджет из списка для редактирования</p>
						<p className="text-sm">или создайте новый виджет</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col">
			{/* Widget Header with Name Editor and Status */}
			<div className="p-4 border-b bg-card">
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Input
							value={widgetsLibraryStore.widgetName}
							onChange={e => (widgetsLibraryStore.widgetName = e.target.value)}
							className="font-semibold text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:border-none"
							placeholder="Название виджета"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
						/>
						{widgetsLibraryStore.hasUnsavedChanges && (
							<Badge variant="secondary" className="text-amber-600 bg-amber-100 dark:bg-amber-900/20">
								Не сохранено
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-3">
						{/* Widget Size Configuration */}
						<div className="flex items-center gap-4">
							<Label className="text-sm font-medium">Размер по умолчанию:</Label>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									<Label htmlFor="widget-width" className="text-xs text-muted-foreground">
										Ширина:
									</Label>
									<Input
										id="widget-width"
										type="number"
										min={1}
										max={12}
										value={widgetsLibraryStore.widgetDefaultSize.width}
										onChange={e => {
											const width = Math.max(1, Math.min(12, parseInt(e.target.value) || 1));
											const height = widgetsLibraryStore.widgetDefaultSize.height;
											widgetsLibraryStore.widgetDefaultSize = { width, height };
										}}
										className="w-16 h-8 text-xs"
										autoCorrect="off"
										autoCapitalize="off"
										spellCheck={false}
									/>
								</div>
								<div className="flex items-center gap-1">
									<Label htmlFor="widget-height" className="text-xs text-muted-foreground">
										Высота:
									</Label>
									<Input
										id="widget-height"
										type="number"
										min={1}
										max={20}
										value={widgetsLibraryStore.widgetDefaultSize.height}
										onChange={e => {
											const height = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
											const width = widgetsLibraryStore.widgetDefaultSize.width;
											widgetsLibraryStore.widgetDefaultSize = { width, height };
										}}
										className="w-16 h-8 text-xs"
										autoCorrect="off"
										autoCapitalize="off"
										spellCheck={false}
									/>
								</div>
							</div>
						</div>

						{/* Database Selection for Preview */}
						<div className="flex items-center gap-4">
							<Label className="text-sm font-medium">База данных для превью:</Label>
							<Select
								value={widgetsLibraryStore.previewDatabaseId || 'none'}
								onValueChange={value =>
									widgetsLibraryStore.setPreviewDatabaseId(value === 'none' ? null : value)
								}
							>
								<SelectTrigger className="w-64">
									<SelectValue placeholder="Выберите БД для тестирования" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Без подключения</SelectItem>
									{databaseStore.allDatabases.map(database => (
										<SelectItem key={database.id} value={database.id}>
											<div className="flex items-center gap-2">
												<span>{database.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			<ResizablePanelGroup direction="vertical">
				<ResizablePanel defaultSize={33}>
					<WidgetPreview />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={66}>
					<CodeEditor />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
});
