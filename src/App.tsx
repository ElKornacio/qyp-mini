import React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { AppHeader } from './components/AppHeader';
import { DashboardsList } from './components/DashboardsList';
import { EmptyTab } from './components/EmptyTab';
import { WelcomePage, PlaygroundPage, WidgetsLibraryPage, DatabasePage, DashboardPage } from './pages';
import { appTabsStore } from './stores/AppTabsStore';
// import { dashboardStore } from './stores/DashboardStore';

const App: React.FC = observer(() => {
	const { activeTab } = appTabsStore;

	// Функция для рендеринга контента вкладки
	const renderTabContent = () => {
		if (!activeTab) return <EmptyTab />;

		switch (activeTab.type) {
			case 'empty-tab':
				return <EmptyTab />;

			case 'dashboard-list':
				return <DashboardsList />;

			case 'dashboard':
				return <DashboardPage dashboardId={activeTab.payload?.dashboardId || ''} />;

			case 'database':
				return <DatabasePage />;

			case 'widgets-library':
				return <WidgetsLibraryPage />;

			case 'playground':
				return <PlaygroundPage />;

			case 'welcome':
				return <WelcomePage />;

			default:
				return <EmptyTab />;
		}
	};

	return (
		<div className="dark h-screen flex flex-col bg-background text-foreground">
			{/* Header с вкладками */}
			<AppHeader />

			{/* Основной контент */}
			<div className="flex-1 overflow-hidden">{renderTabContent()}</div>
		</div>
	);
});

export default App;
