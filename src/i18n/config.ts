import { en } from "@/i18n/messages/en";
import { es } from "@/i18n/messages/es";
import { ptBR } from "@/i18n/messages/pt-BR";

export const locales = ["pt-BR", "es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export const localeNames: Record<Locale, string> = {
	"pt-BR": "Português (BR)",
	es: "Español",
	en: "English (US)",
};

export const messages: Record<Locale, typeof ptBR> = {
	"pt-BR": ptBR,
	es,
	en,
};

export const localeStorageKey = "guardadin-locale";

export function resolveLocale(value: string | null | undefined): Locale {
	if (!value) {
		return defaultLocale;
	}

	if (locales.includes(value as Locale)) {
		return value as Locale;
	}

	const base = value.split("-")[0];
	const matched = locales.find((locale) => locale.split("-")[0] === base);

	return matched ?? defaultLocale;
}
