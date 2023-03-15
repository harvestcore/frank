import * as path from 'https://deno.land/std@0.165.0/path/mod.ts';
import { Component } from 'https://deno.land/x/tui@1.3.4/src/component.ts';

import { Cwd, FrankOptions } from './types.ts';

class FrankManager {
	#cwd: Cwd | null = null;
	#options: FrankOptions;
	#consoleSize: {
		fullWidth: number;
		halfWidth: number;
		fullHeight: number;
		oneThirdHeight: number;
	};
	#selectedComponent: Component | null = null;

	constructor() {
		this.#options = JSON.parse(
			Deno.readTextFileSync(
				Deno.env.get('FRANK_FILE') ||
					path.resolve(Deno.cwd(), 'frank.json')
			)
		) as FrankOptions;

		const dcs = Deno.consoleSize();
		this.#consoleSize = {
			fullWidth: dcs.columns,
			halfWidth: dcs.columns * 0.5,
			fullHeight: dcs.rows,
			oneThirdHeight: dcs.rows * 0.33,
		};
	}

	public get commands() {
		return this.#options.commands;
	}

	public get dirs() {
		return this.#options.dirs;
	}

	public get consoleSize() {
		return this.#consoleSize;
	}

	public setCwd(cwd: number): void {
		this.#cwd = cwd === 0 ? null : this.dirs[cwd - 1];
	}

	public get cwd(): string | null {
		return this.#cwd?.dir || null;
	}

	public focusComponent(component: Component) {
		if (this.#selectedComponent) {
			this.#selectedComponent.state = 'base';
		}

		this.#selectedComponent = component;
		this.#selectedComponent.state = 'focused';
	}

	public get dirsTableData() {
		return [
			['~ none ~'],
			...this.dirs.map((item) => [
				item.name
					? item.name.substring(0, this.consoleSize.halfWidth - 5)
					: item.dir.length > this.consoleSize.halfWidth - 5
					? item.dir
							.split('/')
							.map((x) => x.charAt(0))
							.join('/')
					: item.dir,
			]),
		];
	}
}

export default new FrankManager();
