import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';
import { platform } from './platform';
import { configure } from 'mobx';
import { widgetsRepositoryStore } from './stores/WidgetsRepository';
import { dashboardsRepository } from './stores/DashboardsRepository';
import { databaseStore } from './stores/DatabaseStore';

// Инициализируем платформу и устанавливаем размер окна
async function initApp() {
	// Устанавливаем размер окна (работает только в Tauri)
	try {
		await platform.window.setSize(1400, 800);
	} catch (error) {
		// В браузере это может не работать, это нормально
		console.log('Размер окна не может быть установлен на данной платформе');
	}

	await databaseStore.loadDatabases();
	await widgetsRepositoryStore.loadWidgets();
	await dashboardsRepository.loadDashboards();
}

configure({
	enforceActions: 'never',
});

// Запускаем приложение
initApp();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
