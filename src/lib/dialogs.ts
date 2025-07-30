import { platform } from '@/platform';

export const confirmDialog = async (message: string) => {
	return await platform.dialogs.confirm(message, {
		title: 'Подтверждение',
		kind: 'warning',
	});
};
