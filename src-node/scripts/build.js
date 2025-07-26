import { execSync } from 'child_process';
import fs from 'fs';

const ext = process.platform === 'win32' ? '.exe' : '';

const appName = process.argv[2];

const rustInfo = execSync('rustc -vV');
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
	console.error('Failed to determine platform target triple');
}
fs.renameSync(`${appName}${ext}`, `../src-tauri/binaries/${appName}-${targetTriple}${ext}`);
