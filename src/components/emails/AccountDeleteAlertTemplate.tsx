import { constants } from "@/lib/constants";
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Section,
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

interface AccountDeleteAlertEmailProps {
	name: string;
	deletionDate: Date;
}

const { appName } = constants;

export const AccountDeleteAlertTemplate = ({
	name,
	deletionDate,
}: AccountDeleteAlertEmailProps) => {
	const formattedDeletionDate = new Date(deletionDate).toLocaleDateString();
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					{/* App Header */}
					<Text style={tertiary}>{appName}</Text>

					{/* Heading */}
					<Heading style={secondary}>Account Deletion Alert</Heading>

					<Text style={paragraph}>
						Hey {name} <br />
					</Text>
					{/* Instructions */}
					<Text style={paragraph}>
						We received a request to delete your {appName}'s account. If this
						was you, no action is needed — your account is scheduled for
						deletion in{" "}
						<i>
							<b>7 days</b>
						</i>
						.
					</Text>
					<Text style={paragraph}>
						You can still change your mind. Simply log in again before{" "}
						<i>
							<b>{formattedDeletionDate} </b>
						</i>
						to cancel the deletion and restore your account.
					</Text>
					<Section style={codeContainer}>
						<Text
							style={{
								...tertiary,
								color: "oklch(57.7% 0.245 27.325)",
								fontSize: "12px",
							}}
						>
							Account Deletion Date:
						</Text>
						<Text style={secondary}> {formattedDeletionDate}</Text>
					</Section>

					{/* Extra Info */}
					<Text style={paragraph}>
						If this wasn’t you, we recommend logging in and securing your
						account immediately.
                    </Text>
                    <br/>
				</Container>

				{/* Footer */}
				<Text style={footer}>Securely powered by {appName}</Text>
			</Body>
		</Html>
	);
};
