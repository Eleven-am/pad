import { getOrDefault } from "@/lib/server-utils";
import { PrismaClient } from "@/generated/prisma";
import { MediaService } from "@/services/mediaService";
import { TableService } from "@/services/tableService";
import { PostService } from "@/services/postService";
import { UserService } from "@/services/userService";
import { ContentService } from "@/services/contentService";
import { InstagramService } from "@/services/instagramService";
import { PostCollaborationService } from "@/services/postCollaborationService";
import { DashboardService } from "@/services/dashboardService";
import { DashboardEnhancedService } from "@/services/dashboardEnhancedService";
import { SiteConfigService } from "@/services/siteConfigService";
import { PostExcerptService } from "@/services/postExcerptService";
import { createEmailService } from "@/services/emailService";
import { NewsletterService } from "@/services/newsletterService";
import { ReadingAnalyticsService } from "@/services/readingAnalyticsService";

const prisma = new PrismaClient();

export const mediaService = new MediaService(
	prisma,
	getOrDefault('MEDIA_BASE_PATH') || './uploads',
	parseInt(getOrDefault('MEDIA_SIGNED_URL_TTL') || '3600', 10), // 1 hour default TTL for signed URLs
);

export const tableService = new TableService(prisma, mediaService);

export const userService = new UserService(prisma, mediaService);

export const contentService = new ContentService(prisma);

export const postService = new PostService(prisma, userService, contentService);

export const instagramService = new InstagramService(mediaService, contentService);

export const emailService = createEmailService();

export const postCollaborationService = new PostCollaborationService(prisma, emailService);

export const dashboardService = new DashboardService(prisma);

export const dashboardEnhancedService = new DashboardEnhancedService(prisma);

export const siteConfigService = new SiteConfigService(prisma);

export const postExcerptService = new PostExcerptService(prisma);

export const newsletterService = new NewsletterService(prisma, emailService);

export const readingAnalyticsService = new ReadingAnalyticsService(prisma);