import { Button, cn } from "@shadcn";
import { useAtom } from "@effect-atom/atom-react";
import { FingerprintIcon } from "lucide-react";
import { signInWithPasskeyAtom } from "../../../client/atoms/index.js";

export interface PasskeyButtonProps {
	className?: string;
}

export function PasskeyButton({ className }: PasskeyButtonProps) {
	const [passkeyResult, signInWithPasskey] = useAtom(signInWithPasskeyAtom);

	const handlePasskeyClick = () => {
		signInWithPasskey();
	};

	return (
		<Button
			type="button"
			variant="outline"
			className={cn("w-full", className)}
			onClick={handlePasskeyClick}
			disabled={passkeyResult.waiting}
		>
			<FingerprintIcon className="size-4 mr-2" />
			{passkeyResult.waiting ? "Authenticating..." : "Sign in with Passkey"}
		</Button>
	);
}
