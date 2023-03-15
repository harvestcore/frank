export function decode(value: Uint8Array): string {
	return new TextDecoder().decode(value);
}
