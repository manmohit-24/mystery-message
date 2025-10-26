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

interface WelcomeEmailProps {
	name: string;
	dashboardLink: string;
}

const { appName } = constants;

export const WelcomeTemplate = ({ name, dashboardLink }: WelcomeEmailProps) => {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					{/* App Header */}
					<Text style={tertiary}>{appName}</Text>

					{/* Heading */}
					<Heading style={secondary}>Welcome to {appName} 🎉 </Heading>

					{/* Greeting */}
					<Text style={paragraph}>
						Hey {name}
					</Text>
					{/* Instructions */}
					<Text style={paragraph}>
						Welcome to {appName}! We’re excited to have you on board. Start
						exploring and make the most out of your new account.
					</Text>

					<Section style={{ textAlign: "center", margin: "20px 0" }}>
						<Link href={dashboardLink} style={link}>
							Go To Dashboard
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
