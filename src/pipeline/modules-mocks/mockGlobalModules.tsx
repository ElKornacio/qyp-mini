import * as ReactRuntime from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';

export const tryToMockGlobalModule = (context: any, path: string) => {
	if (path === 'react') {
		return ReactRuntime;
	} else if (path === 'react/jsx-runtime') {
		return ReactJSXRuntime;
	}

	return null;
};
