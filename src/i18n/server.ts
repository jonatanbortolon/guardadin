import { cookies, headers } from "next/headers";
import { type Locale, localeStorageKey, resolveLocale } from "@/i18n/config";

export async function getServerLocale(): Promise<Locale> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get(localeStorageKey)?.value;

	if (cookieLocale) {
		return resolveLocale(cookieLocale);
	}

	const headerStore = await headers();
	const acceptLanguage = headerStore.get("accept-language");
	const preferred = acceptLanguage?.split(",")[0]?.trim();

	return resolveLocale(preferred);
}
