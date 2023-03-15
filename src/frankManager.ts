import * as path from 'https://deno.land/std@0.165.0/path/mod.ts';

import { Cwd, FrankOptions } from './types.ts';

class FrankManager {
	#cwd: Cwd | null;
	#options: FrankOptions;
	#consoleSize: {
		columns: number;
		rows: number;
	};
	#halfWidth: number;

	constructor() {
		this.#options = JSON.parse(
			Deno.readTextFileSync(
				Deno.env.get('FRANK_FILE') ||
					path.resolve(Deno.cwd(), 'frank.json')
			)
		) as FrankOptions;

		this.#cwd = null;

		this.#consoleSize = Deno.consoleSize();
		this.#halfWidth = this.#consoleSize.columns * 0.5;
	}

	public get commands() {
		return this.#options.commands;
	}

	public get dirs() {
		return this.#options.dirs;
	}

	public setCwd(cwd: number): void {
		this.#cwd = cwd === 0 ? null : this.dirs[cwd - 1];
	}

	public get cwd(): string | null {
		return this.#cwd?.dir || null;
	}

	public get dirsTableData() {
		return [
			['~ none ~'],
			...this.dirs.map((item) => [
				item.name
					? item.name.substring(0, this.#halfWidth - 5)
					: item.dir
							.split('/')
							.map((x) => x.charAt(0))
							.join('/'),
			]),
		];
	}
}

export default new FrankManager();
