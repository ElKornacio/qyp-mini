import { useState } from 'react';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QypSidecar } from '../lib/sidecar';
import { buildDefaultFS } from '@/virtual-fs/default-fs';

async function compileCodeViaNodejsSidecar(indexTsxContent: string): Promise<string> {
	const vfs = await buildDefaultFS(indexTsxContent);

	const serialized = vfs.serialize();

	const result = await QypSidecar.compile(serialized, '/src/widget/index.tsx');

	return result.jsBundle;
}

export function Playground() {
	const [code, setCode] = useState(`import { Button } from  '@/components/ui/button';
		
export default function MyComponent() {
  return (
    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Hello from Playground!</h2>
      <p className="text-blue-600 dark:text-blue-300">Edit the code on the left to see changes here.</p>
	  <Button>Click me!</Button>
    </div>
  );
}`);

	const [compiledCode, setCompiledCode] = useState<string>('');
	const [isCompiling, setIsCompiling] = useState(false);
	const [compilationError, setCompilationError] = useState<string>('');

	// Функция для компиляции кода через sidecar
	const compileCode = async () => {
		if (!code.trim()) {
			setCompilationError('Код не может быть пустым');
			return;
		}

		setIsCompiling(true);
		setCompilationError('');

		try {
			const result = await compileCodeViaNodejsSidecar(code);

			setCompiledCode(result || '');
			setCompilationError('');
		} catch (error) {
			setCompilationError(error instanceof Error ? error.message : 'Ошибка при обращении к sidecar');
			setCompiledCode('');
		} finally {
			setIsCompiling(false);
		}
	};

	// Функция для рендеринга превью
	const renderPreview = () => {
		if (compilationError) {
			return (
				<div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
					<h3 className="text-sm font-medium mb-2 text-destructive">Ошибка компиляции</h3>
					<p className="text-destructive text-sm whitespace-pre-wrap">{compilationError}</p>
				</div>
			);
		}

		if (compiledCode) {
			return (
				<div className="p-4 bg-muted/20 rounded-lg border border-border/20">
					<h3 className="text-sm font-medium mb-2 text-muted-foreground">Компилированный код</h3>
					<pre className="text-xs bg-card p-3 rounded border border-border/20 overflow-auto whitespace-pre-wrap">
						<code className="text-foreground">{compiledCode}</code>
					</pre>
				</div>
			);
		}

		return (
			<div className="p-4 bg-muted/20 rounded-lg border border-border/20">
				<h3 className="text-sm font-medium mb-2 text-muted-foreground">Исходный код</h3>
				<pre className="text-xs bg-card p-3 rounded border border-border/20 overflow-auto whitespace-pre-wrap">
					<code className="text-foreground">{code}</code>
				</pre>
				<div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
					<h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Hello from Playground!</h2>
					<p className="text-blue-600 dark:text-blue-300">
						Нажмите "Компилировать", чтобы увидеть результат.
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="h-full flex gap-4 p-4 bg-background">
			{/* Левая часть - редактор кода */}
			<Card className="flex-1 bg-card border-border/20">
				<CardHeader>
					<CardTitle className="text-foreground">React Component Code</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Textarea
						value={code}
						onChange={e => setCode(e.target.value)}
						placeholder="Write your React component code here..."
						className="min-h-[450px] font-mono text-sm bg-card border-border/20 text-foreground"
					/>
					<Button onClick={compileCode} disabled={isCompiling || !code.trim()} className="w-full">
						{isCompiling ? 'Компилируется...' : 'Компилировать'}
					</Button>
				</CardContent>
			</Card>

			{/* Правая часть - превью */}
			<Card className="flex-1 bg-card border-border/20">
				<CardHeader>
					<CardTitle className="text-foreground">{compiledCode ? 'Компилированный код' : 'Превью'}</CardTitle>
				</CardHeader>
				<CardContent>{renderPreview()}</CardContent>
			</Card>
		</div>
	);
}
