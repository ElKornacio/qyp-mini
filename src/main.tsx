import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';

getCurrentWindow().setSize(new LogicalSize(1400, 800));
getCurrentWindow().center();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
