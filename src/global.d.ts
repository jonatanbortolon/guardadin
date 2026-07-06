import type { Locale } from "@/i18n/config";
import type { ptBR } from "@/i18n/messages/pt-BR";

declare module "next-intl" {
	interface AppConfig {
		Locale: Locale;
		Messages: typeof ptBR;
	}
}
