import { observer } from 'mobx-react';
import { Button } from '@/components/ui/button';
import { widgetsLibraryStore } from '@/stores/WidgetsLibrary';
import { Trash2, Plus } from 'lucide-react';
import { widgetsRepositoryStore } from '@/stores/WidgetsRepository';

export const WidgetsSidebar = observer(() => {
	return (
		<div className="w-80 border-r bg-card">
			<div className="h-full p-4 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-semibold text-lg">Виджеты</h2>
					<Button size="sm" onClick={() => widgetsLibraryStore.createNewWidget()}>
						<Plus className="w-4 h-4 mr-1" />
						Новый
					</Button>
				</div>

				{/* Widgets List */}
				<div className="flex-1 overflow-auto">
					{widgetsRepositoryStore.isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>Загрузка виджетов...</p>
						</div>
					) : widgetsRepositoryStore.allWidgets.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p className="mb-2">Нет виджетов</p>
							<p className="text-sm">Создайте первый виджет</p>
						</div>
					) : (
						<div className="space-y-2">
							{widgetsRepositoryStore.allWidgets.map(widget => (
								<div
									key={widget.id}
									className={`
										group p-3 rounded-lg border cursor-pointer transition-colors
										${widgetsLibraryStore.selectedWidgetId === widget.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}
									`}
									onClick={() => widgetsLibraryStore.selectWidget(widget.id)}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-sm truncate">{widget.name}</h3>
										</div>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
											onClick={e => {
												e.stopPropagation();
												widgetsLibraryStore.deleteWidget(widget.id);
											}}
										>
											<Trash2 className="w-3 h-3 text-destructive" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});
