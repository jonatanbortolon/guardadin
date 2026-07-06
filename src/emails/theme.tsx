import { Head } from "@react-email/components";

// Cores espelhadas do painel web (shadcn — tema verde do GuardaDin).
// Valores em hex (clientes de e-mail não suportam oklch). Os estilos inline
// carregam o tema claro; o bloco @media abaixo aplica o tema escuro conforme
// a preferência do dispositivo que abriu o e-mail.

export const styles = {
	main: {
		backgroundColor: "#f4f4f5",
		fontFamily:
			"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
		padding: "24px 0",
	},
	container: {
		backgroundColor: "#ffffff",
		border: "1px solid #e4e4e7",
		borderRadius: "12px",
		margin: "0 auto",
		maxWidth: "440px",
		padding: "32px",
	},
	heading: {
		color: "#18181b",
		fontSize: "20px",
		fontWeight: "700",
		margin: "0 0 16px",
	},
	greeting: {
		color: "#18181b",
		fontSize: "15px",
		fontWeight: "600",
		margin: "0 0 8px",
	},
	paragraph: {
		color: "#52525b",
		fontSize: "14px",
		lineHeight: "22px",
		margin: "0 0 24px",
	},
	button: {
		backgroundColor: "#22c55e",
		borderRadius: "8px",
		color: "#ffffff",
		display: "block",
		fontSize: "14px",
		fontWeight: "600",
		padding: "12px 20px",
		textAlign: "center" as const,
		textDecoration: "none",
	},
	code: {
		backgroundColor: "#f4f4f5",
		border: "1px solid #e4e4e7",
		borderRadius: "8px",
		color: "#18181b",
		fontSize: "32px",
		fontWeight: "700",
		letterSpacing: "8px",
		margin: "0 0 16px",
		padding: "16px 20px",
		textAlign: "center" as const,
	},
	footer: {
		color: "#a1a1aa",
		fontSize: "12px",
		lineHeight: "18px",
		margin: "8px 0 0",
	},
	fallbackLink: {
		color: "#71717a",
		fontSize: "12px",
		wordBreak: "break-all" as const,
	},
} as const;

export const classes = {
	main: "gd-main",
	container: "gd-container",
	heading: "gd-heading",
	greeting: "gd-greeting",
	paragraph: "gd-paragraph",
	button: "gd-button",
	code: "gd-code",
	footer: "gd-footer",
	fallbackLink: "gd-fallback",
} as const;

const darkStyles = `
	@media (prefers-color-scheme: dark) {
		.gd-main { background-color: #09090b !important; }
		.gd-container { background-color: #18181b !important; border-color: #27272a !important; }
		.gd-heading, .gd-greeting { color: #fafafa !important; }
		.gd-paragraph { color: #a1a1aa !important; }
		.gd-code { background-color: #27272a !important; border-color: #3f3f46 !important; color: #fafafa !important; }
		.gd-button { background-color: #10b981 !important; color: #03301f !important; }
		.gd-footer { color: #a1a1aa !important; }
		.gd-fallback { color: #a1a1aa !important; }
	}
`;

export function EmailHead() {
	return (
		<Head>
			<meta name="color-scheme" content="light dark" />
			<meta name="supported-color-schemes" content="light dark" />
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: bloco de <style> estático para dark mode em e-mail */}
			<style dangerouslySetInnerHTML={{ __html: darkStyles }} />
		</Head>
	);
}
