export function pad(value: string, padding: number): string {
	return (value + ' '.repeat(padding)).substring(0, padding - 1);
}
