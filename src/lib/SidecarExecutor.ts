import { Command, TerminatedPayload } from '@tauri-apps/plugin-shell';
import { SidecarEncoder, SidecarRequest, SidecarResponse } from './SidecarEncoder';

/**
 * Параметры для выполнения команды sidecar
 */
export interface SidecarExecutionParams {
	args: string[];
	request: SidecarRequest;
}

/**
 * Исполнитель команд sidecar - отвечает только за выполнение команд
 */
export class SidecarExecutor {
	private static readonly SIDECAR_NAME = 'binaries/qyp-mini-node-backend';

	/**
	 * Выполняет команду в sidecar с заданными параметрами
	 * @param params - Параметры выполнения
	 * @returns Результат выполнения команды
	 */
	static async execute<T extends SidecarResponse>(params: SidecarExecutionParams): Promise<T> {
		const command = Command.sidecar(this.SIDECAR_NAME, params.args);

		let stdout = '';
		let stderr = '';

		command.stdout.on('data', data => {
			console.log('stdout: ', data);
			stdout += data;
		});

		command.stderr.on('data', data => {
			console.log('stderr: ', data);
			stderr += data;
		});

		const child = await command.spawn();

		const encodedRequest = SidecarEncoder.encodeRequest(params.request);
		console.log('Отправляем запрос:', encodedRequest);

		const output = await new Promise<TerminatedPayload>(resolve => {
			command.on('close', out => {
				console.log('close: ', out);
				resolve(out);
			});

			// Отправляем закодированный запрос
			child.write(encodedRequest);
		});

		if (output.code !== 0) {
			throw new Error(`Sidecar завершился с кодом: ${output.code}. Stderr: ${stderr}`);
		}

		return SidecarEncoder.decodeResponse(stdout);
	}
}
