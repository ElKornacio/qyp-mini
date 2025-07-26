import { useState } from 'react';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Playground() {
	const [code, setCode] = useState(`function MyComponent() {
  return (
    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Hello from Playground!</h2>
      <p className="text-blue-600 dark:text-blue-300">Edit the code on the left to see changes here.</p>
    </div>
  );
}`);

	// Функция для рендеринга компонента из кода (упрощенная версия)
	const renderPreview = () => {
		try {
			// В реальном приложении здесь бы использовался более сложный парсинг и рендеринг
			// Для демонстрации показываем сам код
			return (
				<div className="p-4 bg-muted/20 rounded-lg border border-border/20">
					<h3 className="text-sm font-medium mb-2 text-muted-foreground">Preview (Code Display)</h3>
					<pre className="text-xs bg-card p-3 rounded border border-border/20 overflow-auto mb-4">
						<code className="text-foreground">{code}</code>
					</pre>
					<div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
						<h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Hello from Playground!</h2>
						<p className="text-blue-600 dark:text-blue-300">
							Edit the code on the left to see changes here.
						</p>
					</div>
				</div>
			);
		} catch (error) {
			return (
				<div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
					<h3 className="text-sm font-medium mb-2 text-destructive">Error in Preview</h3>
					<p className="text-destructive text-sm">{error?.toString()}</p>
				</div>
			);
		}
	};

	return (
		<div className="h-full flex gap-4 p-4 bg-background">
			{/* Левая часть - редактор кода */}
			<Card className="flex-1 bg-card border-border/20">
				<CardHeader>
					<CardTitle className="text-foreground">React Component Code</CardTitle>
				</CardHeader>
				<CardContent>
					<Textarea
						value={code}
						onChange={e => setCode(e.target.value)}
						placeholder="Write your React component code here..."
						className="min-h-[500px] font-mono text-sm bg-card border-border/20 text-foreground"
					/>
				</CardContent>
			</Card>

			{/* Правая часть - превью */}
			<Card className="flex-1 bg-card border-border/20">
				<CardHeader>
					<CardTitle className="text-foreground">Preview</CardTitle>
				</CardHeader>
				<CardContent>{renderPreview()}</CardContent>
			</Card>
		</div>
	);
}
