export function getOrThrow (key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error (`Environment variable ${key} is not defined`);
	}
	return value;
}

export function getOrDefault (key: string): string | undefined {
	const value = process.env[key];
	if (value === undefined || value === '') {
		return undefined;
	}
	return value;
}
