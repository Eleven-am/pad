-- CreateEnum
CREATE TYPE "CalloutType" AS ENUM ('WARNING', 'INFO', 'SUCCESS', 'ERROR', 'TIP', 'DANGER', 'NOTE', 'IMPORTANT', 'CAUTION');

-- CreateEnum
CREATE TYPE "HeadingLevel" AS ENUM ('H1', 'H2', 'H3', 'H4', 'H5', 'H6');

-- CreateEnum
CREATE TYPE "AudioStatus" AS ENUM ('NOT_GENERATED', 'GENERATING', 'GENERATED', 'FAILED', 'NEEDS_REGENERATION');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('AREA', 'BAR', 'LINE', 'PIE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR', 'READER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('POSTS_READ', 'POSTS_WRITE', 'POSTS_DELETE', 'ANALYTICS_READ', 'FILES_UPLOAD', 'FILES_DELETE', 'USERS_READ', 'USERS_WRITE', 'WEBHOOKS_READ', 'WEBHOOKS_WRITE', 'TAGS_WRITE', 'CATEGORIES_WRITE', 'ADMIN_ALL');

-- CreateEnum
CREATE TYPE "ProgressVariant" AS ENUM ('SUBTLE', 'VIBRANT', 'NONE', 'CIRCULAR');

-- CreateEnum
CREATE TYPE "TableMobileLayout" AS ENUM ('STACK', 'CARDS', 'SCROLL');

-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('BULLET', 'NUMBERED', 'CHECKLIST');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AUTHOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatarFileId" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "github" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "focusKeyword" TEXT,
    "audioFileId" TEXT,
    "audioStatus" "AudioStatus" NOT NULL DEFAULT 'NOT_GENERATED',
    "audioGeneratedAt" TIMESTAMP(3),
    "audioDuration" INTEGER,
    "seriesId" TEXT,
    "seriesOrder" INTEGER,
    "categoryId" TEXT,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chartOptions" JSONB NOT NULL,
    "fileId" TEXT NOT NULL,
    "xAxis" TEXT NOT NULL,
    "yAxis" TEXT NOT NULL,
    "series" TEXT,
    "chartType" "ChartType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reads" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "scrollDepth" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "post_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_views" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_bookmarks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "post_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_redirects" (
    "id" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPreview" TEXT NOT NULL,
    "permissions" "Permission"[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "httpStatus" INTEGER,
    "responseBody" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetry" TIMESTAMP(3),
    "endpointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_blocks" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Text',
    "hasDropCap" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Video',
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL,
    "videoFileId" TEXT NOT NULL,
    "posterFileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Quote',
    "quote" TEXT NOT NULL,
    "author" TEXT,
    "source" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Images',
    "caption" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "callouts" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Callout',
    "type" "CalloutType" NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "callouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Code',
    "codeText" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "showLineNumbers" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "maxHeight" INTEGER NOT NULL DEFAULT 400,
    "startLine" INTEGER NOT NULL DEFAULT 1,
    "highlightLines" INTEGER[],
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Table',
    "caption" TEXT,
    "description" TEXT,
    "mobileLayout" "TableMobileLayout" NOT NULL DEFAULT 'CARDS',
    "position" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "dataSourceId" TEXT,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Twitter',
    "username" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "retweets" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "imageFileId" TEXT,
    "avatarId" TEXT,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_files" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Instagram',
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "location" TEXT,
    "date" TEXT NOT NULL,
    "instagramId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_trackers" (
    "id" TEXT NOT NULL,
    "variant" "ProgressVariant" NOT NULL DEFAULT 'SUBTLE',
    "showPercentage" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Chart',
    "type" "ChartType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "showGrid" BOOLEAN NOT NULL DEFAULT true,
    "showLegend" BOOLEAN NOT NULL DEFAULT true,
    "showFooter" BOOLEAN NOT NULL DEFAULT true,
    "stacked" BOOLEAN,
    "connectNulls" BOOLEAN,
    "fillOpacity" DOUBLE PRECISION,
    "strokeWidth" INTEGER,
    "barRadius" INTEGER,
    "innerRadius" INTEGER,
    "outerRadius" INTEGER,
    "showLabels" BOOLEAN,
    "labelKey" TEXT,
    "valueKey" TEXT,
    "dataSourceId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_blocks" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "ListType" NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "listBlockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heading_blocks" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "level" "HeadingLevel" NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heading_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polling_blocks" (
    "id" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Polling',
    "title" TEXT,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polling_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polling_options" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "pollingBlockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polling_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_postId_tagId_key" ON "post_tags"("postId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_bookmarks_postId_userId_key" ON "post_bookmarks"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_series_slug_key" ON "post_series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_redirects_fromUrl_key" ON "post_redirects"("fromUrl");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "progress_trackers_postId_key" ON "progress_trackers"("postId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "post_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_redirects" ADD CONSTRAINT "post_redirects_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_blocks" ADD CONSTRAINT "text_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_blocks" ADD CONSTRAINT "video_blocks_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_blocks" ADD CONSTRAINT "video_blocks_posterFileId_fkey" FOREIGN KEY ("posterFileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_blocks" ADD CONSTRAINT "video_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_blocks" ADD CONSTRAINT "quote_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images_blocks" ADD CONSTRAINT "images_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "images_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "callouts" ADD CONSTRAINT "callouts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_blocks" ADD CONSTRAINT "code_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_blocks" ADD CONSTRAINT "table_blocks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_blocks" ADD CONSTRAINT "table_blocks_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_blocks" ADD CONSTRAINT "table_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitter_blocks" ADD CONSTRAINT "twitter_blocks_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitter_blocks" ADD CONSTRAINT "twitter_blocks_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitter_blocks" ADD CONSTRAINT "twitter_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_files" ADD CONSTRAINT "instagram_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_files" ADD CONSTRAINT "instagram_files_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "instagram_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_blocks" ADD CONSTRAINT "instagram_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_trackers" ADD CONSTRAINT "progress_trackers_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_blocks" ADD CONSTRAINT "chart_blocks_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_blocks" ADD CONSTRAINT "chart_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_blocks" ADD CONSTRAINT "list_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_listBlockId_fkey" FOREIGN KEY ("listBlockId") REFERENCES "list_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heading_blocks" ADD CONSTRAINT "heading_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_blocks" ADD CONSTRAINT "polling_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_options" ADD CONSTRAINT "polling_options_pollingBlockId_fkey" FOREIGN KEY ("pollingBlockId") REFERENCES "polling_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
