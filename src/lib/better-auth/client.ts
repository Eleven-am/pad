import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { apiKeyClient } from "better-auth/client/plugins";
import { ac, ADMIN, EDITOR, AUTHOR, READER } from "@/lib/better-auth/serverPermissions";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
	
	plugins: [
		adminClient({
			ac,
			roles: {
				ADMIN,
				EDITOR,
				AUTHOR,
				READER,
			},
		}),
		apiKeyClient(),
	],
});

// Export types for use in your app
export type { User, Session } from "better-auth/types";

