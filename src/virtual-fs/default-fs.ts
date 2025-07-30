import { VirtualFS } from '@/virtual-fs/VirtualFS';
import { buildShadcnUiFS } from './shadcn-ui';

/**
 * Virtual directory structure:
 * src/                   # Корневая директория
 * ├── components/
 * │   ├── ui/            # Базовые UI-компоненты, readonly (shadcn)
 * ├── widget/
 * │   ├── index.tsx      # Главный файл, которые будет генерировать ИИ - React-компонент с виджетом
 * │   ├── query.sql.ts   # Файл с sql-запросом в базу, экспортирует одну async-функцию, делающую запрос. Тоже генерирует ИИ
 * ├── lib/
 * │   ├── utils.ts       # readonly, здесь будут утилитарные функции аля `cn`
 */

export const getDefaultWidgetIndexTsxContent = () => `import { useState, useEffect, useCallback } from 'react';
import { Button } from  '@/components/ui/button';
import fetchCustomersCount from '@/widget/query.sql';
		
export default function MyComponent() {
	const [customersCount, setCustomersCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const reloadCustomersCount = useCallback(async () => {
		setLoading(true);
		const rows = await fetchCustomersCount();
		setCustomersCount(rows.length > 0 ? rows[0].count : -1);
		setLoading(false);
	}, []);

	useEffect(() => {
		reloadCustomersCount();
	}, [reloadCustomersCount]);

	return (
		<div className="w-full h-full p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
			<h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Customers Count</h2>
			<p className="text-blue-600 dark:text-blue-300 py-2 text-2xl">
				{loading ? 'Loading...' : customersCount}
			</p>
			<Button onClick={reloadCustomersCount}>Reload</Button>
		</div>
	);
}`;

export const getDefaultWidgetQuerySqlTsContent = () => `import { runSql } from '@/lib/utils';

/**
 * This function used to fetch customers cound data from the database.
 */

export default async function fetchCustomersCount() {
    return await runSql<{ count: number }[]>(\`SELECT COUNT(*) as count FROM customer\`);
}
`;

export const buildDefaultFS = async (
	indexTsxContent: string = getDefaultWidgetIndexTsxContent(),
	querySqlTsContent: string = getDefaultWidgetQuerySqlTsContent(),
): Promise<VirtualFS> => {
	const vfs = new VirtualFS();

	vfs.makeDirectory('/src');

	vfs.makeDirectory('/src/components', { readonly: true });
	vfs.makeDirectory('/src/components/ui');

	await buildShadcnUiFS(vfs);

	vfs.makeDirectory('/src/widget');
	vfs.writeFile('/src/widget/index.tsx', indexTsxContent);
	vfs.writeFile('/src/widget/query.sql.ts', querySqlTsContent);

	vfs.makeDirectory('/src/lib', { readonly: true });
	vfs.writeFile('/src/lib/utils.ts', `// nothing here for now`, {
		externalized: true,
	});

	return vfs;
};
