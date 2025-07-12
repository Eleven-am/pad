import { Session } from "better-auth";

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

export interface AuthUser extends BetterAuthUser {
  bio: string | null;
  avatarFileId: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
}

export interface AuthSession {
  session: Session;
  user: BetterAuthUser;
}

export interface ExtendedAuthSession {
  session: Session;
  user: AuthUser;
}