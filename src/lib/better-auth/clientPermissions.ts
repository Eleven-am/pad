import { authClient } from "@/lib/better-auth/client";

/**
 * Common API key permission sets for different use cases
 */
export const API_KEY_PERMISSIONS: Record<string, Record<string, string[]>> = {
	// Read-only access for public APIs
	PUBLIC_READ: {
		post: ["read"],
		file: ["read"],
		category: ["read"],
		tag: ["read"],
	},
	
	// Content management for external tools
	CONTENT_MANAGER: {
		post: ["create", "read", "update"],
		file: ["upload", "read"],
		category: ["read"],
		tag: ["create", "read"],
	},
	
	// Analytics access
	ANALYTICS: {
		post: ["read"],
		analytics: ["read"],
	},
	
	// Webhook management
	WEBHOOK_MANAGER: {
		webhook: ["create", "read", "update", "delete"],
	},
	
	// Full API access (for admin tools)
	ADMIN_FULL: {
		post: ["create", "read", "update", "delete", "publish"],
		file: ["upload", "read", "delete"],
		category: ["create", "read", "update", "delete"],
		tag: ["create", "read", "update", "delete"],
		analytics: ["read"],
		webhook: ["create", "read", "update", "delete"],
	},
};

/**
 * Creates an API key with permissions based on the user's role
 * @param roleName - The role name to determine permissions
 * @param metadata - Optional metadata to attach to the API key
 * @returns The created API key object
 */
export const createApiKeyForRole = async (
	roleName: keyof typeof API_KEY_PERMISSIONS,
	metadata?: Record<string, string | number | boolean>
) => {
	return authClient.apiKey.create({
		name: `${roleName} API Key`,
		permissions: API_KEY_PERMISSIONS[roleName],
		metadata: {
			role: roleName,
			...metadata,
		},
		expiresIn: 60 * 60 * 24 * 30, // 30 days
	});
};
