import { cn, Skeleton } from "@shadcn";
import type { User } from "../../../domain/index.js";
import { UserAvatar } from "./user-avatar.js";

export interface UserViewProps {
	user?: User | null;
	isPending?: boolean;
	size?: "sm" | "default" | "lg";
	showEmail?: boolean;
	className?: string;
	avatarClassName?: string;
}

export function UserView({
	user,
	isPending,
	size = "default",
	showEmail = true,
	className,
	avatarClassName,
}: UserViewProps) {
	const textSizes = {
		sm: "text-xs",
		default: "text-sm",
		lg: "text-base",
	};

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<UserAvatar
				user={user}
				isPending={isPending}
				size={size}
				className={avatarClassName}
			/>
			<div className="flex flex-col min-w-0">
				{isPending ? (
					<>
						<Skeleton className="h-4 w-24 mb-1" />
						{showEmail && <Skeleton className="h-3 w-32" />}
					</>
				) : (
					<>
						<span className={cn("font-medium truncate", textSizes[size])}>
							{user?.name || "Anonymous"}
						</span>
						{showEmail && user?.email && (
							<span
								className={cn("text-muted-foreground truncate", textSizes[size])}
							>
								{user.email}
							</span>
						)}
					</>
				)}
			</div>
		</div>
	);
}
