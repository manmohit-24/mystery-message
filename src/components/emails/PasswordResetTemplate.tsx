import { constants } from "@/lib/constants";
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Section,
	Text,
	Button,
} from "@react-email/components";

import {
	main,
	container,
	tertiary,
	secondary,
	paragraph,
	footer,
	link,
	button,
} from "./emailStyles";
interface PasswordResetEmailProps {
	name: string;
	resetUrl: string;
}

const { appName } = constants;

export const PasswordResetEmailTemplate = ({
	name,
	resetUrl,
}: PasswordResetEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Container style={container}>
				{/* App Header */}
				<Text style={tertiary}>{appName}</Text>

				{/* Heading */}
				<Heading style={secondary}>Reset Your Password</Heading>

				{/* Instructions */}
				<Text style={paragraph}>
					Hi {name}, we received a request to reset your password. Click the
					button below to set a new password.
				</Text>

				{/* Reset Button */}
				<Section style={{ textAlign: "center", margin: "20px 0" }}>
					<Button href={resetUrl} style={button}>
						Reset Password
					</Button>
				</Section>

				{/* Fallback URL */}
				<Text style={paragraph}>
					If the button above doesn’t work, copy and paste this link into your
					browser:
				</Text>
				<Text style={link}>{resetUrl}</Text>

				{/* Extra Info */}
				<Text style={paragraph}>
					If you did not request a password reset, you can safely ignore this
					email.
				</Text>
				<br />
			</Container>

			{/* Footer */}
			<Text style={footer}>Securely powered by {appName}</Text>
		</Body>
	</Html>
);
