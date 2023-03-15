import { crayon } from 'https://deno.land/x/crayon@3.3.3/mod.ts';

import {
	Canvas,
	handleKeyboardControls,
	handleKeypresses,
	KeyPress,
	Theme,
	Tui,
} from 'https://deno.land/x/tui@1.3.4/mod.ts';

import {
	FrameComponent,
	TableComponent,
	TextboxComponent,
} from 'https://deno.land/x/tui@1.3.4/src/components/mod.ts';

import frankManager from './src/frankManager.ts';
import { pad } from './src/pad.ts';
import { runCommand } from './src/runCommand.ts';
import { Command } from './src/types.ts';

const baseTheme: Theme = {
	base: crayon.bgBlack,
	focused: crayon.bgLightWhite,
	active: crayon.bgBlack,
};

const tuiStyle = crayon.bgBlack.white;
const tui = new Tui({
	style: tuiStyle,
	canvas: new Canvas({
		refreshRate: 1000 / 60,
		stdout: Deno.stdout,
	}),
});

const consoleSize = Deno.consoleSize();
const canvas = {
	fullWidth: consoleSize.columns,
	halfWidth: consoleSize.columns * 0.5,
	fullHeight: consoleSize.rows,
	oneThirdHeight: consoleSize.rows * 0.33,
};

const tableTheme = {
	base: crayon.bgBlack.white,
	header: { base: crayon.bgBlack.lightBlue },
	focused: crayon.bgBlack.white.bold,
	selectedRow: {
		base: crayon.bgWhite.black,
		focused: crayon.bgLightWhite.black,
		active: crayon.bgWhite.black,
	},
};

const commandsTable = new TableComponent({
	tui,
	theme: tableTheme,
	rectangle: {
		column: 0,
		height: canvas.oneThirdHeight,
		row: 0,
	},
	headers: [pad('Commands', canvas.halfWidth - 2)],
	data: frankManager.commands.map((item) => [item.name || item.cmd]),
	framePieces: 'rounded',
});

const dirsTable = new TableComponent({
	tui,
	theme: tableTheme,
	rectangle: {
		column: canvas.halfWidth,
		height: canvas.oneThirdHeight,
		row: 0,
	},
	headers: [pad('Directories', canvas.halfWidth - 2)],
	data: frankManager.dirsTableData,
	framePieces: 'rounded',
});

const outputTextBox = new TextboxComponent({
	tui,
	theme: {
		...baseTheme,
		highlightedLine: {
			base: crayon.bgWhite.black,
		},
	},
	multiline: true,
	hidden: false,
	rectangle: {
		column: 1,
		row: canvas.oneThirdHeight + 5,
		height: canvas.oneThirdHeight * 2 - 5,
		width: canvas.fullWidth - 3,
	},
	value: '',
});

new FrameComponent({
	tui,
	component: outputTextBox,
	framePieces: 'rounded',
	theme: {
		base: tuiStyle,
		focused: tuiStyle,
	},
});

const cmdTextBox = new TextboxComponent({
	tui,
	theme: {
		...baseTheme,
		highlightedLine: {
			base: crayon.bgWhite.black,
		},
	},
	multiline: true,
	hidden: false,
	rectangle: {
		column: 1,
		row: canvas.oneThirdHeight + 1,
		height: 2,
		width: canvas.fullWidth - 3,
	},
	value: 'Command: -\nPath: -',
});

new FrameComponent({
	tui,
	component: cmdTextBox,
	framePieces: 'rounded',
	theme: {
		base: tuiStyle,
		focused: tuiStyle,
	},
});

function updateInfoCommand(command: Command) {
	const path = frankManager.cwd || command.dir || Deno.cwd();
	cmdTextBox.value = `Command: ${command.cmd}\nPath: ${path}`;
}

async function handleExecution(ev: KeyPress) {
	if (['space', 'return'].includes(ev.key)) {
		const command = frankManager.commands[commandsTable.selectedRow];
		outputTextBox.value = 'Running...';
		const msg = await runCommand(command);
		outputTextBox.value = msg;
	}
}

commandsTable.on('keyPress', async (ev) => {
	// Default command execution.
	await handleExecution(ev);

	// Specific up-down behavior.
	if (['up', 'down'].includes(ev.key)) {
		updateInfoCommand(frankManager.commands[commandsTable.selectedRow]);
	}
});

dirsTable.on('keyPress', async (ev) => {
	// Default command execution.
	await handleExecution(ev);

	// Specific up-down behavior.
	if (['up', 'down'].includes(ev.key)) {
		frankManager.setCwd(dirsTable.selectedRow);
		updateInfoCommand(frankManager.commands[commandsTable.selectedRow]);
	}
});

// Handle tables focus.
tui.on('keyPress', (ev) => {
	if (ev.key === 'tab') {
		if (dirsTable.state === 'focused') {
			commandsTable.state = 'focused';
			dirsTable.state = 'base';
		} else {
			dirsTable.state = 'focused';
			commandsTable.state = 'base';
		}
	}
});

// Handle "close" calls.
tui.dispatch();

// Handle keyboard.
handleKeypresses(tui);
handleKeyboardControls(tui);

// RUN.
tui.run();

// Default state for the commands table.
commandsTable.state = 'focused';
