"use client";
import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { useLocale } from "@/providers/i18n";

export function LanguageSwitcher() {
	const t = useTranslations("header");
	const { locale, setLocale, ready } = useLocale();

	if (!ready) {
		return <Skeleton className="h-9 w-28" />;
	}

	return (
		<Select
			value={locale}
			onValueChange={(value) => setLocale(value as Locale)}
		>
			<SelectTrigger className="w-auto gap-2" aria-label={t("language")}>
				<LanguagesIcon className="h-4 w-4" />
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{locales.map((item) => (
					<SelectItem key={item} value={item}>
						{localeNames[item]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
