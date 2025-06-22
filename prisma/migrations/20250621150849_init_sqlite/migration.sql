-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AUTHOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarFileId" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" DATETIME,
    CONSTRAINT "users_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "excerptImageId" TEXT,
    "excerptByline" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "scheduledAt" DATETIME,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "focusKeyword" TEXT,
    "audioFileId" TEXT,
    "audioStatus" TEXT NOT NULL DEFAULT 'NOT_GENERATED',
    "audioGeneratedAt" DATETIME,
    "audioDuration" INTEGER,
    "seriesId" TEXT,
    "seriesOrder" INTEGER,
    "categoryId" TEXT,
    CONSTRAINT "posts_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "posts_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "post_series" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,
    CONSTRAINT "files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_reads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "scrollDepth" REAL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "post_reads_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "post_bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_redirects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUrl" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_redirects_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "httpStatus" INTEGER,
    "responseBody" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetry" DATETIME,
    "endpointId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    CONSTRAINT "webhook_deliveries_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "webhook_endpoints" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "text_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Text',
    "hasDropCap" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "text_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "video_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Video',
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL,
    "videoFileId" TEXT NOT NULL,
    "posterFileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "video_blocks_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "files" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "video_blocks_posterFileId_fkey" FOREIGN KEY ("posterFileId") REFERENCES "files" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "video_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quote_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Quote',
    "quote" TEXT NOT NULL,
    "author" TEXT,
    "source" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "quote_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "images_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Images',
    "caption" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "images_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    CONSTRAINT "gallery_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "gallery_images_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "images_blocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "callouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Callout',
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "callouts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "code_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Code',
    "codeText" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "showLineNumbers" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "maxHeight" INTEGER NOT NULL DEFAULT 400,
    "startLine" INTEGER NOT NULL DEFAULT 1,
    "highlightLines" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "code_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "table_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Table',
    "caption" TEXT,
    "description" TEXT,
    "mobileLayout" TEXT NOT NULL DEFAULT 'CARDS',
    "position" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "table_blocks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "table_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "twitter_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "twitter_blocks_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "twitter_blocks_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "twitter_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instagram_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "instagram_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "instagram_files_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "instagram_blocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instagram_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Instagram',
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "location" TEXT,
    "date" TEXT NOT NULL,
    "instagramId" TEXT NOT NULL,
    "caption" TEXT,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "instagram_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progress_trackers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variant" TEXT NOT NULL DEFAULT 'SUBTLE',
    "showPercentage" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "progress_trackers_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chart_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Chart',
    "type" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "showGrid" BOOLEAN NOT NULL DEFAULT true,
    "showLegend" BOOLEAN NOT NULL DEFAULT true,
    "showFooter" BOOLEAN NOT NULL DEFAULT true,
    "stacked" BOOLEAN,
    "connectNulls" BOOLEAN,
    "fillOpacity" REAL,
    "strokeWidth" INTEGER,
    "barRadius" INTEGER,
    "innerRadius" INTEGER,
    "outerRadius" INTEGER,
    "showLabels" BOOLEAN,
    "labelKey" TEXT,
    "valueKey" TEXT,
    "orientation" TEXT,
    "labelPosition" TEXT,
    "showDots" BOOLEAN,
    "dotSize" INTEGER,
    "startAngle" INTEGER,
    "fileId" TEXT NOT NULL,
    "xAxis" TEXT NOT NULL,
    "yAxis" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chart_blocks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chart_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "list_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'List',
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "list_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "listBlockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "list_items_listBlockId_fkey" FOREIGN KEY ("listBlockId") REFERENCES "list_blocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "heading_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "blockName" TEXT NOT NULL DEFAULT 'Heading',
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "heading_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "polling_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockName" TEXT NOT NULL DEFAULT 'Polling',
    "title" TEXT,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "polling_blocks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "polling_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "pollingBlockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "polling_options_pollingBlockId_fkey" FOREIGN KEY ("pollingBlockId") REFERENCES "polling_blocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "apikey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "start" TEXT,
    "prefix" TEXT,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refillInterval" INTEGER,
    "refillAmount" INTEGER,
    "lastRefillAt" DATETIME,
    "enabled" BOOLEAN,
    "rateLimitEnabled" BOOLEAN,
    "rateLimitTimeWindow" INTEGER,
    "rateLimitMax" INTEGER,
    "requestCount" INTEGER,
    "remaining" INTEGER,
    "lastRequest" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "permissions" TEXT,
    "metadata" TEXT,
    CONSTRAINT "apikey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_collaborators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "post_collaborators_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_collaborators_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revisionType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "blocksChanged" INTEGER NOT NULL DEFAULT 0,
    "blocksAdded" INTEGER NOT NULL DEFAULT 0,
    "blocksRemoved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_revisions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_revisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "email_invitations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "email_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Pad Blog',
    "siteDescription" TEXT,
    "siteTagline" TEXT,
    "logoFileId" TEXT,
    "faviconFileId" TEXT,
    "twitterUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "seoKeywords" TEXT,
    "googleAnalytics" TEXT,
    "gtmId" TEXT,
    "footerLinks" JSONB DEFAULT [],
    "navLinks" JSONB DEFAULT [],
    "contactEmail" TEXT,
    "adminEmail" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "site_config_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "site_config_faviconFileId_fkey" FOREIGN KEY ("faviconFileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "progress_trackers_postId_key" ON "progress_trackers"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "post_collaborators_postId_userId_key" ON "post_collaborators"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_invitations_token_key" ON "email_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_invitations_email_postId_key" ON "email_invitations"("email", "postId");
