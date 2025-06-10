import {cachedGuard, guard} from "@/lib/guard";

// Post permissions
export const canReadPost = guard({
	post: ['read']
});

export const canCreatePost = guard({
	post: ['create']
});

export const canUpdatePost = guard({
	post: ['update']
});

export const canDeletePost = guard({
	post: ['delete']
});

export const canPublishPost = guard({
	post: ['publish']
});

// File permissions
export const canUploadFile = guard({
	file: ['upload']
});

export const canReadFile = guard({
	file: ['read']
});

export const canDeleteFile = guard({
	file: ['delete']
});

// Category permissions
export const canCreateCategory = guard({
	category: ['create']
});

export const canReadCategory = guard({
	category: ['read']
});

export const canUpdateCategory = guard({
	category: ['update']
});

export const canDeleteCategory = guard({
	category: ['delete']
});

// Tag permissions
export const canCreateTag = guard({
	tag: ['create']
});

export const canReadTag = guard({
	tag: ['read']
});

export const canUpdateTag = guard({
	tag: ['update']
});

export const canDeleteTag = guard({
	tag: ['delete']
});

// Analytics permissions
export const canReadAnalytics = guard({
	analytics: ['read']
});

// Webhook permissions
export const canCreateWebhook = guard({
	webhook: ['create']
});

export const canReadWebhook = guard({
	webhook: ['read']
});

export const canUpdateWebhook = guard({
	webhook: ['update']
});

export const canDeleteWebhook = guard({
	webhook: ['delete']
});

// Cached versions
export const canReadPostCached = cachedGuard({
	post: ['read']
});

export const canCreatePostCached = cachedGuard({
	post: ['create']
});

export const canUpdatePostCached = cachedGuard({
	post: ['update']
});

export const canDeletePostCached = cachedGuard({
	post: ['delete']
});

export const canPublishPostCached = cachedGuard({
	post: ['publish']
});

export const canUploadFileCached = cachedGuard({
	file: ['upload']
});

export const canReadFileCached = cachedGuard({
	file: ['read']
});

export const canDeleteFileCached = cachedGuard({
	file: ['delete']
});

export const canCreateCategoryCached = cachedGuard({
	category: ['create']
});

export const canReadCategoryCached = cachedGuard({
	category: ['read']
});

export const canUpdateCategoryCached = cachedGuard({
	category: ['update']
});

export const canDeleteCategoryCached = cachedGuard({
	category: ['delete']
});

export const canCreateTagCached = cachedGuard({
	tag: ['create']
});

export const canReadTagCached = cachedGuard({
	tag: ['read']
});

export const canUpdateTagCached = cachedGuard({
	tag: ['update']
});

export const canDeleteTagCached = cachedGuard({
	tag: ['delete']
});

export const canReadAnalyticsCached = cachedGuard({
	analytics: ['read']
});

export const canCreateWebhookCached = cachedGuard({
	webhook: ['create']
});

export const canReadWebhookCached = cachedGuard({
	webhook: ['read']
});

export const canUpdateWebhookCached = cachedGuard({
	webhook: ['update']
});

export const canDeleteWebhookCached = cachedGuard({
	webhook: ['delete']
});
