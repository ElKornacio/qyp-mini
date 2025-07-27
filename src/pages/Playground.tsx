import { useRef, useState } from 'react';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { buildDefaultFS, getDefaultWidgetQuerySqlTsContent } from '@/virtual-fs/default-fs';
import { tryToMockGlobalModule } from '@/pipeline/modules-mocks/mockGlobalModules';
import { tryToMockShadcnUiModules } from '@/pipeline/modules-mocks/mockShadcnUiModules';
import { tryToMockUtilsModule } from '@/pipeline/modules-mocks/mockUtilsModule';
import { TailwindCompiler } from '@/lib/compiler/TailwindCompiler';
import { ESBuildCompiler } from '@/lib/compiler/ESBuildCompiler';

async function compileCodeToBundleViaNodejsSidecar(
	indexTsxContent: string,
): Promise<{ jsBundle: string; cssBundle: string }> {
	const vfs = await buildDefaultFS(indexTsxContent, getDefaultWidgetQuerySqlTsContent());

	const esbuildCompiler = new ESBuildCompiler();
	const tailwindCompiler = new TailwindCompiler();

	const [jsBundle, cssBundle] = await Promise.all([
		esbuildCompiler.compile(vfs, '/src/widget/index.tsx'),
		tailwindCompiler.compile(vfs),
	]);

	return {
		jsBundle,
		cssBundle,
	};
}

async function compileBundleToComponent(code: string) {
	const wrappedIIFE = `(function(module, require) {
		${code}
	})(__module__, __require__)`;

	const executeModule = new Function('__module__', '__require__', wrappedIIFE);

	const context: any = {
		// на будущее
	};

	const customModule: any = { exports: {} };

	const customRequire = (path: string) => {
		let resolvedModule: any;
		if ((resolvedModule = tryToMockGlobalModule(context, path))) {
			return resolvedModule;
		} else if ((resolvedModule = tryToMockShadcnUiModules(context, path))) {
			return resolvedModule;
		} else if ((resolvedModule = tryToMockUtilsModule(context, path))) {
			return resolvedModule;
		}

		throw new Error(`Module ${path} not found`);
	};

	executeModule(customModule, customRequire);

	return customModule.exports.default;
}

export function Playground() {
	const [code, setCode] = useState(`
import { useState, useEffect } from 'react';
import { Button } from  '@/components/ui/button';
import fetchUsersCount from '@/widget/query.sql';
		
export default function MyComponent() {
	const [usersCount, setUsersCount] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetchUsersCount().then(rows => setUsersCount(rows[0].count));
		setLoading(false);
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

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
	const BuiltComponentRef = useRef<React.FunctionComponent<{}> | null>(null);
	const [builtComponentTicker, setBuiltComponentTicker] = useState(0);

	// Функция для компиляции кода через sidecar
	const compileCode = async () => {
		if (!code.trim()) {
			setCompilationError('Код не может быть пустым');
			return;
		}

		setIsCompiling(true);
		setCompilationError('');

		try {
			const result = await compileCodeToBundleViaNodejsSidecar(code);

			const component = await compileBundleToComponent(result.jsBundle);

			console.log('result.css: ', result.cssBundle);

			BuiltComponentRef.current = component;
			setBuiltComponentTicker(prev => prev + 1);

			setCompiledCode(result.jsBundle || '');
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
						className="min-h-[450px] font-mono md:text-xs bg-card border-border/20 text-foreground"
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
				<CardContent>Component: {BuiltComponentRef.current ? <BuiltComponentRef.current /> : null}</CardContent>
				<CardContent>Code: {renderPreview()}</CardContent>
			</Card>
		</div>
	);
}
