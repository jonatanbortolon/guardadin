export function normalizePhone(value: string): string {
	return value.replace(/\D/g, "");
}
