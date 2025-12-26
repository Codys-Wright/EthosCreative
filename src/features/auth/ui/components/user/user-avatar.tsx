import { Avatar, cn, Skeleton } from "@shadcn";
import { UserIcon } from "lucide-react";
import type { User } from "../../../domain/index.js";

const sizeClasses = {
	sm: "size-8",
	default: "size-10",
	lg: "size-12",
	xl: "size-16",
};

export interface UserAvatarProps {
	user?: User | null;
	isPending?: boolean;
	size?: keyof typeof sizeClasses;
	className?: string;
}

function getInitials(name?: string | null): string {
	if (!name) return "";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (
		parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
	).toUpperCase();
}

export function UserAvatar({
	user,
	isPending,
	size = "default",
	className,
}: UserAvatarProps) {
	if (isPending) {
		return (
			<Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
		);
	}

	return (
		<Avatar className={cn(sizeClasses[size], className)}>
			{user?.image && <Avatar.Image src={user.image} alt={user.name} />}
			<Avatar.Fallback>
				{user?.name ? getInitials(user.name) : <UserIcon className="size-1/2" />}
			</Avatar.Fallback>
		</Avatar>
	);
}
