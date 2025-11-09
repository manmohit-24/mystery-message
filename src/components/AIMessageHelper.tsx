import { useEffect, useState } from "react";
import { useCompletion, useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

import {
	Heart,
	Laugh,
	Flame,
	MessageSquare,
	Sparkles,
	Quote,
	Feather,
	Smile,
	Coffee,
	Wand2,
	Copy,
	Check,
} from "lucide-react";

export const aiModes: { [key: string]: { label: string; icon: any } } = {
	fun_compliment: {
		label: "Fun Compliment",
		icon: Sparkles,
	},
	witty_roast: {
		label: "Witty Roast",
		icon: Flame,
	},
	serious_feedback: {
		label: "Serious Feedback",
		icon: MessageSquare,
	},
	parse_message: {
		label: "Parse Message",
		icon: Quote,
	},
	motivational_message: {
		label: "Motivational Message",
		icon: Feather,
	},
	joke: {
		label: "Joke",
		icon: Laugh,
	},
	short_story: {
		label: "Short Story",
		icon: Wand2,
	},
	casual_conversation: {
		label: "Casual Conversation",
		icon: Coffee,
	},
	romantic_message: {
		label: "Romantic Message",
		icon: Heart,
	},
	default: {
		label: "Default",
		icon: Smile,
	},
};

export function AIMessageHelper({
	onUse,
}: {
	onUse: (message: string) => void;
}) {
	const modes = Object.keys(aiModes);
	const [prompt, setPrompt] = useState("");
	const [mode, setMode] = useState(modes[0]);
    const [copied, setCopied] = useState(false);

	const { completion, complete, isLoading } = useCompletion({
		api: "/api/ai-suggestion",
	});

    const handleGenerate = async () => {
        if (!prompt) return toast.warning("Write something first!");
        if (prompt.length < 10) return toast.warning("Your input is too short.");

		if (!prompt.trim()) return toast.warning("Write something first!");
		await complete(JSON.stringify({ prompt, mode }));
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(completion);
		setCopied(true);
		toast.success("Copied to clipboard!");
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<Card className="mt-6 border border-muted/40 gap-1">
			<CardHeader>
				<div className="flex items-center gap-2 text-lg font-semibold">
					<Sparkles className="h-5 w-5 text-yellow-500" /> AI Message Generator
				</div>
			</CardHeader>
			<CardContent className="p-4 space-y-4">
				<Textarea
					placeholder='e.g. "Write a cute message for her"'
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					className="flex-1"
				/>
				<div className="flex justify-between">
					<Select value={mode} onValueChange={setMode}>
						<SelectTrigger className="w-50">
							<SelectValue placeholder="Choose tone" />
						</SelectTrigger>
						<SelectContent>
							{modes.map((mode: string) => {
								const label = aiModes[mode]?.label;
								const Icon = aiModes[mode]?.icon;
								return (
									<SelectItem key={mode} value={mode}>
										{Icon && <Icon className="mr-2 h-4 w-4" />}
										{label}
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>

					<Button className="w-32" onClick={handleGenerate} disabled={isLoading}>
						{isLoading ? "Thinking..." : "Generate"}
					</Button>
				</div>
				{completion && (
					<div className="relative border rounded-md bg-muted/30 p-3">
						<div className="p-4 bg-muted/30 rounded-lg font-medium text-foreground">
							<TypingEffect
								text={completion}
								isStreaming={isLoading}
								speed={20}
							/>
						</div>

						<div className="flex gap-2 mt-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onUse(completion)}
								disabled={isLoading}
							>
								Use this message
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={handleCopy}
								disabled={isLoading}
							>
								{copied ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function TypingEffect({
	text,
	speed = 30, // ms per character
	isStreaming = false,
}: {
	text: string;
	speed?: number;
	isStreaming?: boolean;
}) {
	const [displayed, setDisplayed] = useState("");
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (!text) return;

		// If we still have characters to type
		if (index < text.length) {
			const timeout = setTimeout(() => {
				setDisplayed((prev) => prev + text[index]);
				setIndex((i) => i + 1);
			}, speed);
			return () => clearTimeout(timeout);
		}
	}, [index, text, speed]);

	return (
		<span className="whitespace-pre-wrap">
			{displayed}
			{isStreaming && (
				<span className="w-3 h-3 bg-foreground rounded-full animate-pulse z-10" />
			)}
		</span>
	);
}
