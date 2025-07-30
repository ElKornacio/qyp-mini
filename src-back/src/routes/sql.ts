import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { SqlRequest, SqlResponse, DatabaseCredentials } from '../types';
import { sqlRateLimit } from '../middlewares/rateLimiter';

const router = Router();

const createDataSource = (credentials: DatabaseCredentials): DataSource => {
	const baseConfig = {
		host: credentials.host,
		port: credentials.port,
		username: credentials.username,
		password: credentials.password,
		database: credentials.database,
		synchronize: false,
		logging: false,
		ssl: credentials.ssl ? { rejectUnauthorized: false } : false,
	};

	switch (credentials.type) {
		case 'postgres':
			return new DataSource({
				type: 'postgres',
				...baseConfig,
			});
		case 'mysql':
			return new DataSource({
				type: 'mysql',
				...baseConfig,
			});
		case 'sqlite':
			return new DataSource({
				type: 'sqlite',
				database: credentials.database, // For SQLite, this is the file path
			});
		default:
			throw new Error(`Unsupported database type: ${credentials.type}`);
	}
};

router.post(
	'/select',
	sqlRateLimit,
	async (req: Request<{}, SqlResponse, SqlRequest>, res: Response<SqlResponse>): Promise<void> => {
		const startTime = Date.now();
		let dataSource: DataSource | null = null;

		try {
			const { credentials, query, parameters = [] } = req.body;

			// Validate request
			if (!credentials || !query) {
				res.status(400).json({
					success: false,
					error: 'Missing credentials or query',
				});
				return;
			}

			// Validate SQL query (basic check for SELECT only)
			const trimmedQuery = query.trim().toLowerCase();
			if (!trimmedQuery.startsWith('select')) {
				res.status(400).json({
					success: false,
					error: 'Only SELECT queries are allowed',
				});
				return;
			}

			// Create and initialize data source
			dataSource = createDataSource(credentials);
			await dataSource.initialize();

			// Execute query
			const result = await dataSource.query(query, parameters);
			const executionTime = Date.now() - startTime;

			const response: SqlResponse = {
				success: true,
				data: result,
				executionTime,
				rowCount: Array.isArray(result) ? result.length : 0,
			};

			res.json(response);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			console.error('SQL execution error:', error);

			const response: SqlResponse = {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				executionTime,
			};

			res.status(500).json(response);
		} finally {
			// Clean up connection
			if (dataSource && dataSource.isInitialized) {
				try {
					await dataSource.destroy();
				} catch (error) {
					console.error('Error closing database connection:', error);
				}
			}
		}
	},
);

export default router;
