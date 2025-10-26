import { constants } from "@/lib/constants";
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Text,
} from "@react-email/components";

import {
	main,
	container,
	tertiary,
	secondary,
	paragraph,
	footer,
	codeContainer,
} from "./emailStyles";

interface LoginAlertEmailProps {
	name: string;
	loginTime: Date;
	deviceInfo: string;
}

const { appName } = constants;

export const LoginAlert = ({
	name,
	loginTime,
	deviceInfo,
}: LoginAlertEmailProps) => {
	const formattedLoginTime = `${loginTime.toLocaleDateString()} at ${loginTime.toLocaleTimeString()}`;
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					{/* App Header */}
					<Text style={tertiary}>{appName}</Text>

					{/* Heading */}
					<Heading style={secondary}>New login on your {appName} account</Heading>

					<Text style={paragraph}>
						Hey {name} <br />
					</Text>
					{/* Instructions */}
					<Text style={paragraph}>
						We noticed a new login to your {appName} account:
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
