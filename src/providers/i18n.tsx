"use client";
import { NextIntlClientProvider } from "next-intl";
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	defaultLocale,
	type Locale,
	localeStorageKey,
	messages,
	resolveLocale,
} from "@/i18n/config";

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
	const context = useContext(LocaleContext);

	if (!context) {
		throw new Error("useLocale must be used within an I18nProvider");
	}

	return context;
}

function persistLocale(locale: Locale) {
	window.localStorage.setItem(localeStorageKey, locale);
	// biome-ignore lint/suspicious/noDocumentCookie: broader browser support than the Cookie Store API
	document.cookie = `${localeStorageKey}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function I18nProvider({ children }: PropsWithChildren) {
	const [locale, setLocaleState] = useState<Locale>(defaultLocale);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const stored = window.localStorage.getItem(localeStorageKey);
		const resolved = resolveLocale(stored ?? window.navigator.language);

		setLocaleState(resolved);
		persistLocale(resolved);
		setReady(true);
	}, []);

	function setLocale(next: Locale) {
		setLocaleState(next);
		persistLocale(next);
	}

	return (
		<LocaleContext.Provider value={{ locale, setLocale, ready }}>
			<NextIntlClientProvider
				locale={locale}
				messages={messages[locale]}
				timeZone="America/Sao_Paulo"
			>
				{children}
			</NextIntlClientProvider>
		</LocaleContext.Provider>
	);
}
