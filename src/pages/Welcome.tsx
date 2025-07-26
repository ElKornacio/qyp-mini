import { useState } from 'react';
import { Search, Mic, Send, Key, Database, Shuffle, Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Welcome() {
	const [query, setQuery] = useState('');

	const actionButtons = [
		{ icon: Key, label: 'Manage DB credentials', variant: 'secondary' as const },
		{ icon: Database, label: 'Explore DB', variant: 'secondary' as const },
		{ icon: Shuffle, label: 'Switch AI-model', variant: 'secondary' as const },
		{ icon: Settings, label: 'Edit settings', variant: 'secondary' as const },
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Обработка поискового запроса
		console.log('Search query:', query);
	};

	return (
		<div className="h-full flex flex-col items-center justify-center px-6 py-16 bg-background">
			{/* Заголовок */}
			<div className="mb-16">
				<h1 className="text-6xl font-light text-center text-foreground tracking-wide">qYp.ai mini</h1>
			</div>

			{/* Основная форма поиска */}
			<div className="w-full max-w-2xl mb-8">
				<form onSubmit={handleSubmit} className="relative">
					<div className="relative">
						{/* Иконка поиска */}
						<Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground z-10" />

						{/* Поле ввода - многострочное */}
						<Textarea
							value={query}
							onChange={e => setQuery(e.target.value)}
							placeholder="Ask your database anything..."
							className="pl-12 pr-16 py-4 text-lg bg-card border-border/20 focus:border-primary rounded-xl shadow-sm resize-none min-h-[60px] max-h-[200px]"
							rows={3}
						/>

						{/* Дополнительные иконки справа */}
						<div className="absolute right-3 bottom-3 flex items-center gap-2">
							<Button variant="ghost" size="sm" className="p-2 h-8 w-8">
								<Mic className="h-4 w-4 text-muted-foreground" />
							</Button>
							<Button variant="ghost" size="sm" className="p-2 h-8 w-8">
								<Send className="h-4 w-4 text-muted-foreground" />
							</Button>
						</div>
					</div>
				</form>
			</div>

			{/* Кнопки действий */}
			<div className="flex flex-wrap items-center justify-center gap-3 mb-8">
				{actionButtons.map(({ icon: Icon, label, variant }) => (
					<Badge
						key={label}
						variant={variant}
						className="px-4 py-2 bg-card/50 hover:bg-card border border-border/20 cursor-pointer transition-colors"
					>
						<Icon className="h-4 w-4 mr-2" />
						{label}
					</Badge>
				))}
			</div>
		</div>
	);
}
