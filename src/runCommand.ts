import frankManager from './frankManager.ts';
import { type Command } from './types.ts';
import { decode } from './decode.ts';

export async function runCommand(command: Command): Promise<{
	msg: string;
	code: number | string;
	time: number;
}> {
	frankManager.busy = true;
	try {
		const p = Deno.run({
			cmd: command.cmd.split(' '),
			cwd: frankManager.cwd || command.dir || Deno.cwd(),
			stdout: 'piped',
			stderr: 'piped',
		});

		const before = Date.now();
		const [rawOutput, rawErrorOutput, status] = await Promise.all([
			p.output(),
			p.stderrOutput(),
			p.status(),
		]);
		const after = Date.now();

		frankManager.busy = false;
		return {
			msg: status.success
				? decode(rawOutput)
				: `An error occured.\n\n${decode(rawErrorOutput)}`,
			code: status.code,
			time: (after - before) / 1000,
		};
	} catch (e: unknown) {
		frankManager.busy = false;
		return {
			msg: `An error occured. \n\n${(e as Error).message}`,
			code: 'see below',
			time: 0,
		};
	}
}
