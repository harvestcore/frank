export type Command = {
	name?: string;
	cmd: string;
	dir?: string;
};

export type Cwd = {
	name?: string;
	dir: string;
};

export type FrankOptions = {
	commands: Command[];
	dirs: Cwd[];
};
