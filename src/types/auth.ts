import { Session } from "better-auth";

// Basic user type returned by better-auth
export interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  banned?: boolean | null;
  role?: string | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

// Extended user type with all fields from Prisma schema
export interface AuthUser extends BetterAuthUser {
  bio: string | null;
  avatarFileId: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
}

// Session type returned by auth.api.getSession
export interface AuthSession {
  session: Session;
  user: BetterAuthUser;
}

// Full session type with extended user data
export interface ExtendedAuthSession {
  session: Session;
  user: AuthUser;
}