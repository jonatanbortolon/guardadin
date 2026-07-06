import type { Country } from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";

// NOTE: This module pulls in `react-phone-number-input`, which is a client-only
// package. Keep it out of server code (API routes, RSC). Server-safe phone
// helpers live in `@/utils/phone`.
export function formatPhone(value: string): {
	country: Country | undefined;
	formatted: string;
} {
	const e164 = value.startsWith("+") ? value : `+${value}`;

	try {
		const parsed = parsePhoneNumber(e164);

		if (parsed) {
			return {
				country: parsed.country,
				formatted: parsed.formatInternational(),
			};
		}
	} catch {
		// fall through to raw value
	}

	return { country: undefined, formatted: e164 };
}
