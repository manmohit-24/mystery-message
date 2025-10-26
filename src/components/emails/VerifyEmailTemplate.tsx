import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Section,
	Text,
} from "@react-email/components";
import { constants } from "@/lib/constants";

import {
	main,
	container,
	tertiary,
	secondary,
	paragraph,
	footer,
	link,
	codeContainer,
	code,
} from "./emailStyles";

interface VerificationEmailProps {
	name: string;
	validationCode: string;
}

const { appName, supportEmail } = constants;

export const VerificationEmailTemplate = ({
	name,
	validationCode,
}: VerificationEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Container style={container}>
				{/* App Header */}
				<Text style={tertiary}>{appName}</Text>

				{/* Heading */}
				<Heading style={secondary}>Verify Your Email</Heading>

				{/* Greeting */}
				<Text style={paragraph}>
					Hi {name}, Welcome to {appName}.
				</Text>
				{/* Instructions */}
				<Text style={paragraph}>
					Enter the following code to verify your email and activate your
					Mystery Message account.
				</Text>

				{/* OTP Code */}
				<Section style={codeContainer}>
					<Text style={code}>{validationCode}</Text>
				</Section>
				<Text style={paragraph}>This code is valid for next 1 hour only.</Text>

				{/* Additional Info */}
				<Text style={paragraph}>Not expecting this email?</Text>
				<Text style={paragraph}>
					Contact{" "}
					<Link href={`mailto:support@${supportEmail}`} style={link}>
						{supportEmail}
					</Link>{" "}
					if you did not request this code.
				</Text>
				<br />
			</Container>

			{/* Footer */}
			<Text style={footer}>Securely powered by {appName}</Text>
		</Body>
	</Html>
);
