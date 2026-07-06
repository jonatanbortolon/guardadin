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
	registerUrl: string;
	locale: Locale;
	messages: EmailMessages;
};

export function InviteEmail({ registerUrl, locale, messages }: Props) {
	return (
		<Html lang={locale}>
			<EmailHead />
			<Preview>{messages.invitePreview}</Preview>
			<Body style={styles.main} className={classes.main}>
				<Container style={styles.container} className={classes.container}>
					<Heading style={styles.heading} className={classes.heading}>
						{messages.inviteHeading}
					</Heading>
					<Text style={styles.paragraph} className={classes.paragraph}>
						{messages.inviteBody}
					</Text>
					<Section>
						<Button
							href={registerUrl}
							style={styles.button}
							className={classes.button}
						>
							{messages.inviteButton}
						</Button>
					</Section>
					<Text style={styles.footer} className={classes.footer}>
						{messages.inviteFallback}
					</Text>
					<Link
						href={registerUrl}
						style={styles.fallbackLink}
						className={classes.fallbackLink}
					>
						{registerUrl}
					</Link>
					<Text style={styles.footer} className={classes.footer}>
						{messages.inviteIgnore}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export default InviteEmail;
