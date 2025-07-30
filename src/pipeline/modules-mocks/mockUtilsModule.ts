import { WidgetRuntimeContext } from '@/types/dashboard';

export const tryToMockUtilsModule = (context: any, path: string) => {
	if (path === '@/lib/utils') {
		const runtimeContext = context as WidgetRuntimeContext;

		return {
			runSql: async <T = any>(query: string): Promise<T> => {
				const result = await runtimeContext.database.connection.select(query);
				return result as T;
			},
		};
	}

	return null;
};
