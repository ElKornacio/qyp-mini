import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DashboardGrid } from '@/types/dashboard';
import { widgetsRepositoryStore } from '@/stores/WidgetsRepository';

interface AddWidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddWidget: (widgetId: string, title: string, width: number, height: number) => void;
	gridSettings: DashboardGrid;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = observer(({ isOpen, onClose, onAddWidget }) => {
	const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
	const [widgetTitle, setWidgetTitle] = useState('');

	const handleSubmit = () => {
		if (!selectedWidgetId || !selectedWidget) return;

		const { width, height } = selectedWidget.defaultSize || { width: 4, height: 3 };
		onAddWidget(selectedWidgetId, widgetTitle, width, height);

		// Reset form
		setSelectedWidgetId(null);
		setWidgetTitle('');
		onClose();
	};

	const selectedWidget = selectedWidgetId ? widgetsRepositoryStore.getWidget(selectedWidgetId) : null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Добавить виджет на дашборд</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Widget Selection */}
					<div>
						<Label className="text-sm font-medium mb-3 block">Выберите виджет:</Label>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
							{widgetsRepositoryStore.allWidgets.map(widget => (
								<div
									key={widget.id}
									className={`p-3 border rounded-lg cursor-pointer transition-colors ${
										selectedWidgetId === widget.id
											? 'border-primary bg-primary/5'
											: 'border-border hover:bg-muted/50'
									}`}
									onClick={() => {
										setSelectedWidgetId(widget.id);
										setWidgetTitle(widget.name);
									}}
								>
									<div className="space-y-2">
										<div>
											<h4 className="font-medium text-sm truncate">{widget.name}</h4>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												{widget.defaultSize?.width || 4}×{widget.defaultSize?.height || 3}
											</Badge>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Widget Title */}
					<div>
						<Label htmlFor="widget-title" className="text-sm font-medium">
							Название виджета на дашборде:
						</Label>
						<Input
							id="widget-title"
							value={widgetTitle}
							onChange={e => setWidgetTitle(e.target.value)}
							placeholder="Введите название виджета"
							className="mt-1"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Отмена
					</Button>
					<Button onClick={handleSubmit} disabled={!selectedWidgetId || !widgetTitle.trim()}>
						Добавить виджет
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});
