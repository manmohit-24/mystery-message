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

interface RecoverAccountEmailProps {
	name: string;
	activationCode: string;
    deadline: Date;
    redirectLink : string
}

const { appName } = constants;

export const RecoverAccountTemplate = ({
	name,
	activationCode,
    deadline,
    redirectLink
}: RecoverAccountEmailProps) => {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					{/* App Header */}
					<Text style={tertiary}>{appName}</Text>

					{/* Heading */}
					<Heading style={secondary}>
						Verify to reactivate your account{" "}
					</Heading>

					{/* Greeting */}
					<Text style={paragraph}>
						Hey {name}
					</Text>
					{/* Instructions */}
					<Text style={paragraph}>
						We noticed you requested to reactivate your account. Please verify
						yourself using the OTP below:
					</Text>

					{/* OTP Code */}
					<Section style={codeContainer}>
						<Text style={code}>{activationCode}</Text>
					</Section>
					<Text style={paragraph}>
						Enter this code in the reactivation page or <br /> Click the link
						below:
					</Text>
					<Section style={{ textAlign: "center", margin: "20px 0" }}>
						<Link href={redirectLink} style={link}>
							Verification Page For Reactivating Account
						</Link>
					</Section>

					<Text style={paragraph}>
						You can easily reactivate your account before
						<b> {deadline.toDateString()}</b>.
					</Text>

					{/* Additional Info */}
					<Text style={paragraph}>
						If you didn’t request to reactivate your account, please ignore this
						email. Your account will be permanently deleted after the scheduled
						date.{" "}
					</Text>
					{/* Fallback URL */}
					<br />
				</Container>

				{/* Footer */}
				<Text style={footer}>Securely powered by {appName}</Text>
			</Body>
		</Html>
	);
};
