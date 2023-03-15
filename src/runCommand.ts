import { decode } from './decode.ts';
import frankManager from './frankManager.ts';
import { Command } from './types.ts';

export async function runCommand(command: Command): Promise<string> {
	let outputMsg = '';
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

		if (status.success) {
			outputMsg = `Done in ${(after - before) / 1000}s.\n\n${decode(
				rawOutput
			)}`;
		} else {
			outputMsg = `An error occured. See:\n\n${decode(rawErrorOutput)}`;
		}
	} catch (e: unknown) {
		outputMsg = `An error occured. See:\n\n${(e as Error).message}`;
	}

	return outputMsg;
}
