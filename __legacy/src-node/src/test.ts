import { CompileCommandHandler } from './request-handler/index.js';
import { CompileComponentRequest, CompileComponentResponse } from './types/index.js';

/**
 * Обработчик команды ping для проверки работоспособности
 */
async function handlePingCommand(request: { command: 'ping'; message?: string }): Promise<{ message: string }> {
	const message = request.message || 'qYp-mini';
	return { message: `pong, ${message}` };
}

/**
 * Настройка и запуск приложения
 */
async function main(): Promise<void> {
	// Инициализируем обработчики команд
	const compileHandler = new CompileCommandHandler();

	// const raw = JSON.parse(
	// 	'{"command":"compile","serializedVFS":[{"name":"src","type":"directory","metadata":{},"path":"/src"},{"name":"components","type":"directory","metadata":{"readonly":true},"path":"/src/components"},{"name":"lib","type":"directory","metadata":{"readonly":true},"path":"/src/lib"},{"name":"widget","type":"directory","metadata":{},"path":"/src/widget"},{"name":"ui","type":"directory","metadata":{},"path":"/src/components/ui"},{"name":"button.tsx","type":"file","content":"// nothing here for now","metadata":{"externalized":true},"path":"/src/components/ui/button.tsx"},{"name":"index.tsx","type":"file","content":"\\nimport { useState, useEffect } from \'react\';\\nimport { Button } from  \'@/components/ui/button\';\\nimport fetchUsersCount from \'@/widget/query.sql\';\\n\\t\\t\\nexport default function MyComponent() {\\n\\tconst [usersCount, setUsersCount] = useState(0);\\n\\tconst [loading, setLoading] = useState(false);\\n\\n\\tuseEffect(() => {\\n\\t\\tsetLoading(true);\\n\\t\\tfetchUsersCount().then(rows => setUsersCount(rows[0].count));\\n\\t\\tsetLoading(false);\\n\\t}, []);\\n\\n\\tif (loading) {\\n\\t\\treturn <div>Loading...</div>;\\n\\t}\\n\\n\\treturn (\\n\\t\\t<div className=\\"p-4 bg-blue-100 dark:bg-blue-900 rounded-lg\\">\\n\\t\\t\\t<h2 className=\\"text-lg font-bold text-blue-800 dark:text-blue-200\\">Hello from Playground!</h2>\\n\\t\\t\\t<p className=\\"text-blue-600 dark:text-blue-300\\">Edit the code on the left to see changes here.</p>\\n\\t\\t\\t<Button>Click me!</Button>\\n\\t\\t</div>\\n\\t);\\n}","metadata":{},"path":"/src/widget/index.tsx"},{"name":"query.sql.ts","type":"file","content":"import { runSql } from \'@/lib/utils\';\\n\\n/**\\n * This function used to fetch users cound data from the database.\\n */\\n\\nexport default async function fetchUsersCount() {\\n    return await runSql<{ count: number }[]>(`SELECT COUNT(*) as count FROM users`);\\n}\\n","metadata":{},"path":"/src/widget/query.sql.ts"},{"name":"utils.ts","type":"file","content":"// nothing here for now","metadata":{"externalized":true},"path":"/src/lib/utils.ts"}],"entryPoint":"/src/widget/index.tsx"}',
	// );

	// console.log(JSON.stringify(raw, null, 4));

	const rawRequest = {
		command: 'compile',
		serializedVFS: [
			{
				name: 'src',
				type: 'directory',
				metadata: {},
				path: '/src',
			},
			{
				name: 'components',
				type: 'directory',
				metadata: {
					readonly: true,
				},
				path: '/src/components',
			},
			{
				name: 'lib',
				type: 'directory',
				metadata: {
					readonly: true,
				},
				path: '/src/lib',
			},
			{
				name: 'widget',
				type: 'directory',
				metadata: {},
				path: '/src/widget',
			},
			{
				name: 'ui',
				type: 'directory',
				metadata: {},
				path: '/src/components/ui',
			},
			{
				name: 'button.tsx',
				type: 'file',
				content: '// nothing here for now',
				metadata: {
					externalized: true,
				},
				path: '/src/components/ui/button.tsx',
			},
			{
				name: 'index.tsx',
				type: 'file',
				content:
					'\nimport { useState, useEffect } from \'react\';\nimport { Button } from  \'@/components/ui/button\';\nimport fetchUsersCount from \'@/widget/query.sql\';\n\t\t\nexport default function MyComponent() {\n\tconst [usersCount, setUsersCount] = useState(0);\n\tconst [loading, setLoading] = useState(false);\n\n\tuseEffect(() => {\n\t\tsetLoading(true);\n\t\tfetchUsersCount().then(rows => setUsersCount(rows[0].count));\n\t\tsetLoading(false);\n\t}, []);\n\n\tif (loading) {\n\t\treturn <div>Loading...</div>;\n\t}\n\n\treturn (\n\t\t<div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">\n\t\t\t<h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Hello from Playground!</h2>\n\t\t\t<p className="text-blue-600 dark:text-blue-300">Edit the code on the left to see changes here.</p>\n\t\t\t<Button>Click me!</Button>\n\t\t</div>\n\t);\n}',
				metadata: {},
				path: '/src/widget/index.tsx',
			},
			{
				name: 'query.sql.ts',
				type: 'file',
				content:
					"import { runSql } from '@/lib/utils';\n\n/**\n * This function used to fetch users cound data from the database.\n */\n\nexport default async function fetchUsersCount() {\n    return await runSql<{ count: number }[]>(`SELECT COUNT(*) as count FROM users`);\n}\n",
				metadata: {},
				path: '/src/widget/query.sql.ts',
			},
			{
				name: 'utils.ts',
				type: 'file',
				content: '// nothing here for now',
				metadata: {
					externalized: true,
				},
				path: '/src/lib/utils.ts',
			},
		],
		entryPoint: '/src/widget/index.tsx',
	} satisfies CompileComponentRequest;

	const result = await compileHandler.handle(rawRequest);

	console.log(result);
}

// Обработчики для некорректного завершения процесса
process.on('uncaughtException', error => {
	console.error('Необработанное исключение:', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Необработанное отклонение промиса:', reason);
	process.exit(1);
});

// Запуск приложения
main().catch(error => {
	console.error('Ошибка запуска:', error);
	process.exit(1);
});
