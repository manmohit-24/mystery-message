import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Section,
	Text,
	Button,
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
	button,
} from "./emailStyles";

interface ReWelcomeEmailProps {
	name: string;
	loginLink: string;
}

const { appName } = constants;

export const ReWelcomeTemplate = ({ name, loginLink }: ReWelcomeEmailProps) => {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					{/* App Header */}
					<Text style={tertiary}>{appName}</Text>

					{/* Heading */}
					<Heading style={secondary}>Welcome back to {appName} 🌱 </Heading>

					{/* Greeting */}
					<Text style={paragraph}>Hey {name}</Text>
					{/* Instructions */}
					<Text style={paragraph}>
						We’re glad to see you back! Your account has been successfully
						reactivated. You can now continue where you left off.
					</Text>

					<Section style={{ textAlign: "center", margin: "20px 0" }}>
						<Link href={loginLink} style={button}>
							Login Now
						</Link>
					</Section>

					<br />
				</Container>

				{/* Footer */}
				<Text style={footer}>Securely powered by {appName}</Text>
			</Body>
		</Html>
	);
};
