import * as path from 'https://deno.land/std@0.165.0/path/mod.ts';
import { Component } from 'https://deno.land/x/tui@1.3.4/src/component.ts';

import { type Cwd, type FrankOptions } from './types.ts';

class FrankManager {
	#cwd: Cwd | null = null;
	#options: FrankOptions;
	#consoleSize: {
		fullWidth: number;
		halfWidth: number;
		oneSixthWidth: number;
		fullHeight: number;
		oneThirdHeight: number;
	};
	#selectedComponent: Component | null = null;
	#busy = false;

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
			halfWidth: Math.round(dcs.columns * 0.5),
			oneSixthWidth: Math.round(dcs.columns * (1 / 6)),
			fullHeight: dcs.rows,
			oneThirdHeight: Math.round(dcs.rows * (1 / 3)),
		};
	}

	public set busy(value: boolean) {
		this.#busy = value;
	}

	public get busy() {
		return this.#busy;
	}

	public getCommand(id: number) {
		return this.#options.commands[id];
	}

	public get dirs() {
		return this.#options.dirs;
	}

	public get consoleSize() {
		return this.#consoleSize;
	}

	public setCwd(cwd: number): void {
		this.#cwd = cwd === 0 ? null : this.#options.dirs[cwd - 1];
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
			...this.#options.dirs.map((item) => [
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

	public get commandsTableData() {
		return this.#options.commands.map((item) => {
			if (item.type === 'separator') {
				return ['━'.repeat(this.#consoleSize.halfWidth - 3)];
			}
			return [item.name || item.cmd];
		});
	}
}

export default new FrankManager();
