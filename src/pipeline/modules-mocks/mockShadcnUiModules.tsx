import * as ButtonModule from '@/components/ui/button';

export const tryToMockShadcnUiModules = (_context: any, path: string) => {
	if (path === '@/components/ui/button') {
		return ButtonModule;
	}

	return null;
};
