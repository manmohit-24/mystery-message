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
	Link,
} from "@react-email/components";

import {
	main,
	container,
	tertiary,
	secondary,
	paragraph,
	footer,
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
                
				<Text style={paragraph}>This link/button is valid for next 10 mins only.</Text>

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
