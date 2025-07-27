export const tryToMockUtilsModule = (context: any, path: string) => {
	if (path === '@/lib/utils') {
		return { runSql: async () => [{ count: 10 }] };
	}

	return null;
};
