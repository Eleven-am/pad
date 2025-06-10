import { Redis } from "ioredis";
import { getOrDefault, getOrThrow } from "@/lib/server-utils";
import { PrismaClient } from "@/generated/prisma";
import { MediaService } from "@/services/mediaService";
import { TableService } from "@/services/tableService";
import { PostService } from "@/services/postService";
import { UserService } from "@/services/userService";
import { ContentService } from "@/services/contentService";
import { InstagramService } from "@/services/instagramService";
import { PostCollaborationService } from "@/services/postCollaborationService";

const redis = new Redis({
	host: getOrThrow('REDIS_HOST'),
	port: parseInt(getOrThrow('REDIS_PORT'), 10),
	password: getOrDefault('REDIS_PASSWORD'),
	db: parseInt(getOrThrow('REDIS_DB'), 10),
});

const prisma = new PrismaClient();

export const mediaService = new MediaService(
	prisma,
	redis,
	getOrThrow('MEDIA_BASE_PATH'),
	parseInt(getOrThrow('MEDIA_MAX_SIZE'), 10),
);

export const tableService = new TableService(prisma, mediaService);

export const userService = new UserService(prisma, mediaService);

export const contentService = new ContentService(prisma);

export const postService = new PostService(prisma, userService, contentService);

export const instagramService = new InstagramService(mediaService, contentService);

export const postCollaborationService = new PostCollaborationService(prisma);
