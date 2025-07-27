import { VirtualFS } from 'src-node/src/virtual-fs/VirtualFS';

export const buildShadcnUiFS = async (vfs: VirtualFS): Promise<void> => {
	vfs.writeFile('/src/components/ui/button.tsx', `// nothing here for now`, {
		externalized: true,
	});
};
