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
	confirmUrl: string;
	locale: Locale;
	messages: EmailMessages;
};

export function ConfirmEmail({ name, confirmUrl, locale, messages }: Props) {
	return (
		<Html lang={locale}>
			<EmailHead />
			<Preview>{messages.confirmPreview}</Preview>
			<Body style={styles.main} className={classes.main}>
				<Container style={styles.container} className={classes.container}>
					<Heading style={styles.heading} className={classes.heading}>
						{messages.confirmHeading}
					</Heading>
					<Text style={styles.greeting} className={classes.greeting}>
						{messages.confirmGreeting(name)}
					</Text>
					<Text style={styles.paragraph} className={classes.paragraph}>
						{messages.confirmBody}
					</Text>
					<Section>
						<Button
							href={confirmUrl}
							style={styles.button}
							className={classes.button}
						>
							{messages.confirmButton}
						</Button>
					</Section>
					<Text style={styles.footer} className={classes.footer}>
						{messages.confirmFallback}
					</Text>
					<Link
						href={confirmUrl}
						style={styles.fallbackLink}
						className={classes.fallbackLink}
					>
						{confirmUrl}
					</Link>
					<Text style={styles.footer} className={classes.footer}>
						{messages.confirmIgnore}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export default ConfirmEmail;
