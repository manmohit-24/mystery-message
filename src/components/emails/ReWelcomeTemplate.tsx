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
	button,
} from "./emailStyles";

interface ReWelcomeEmailProps {
	name: string;
	loginTime: Date;
	deviceInfo: string;
}

const { appName } = constants;

export const ReWelcomeTemplate = ({
	name,
	loginTime,
	deviceInfo,
}: ReWelcomeEmailProps) => {
	const formattedLoginTime = `${loginTime.toLocaleDateString()} at ${loginTime.toLocaleTimeString()}`;

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

					<Text style={paragraph}>
						Reactivation is done by a new login to your {appName} account:
					</Text>

					<Text style={paragraph}>
						Time: <b> {formattedLoginTime} </b>
						<br />
						Device / Browser: <b>{deviceInfo}</b>
					</Text>

					{/* Extra Info */}
					<Text style={paragraph}>
						If this was you, no action is needed. <br />
						If you did NOT log in, please secure your account immediately by
						changing your password.
					</Text>

					<br />
				</Container>

				{/* Footer */}
				<Text style={footer}>Securely powered by {appName}</Text>
			</Body>
		</Html>
	);
};
