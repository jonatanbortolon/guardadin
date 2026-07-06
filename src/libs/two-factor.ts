import { createHash, randomBytes } from "node:crypto";
import { generateSecret, generateURI, verify } from "otplib";

const ISSUER = "GuardaDin";
const RECOVERY_CODE_COUNT = 10;

export async function generateTwoFactorSecret(): Promise<string> {
	return generateSecret();
}

export function buildOtpauthUrl(secret: string, accountName: string): string {
	return generateURI({ secret, issuer: ISSUER, label: accountName });
}

export async function verifyTwoFactorToken(
	secret: string,
	token: string,
): Promise<boolean> {
	const normalized = token.replace(/\s/g, "");

	if (!/^\d{6}$/.test(normalized)) {
		return false;
	}

	try {
		const result = await verify({ token: normalized, secret });
		return result.valid;
	} catch {
		return false;
	}
}

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
	return Array.from({ length: count }, () => {
		const raw = randomBytes(4).toString("hex");
		return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
	});
}

export function normalizeRecoveryCode(code: string): string {
	return code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

export function hashRecoveryCode(code: string): string {
	return createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}

export function hashRecoveryCodes(codes: string[]): string[] {
	return codes.map(hashRecoveryCode);
}

export function serializeRecoveryCodes(hashes: string[]): string {
	return JSON.stringify(hashes);
}

export function parseRecoveryCodes(stored: string | null): string[] {
	if (!stored) {
		return [];
	}

	try {
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
