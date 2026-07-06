import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const derived = (await scryptAsync(password, salt, 64)) as Buffer;

	return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	const [salt, key] = stored.split(":");

	if (!salt || !key) {
		return false;
	}

	const keyBuffer = Buffer.from(key, "hex");
	const derived = (await scryptAsync(password, salt, 64)) as Buffer;

	return (
		keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived)
	);
}
