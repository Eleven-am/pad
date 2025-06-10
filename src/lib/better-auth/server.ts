import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, apiKey, openAPI } from "better-auth/plugins";
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { ac, ADMIN, EDITOR, AUTHOR, READER } from "./serverPermissions";
import { PrismaClient } from "@/generated/prisma";

export const auth = betterAuth({
	appName: process.env.APP_NAME,
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	secret: process.env.SECRET,
	database: prismaAdapter(new PrismaClient(), {
		provider: 'postgresql',
	}),
	
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	
	plugins: [
		adminPlugin({
			ac,
			roles: {
				ADMIN,
				EDITOR,
				AUTHOR,
				READER,
			},
			defaultRole: "AUTHOR",
			adminRoles: ["ADMIN", "EDITOR"],
			adminUserIds: [],
			impersonationSessionDuration: 60 * 60 * 2,
			defaultBanReason: "Terms of service violation",
			bannedUserMessage: "Your account has been suspended. Contact support for assistance.",
		}),
		
		apiKey({
			apiKeyHeaders: ["x-api-key", "authorization"],
			
			defaultKeyLength: 64,
			defaultPrefix: "pad_",
			maximumPrefixLength: 10,
			minimumPrefixLength: 3,
			
			maximumNameLength: 50,
			minimumNameLength: 3,
			
			enableMetadata: true,
			
			keyExpiration: {
				defaultExpiresIn: 60 * 60 * 24 * 30,
				minExpiresIn: 60 * 60,
				maxExpiresIn: 60 * 60 * 24 * 365,
				disableCustomExpiresTime: false,
			},
			
			rateLimit: {
				enabled: true,
				timeWindow: 1000 * 60,
				maxRequests: 100,
			},
			
			permissions: {
				defaultPermissions: {
					post: ["read"],
					file: ["read"],
				},
			},
			
			disableSessionForAPIKeys: false,
			disableKeyHashing: false,
		}),
		
		openAPI(),
		
		nextCookies(),
	],
	
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
		},
		useSecureCookies: process.env.NODE_ENV === "production",
	},
});

/*
*/
