import {
	Body,
	Button,
	Container,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type { EmailMessages } from "@/emails/messages";
import { classes, EmailHead, styles } from "@/emails/theme";
import type { Locale } from "@/i18n/config";

type Props = {
	name: string;
	resetUrl: string;
	locale: Locale;
	messages: EmailMessages;
};

export function ResetPasswordEmail({
	name,
	resetUrl,
	locale,
	messages,
}: Props) {
	return (
		<Html lang={locale}>
			<EmailHead />
			<Preview>{messages.resetPreview}</Preview>
			<Body style={styles.main} className={classes.main}>
				<Container style={styles.container} className={classes.container}>
					<Heading style={styles.heading} className={classes.heading}>
						{messages.resetHeading}
					</Heading>
					<Text style={styles.greeting} className={classes.greeting}>
						{messages.resetGreeting(name)}
					</Text>
					<Text style={styles.paragraph} className={classes.paragraph}>
						{messages.resetBody}
					</Text>
					<Section>
						<Button
							href={resetUrl}
							style={styles.button}
							className={classes.button}
						>
							{messages.resetButton}
						</Button>
					</Section>
					<Text style={styles.footer} className={classes.footer}>
						{messages.resetFallback}
					</Text>
					<Link
						href={resetUrl}
						style={styles.fallbackLink}
						className={classes.fallbackLink}
					>
						{resetUrl}
					</Link>
					<Text style={styles.footer} className={classes.footer}>
						{messages.resetExpiry}
					</Text>
					<Text style={styles.footer} className={classes.footer}>
						{messages.resetIgnore}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export default ResetPasswordEmail;
