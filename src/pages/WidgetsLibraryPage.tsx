import { observer } from 'mobx-react';
import { WidgetsSidebar, WidgetEditor } from './WidgetsLibrary';

export const WidgetsLibraryPage = observer(() => {
	return (
		<div className="h-full flex bg-background">
			{/* Левый сайдбар со списком виджетов */}
			<WidgetsSidebar />

			{/* Основная область редактирования */}
			<WidgetEditor />
		</div>
	);
});
