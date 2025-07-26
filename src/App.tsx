import { useState } from 'react';
import './App.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Welcome, Playground } from './pages';

function App() {
	const [activeTab, setActiveTab] = useState('welcome');

	return (
		<div className="dark h-screen flex flex-col bg-background text-foreground">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
				{/* Панель табов в верхней части */}
				<TabsList className="grid w-full grid-cols-2 h-12 bg-card">
					<TabsTrigger value="welcome" className="text-sm font-medium">
						Welcome
					</TabsTrigger>
					<TabsTrigger value="playground" className="text-sm font-medium">
						Playground
					</TabsTrigger>
				</TabsList>

				{/* Контент табов */}
				<TabsContent value="welcome" className="flex-1 m-0">
					<Welcome />
				</TabsContent>
				<TabsContent value="playground" className="flex-1 m-0">
					<Playground />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default App;
