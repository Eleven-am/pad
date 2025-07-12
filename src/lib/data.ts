"use server";

import { cache } from 'react'
import {contentService, instagramService, mediaService, postService, tableService, postCollaborationService} from "@/services/di";
import { siteConfigService } from "@/services/di";
import {
	BlockType,
	CreateBlockInput,
	UnifiedBlockInput,
	UpdateBlockInput,
	CategoryData,
	TagData,
	BlockPositionUpdate
} from "@/services/types";
import { CreatePostInput, UpdatePostInput } from '@/services/postService';
import { ChartSelections } from "@/lib/charts";
import {
	canReadPostCached,
	canCreatePostCached,
	canUpdatePostCached,
	canDeletePostCached,
	canPublishPostCached,
	canReadFileCached,
	canReadCategoryCached,
	canCreateCategoryCached,
	canUpdateCategoryCached,
	canDeleteCategoryCached,
	canReadTagCached,
	canCreateTagCached,
	canUpdateTagCached,
	canDeleteTagCached,
} from './permissions';
import {padCache, PadResult} from './guard';
import { ProgressVariant, CollaboratorRole, RevisionType } from "@/generated/prisma";

export async function unwrap<T>(result: Promise<PadResult<T>>): Promise<T> {
	const res = await result;
	if ('success' in res && res.success) {
		return res.data;
	}
	
	const error = 'error' in res ? res.error : 'An unknown error occurred';
	throw new Error(error);
}


export const getPublicUrl = padCache(async (fileId: string) => {
	return mediaService.getPublicUrl(fileId, 60).toResult();
});

export const getDataRows = canReadFileCached(async (fileId: string) => {
	return tableService.getFormatedData(fileId).toResult();
});

export const analyzeFileForChart = canReadFileCached(async (fileId: string) => {
	return tableService.analyzeFileForChart(fileId).toResult();
});

export const prepareChartFromFile = canReadFileCached(async (fileId: string, userSelections: ChartSelections) => {
	return tableService.prepareChartFromFile(fileId, userSelections).toResult();
});

export const getPostStats = canReadPostCached(async (postId: string) => {
	return postService.getPostById(postId).toResult();
});

export const getContentAnalysis = canReadPostCached(async (postId: string) => {
	return contentService.analyzeContent(postId).toResult();
});

export const createBlock = canCreatePostCached(async (postId: string, data: CreateBlockInput) => {
	return contentService.createBlock(postId, data).toResult();
});

export const readBlock = canReadPostCached(async (blockId: string, blockType: BlockType) => {
	return contentService.readBlock(blockId, blockType).toResult();
});

export const updateBlock = canUpdatePostCached(async (blockId: string, data: UpdateBlockInput) => {
	return contentService.updateBlock(blockId, data).toResult();
});

export const deleteBlock = canDeletePostCached(async (blockId: string, blockType: BlockType) => {
	return contentService.deleteBlock(blockId, blockType).toResult();
});

export const moveBlocks = canUpdatePostCached(async (blocks: BlockPositionUpdate[]) => {
	return contentService.moveBlocks(blocks).toResult();
});

export const getBlocksByPostId = canReadPostCached(async (postId: string) => {
	return contentService.getBlocksByPostId(postId).toResult();
});

export const getBlocksBySlug = canReadPostCached(async (slug: string) => {
	return contentService.getBlocksBySlug(slug).toResult();
});

export const getPostById = canReadPostCached(async (postId: string, userId?: string) => {
	return postService.getPostById(postId, userId).toResult();
});

export const getPostBySlug = canReadPostCached(async (slug: string, userId?: string) => {
	return postService.getPostBySlug(slug, userId).toResult();
});

export const getTrackerByPostId = canReadPostCached(async (postId: string) => {
	return postService.getProgressTracker(postId).toResult();
});

export const createPost = canCreatePostCached(async (data: CreatePostInput, userId: string) => {
	return postService.createPost(data, userId).toResult();
});

export const updatePost = canUpdatePostCached(async (postId: string, data: UpdatePostInput, userId: string) => {
	return postService.updatePost(postId, data, userId).toResult();
});

export const deletePost = canDeletePostCached(async (postId: string, userId: string) => {
	return postService.deletePost(postId, userId).toResult();
});

export const updatePostTags = canUpdatePostCached(async (postId: string, tagIds: string[], userId: string) => {
	return postService.updatePostTags(postId, tagIds, userId).toResult();
});

export const createBlocksInPost = canCreatePostCached(async (postId: string, blocks: UnifiedBlockInput[]) => {
	return contentService.createBlocksInPost(postId, blocks).toResult();
});

export const deleteBlocksInPost = canDeletePostCached(async (blocks: UnifiedBlockInput[]) => {
	return contentService.deleteBlocksInPost(blocks).toResult();
});

export const getSiteConfig = cache(async () => {
	const config = await siteConfigService.getSiteConfig().toPromise();
	return siteConfigService.convertToLegacyFormat(config);
});

export const publishPost = canPublishPostCached(async (postId: string, userId: string) => {
	return postService.publishPost(postId, userId).toResult();
});

export const unpublishPost = canPublishPostCached(async (postId: string, userId: string) => {
	return postService.unpublishPost(postId, userId).toResult();
});

export const toggleFeaturedPost = canPublishPostCached(async (postId: string, userId: string) => {
	return postService.toggleFeaturedPost(postId, userId).toResult();
});

export const schedulePost = canPublishPostCached(async (postId: string, scheduledAt: Date, userId: string) => {
	return postService.schedulePost(postId, scheduledAt, userId).toResult();
});

export const getFormatedData = canReadFileCached(async (fileId: string) => {
	return tableService.getFormatedData(fileId).toResult();
});

export const getCategories = canReadCategoryCached(async () => {
	return postService.getCategories().toResult();
});

export const getTags = canReadTagCached(async () => {
	return postService.getTags().toResult();
});

export const createCategory = canCreateCategoryCached(async (data: CategoryData) => {
	return postService.createCategory(data).toResult();
});

export const updateCategory = canUpdateCategoryCached(async (categoryId: string, data: CategoryData) => {
	return postService.updateCategory(categoryId, data).toResult();
});

export const deleteCategory = canDeleteCategoryCached(async (categoryId: string) => {
	return postService.deleteCategory(categoryId).toResult();
});

export const createTag = canCreateTagCached(async (data: TagData) => {
	return postService.createTag(data).toResult();
});

export const updateTag = canUpdateTagCached(async (tagId: string, data: TagData) => {
	return postService.updateTag(tagId, data).toResult();
});

export const deleteTag = canDeleteTagCached(async (tagId: string) => {
	return postService.deleteTag(tagId).toResult();
});

export const getTagById = canReadTagCached(async (id: string) => {
	return postService.getTagById(id).toResult();
});

export const getCategoryById = canReadCategoryCached(async (id: string) => {
	return postService.getCategoryById(id).toResult();
});

export const createInstagramPost = canCreatePostCached(async (postId: string, userId: string, url: string) => {
	return instagramService.createInstagramPost(postId, userId, url).toResult();
});

export const createProgressTracker = canCreatePostCached(async (postId: string, data: { variant: ProgressVariant; showPercentage: boolean }) => {
	return postService.createProgressTracker(postId, data).toResult();
});

export const updateProgressTracker = canUpdatePostCached(async (postId: string, data: { variant: ProgressVariant; showPercentage: boolean }) => {
	return postService.updateProgressTracker(postId, data).toResult();
});

export const deleteProgressTracker = canDeletePostCached(async (postId: string) => {
	return postService.deleteProgressTracker(postId).toResult();
});

// Post Collaboration Functions
export const inviteCollaborator = canUpdatePostCached(async (postId: string, email: string, role: CollaboratorRole, inviterUserId: string) => {
	return postCollaborationService.inviteCollaborator({
		postId,
		email,
		role,
		inviterUserId
	}).toResult();
});

export const acceptCollaboration = canUpdatePostCached(async (postId: string, userId: string) => {
	return postCollaborationService.acceptCollaboration(postId, userId).toResult();
});

export const declineCollaboration = canUpdatePostCached(async (postId: string, userId: string) => {
	return postCollaborationService.declineCollaboration(postId, userId).toResult();
});

export const updateCollaboratorRole = canUpdatePostCached(async (postId: string, collaboratorUserId: string, newRole: CollaboratorRole, updaterUserId: string) => {
	return postCollaborationService.updateCollaboratorRole(postId, collaboratorUserId, newRole, updaterUserId).toResult();
});

export const createRevision = canUpdatePostCached(async (postId: string, userId: string, revisionType: RevisionType, summary: string, blocksAdded: number = 0, blocksModified: number = 0, blocksRemoved: number = 0) => {
	return postCollaborationService.createRevision({
		postId,
		userId,
		revisionType,
		summary,
		blocksAdded,
		blocksModified,
		blocksRemoved
	}).toResult();
});

export const getPostCollaborators = canReadPostCached(async (postId: string) => {
	return postCollaborationService.getPostCollaborators(postId).toResult();
});

export const getPostActivity = canReadPostCached(async (postId: string, limit: number = 20) => {
	return postCollaborationService.getPostActivity(postId, limit).toResult();
});

export const getPendingInvitations = padCache(async (userId: string) => {
	return postCollaborationService.getPendingInvitations(userId).toResult();
});

export const canUserEditPost = canReadPostCached(async (postId: string, userId: string) => {
	return postCollaborationService.canUserEditPost(postId, userId).toResult();
});

export const getCollaborationSummary = canReadPostCached(async (postId: string) => {
	return postCollaborationService.getCollaborationSummary(postId).toResult();
});

export const getUserCollaborativePosts = cache(async (userId: string) => {
	return postCollaborationService.getUserCollaborativePosts(userId).toResult();
});

// Unauthenticated versions for public blog viewing
export const getPostBySlugPublic = padCache(async (slug: string, userId?: string) => {
	return postService.getPostBySlug(slug, userId).toResult();
});

export const getBlocksByPostIdPublic = padCache(async (postId: string) => {
	return contentService.getBlocksByPostId(postId).toResult();
});

export const getTrackerByPostIdPublic = padCache(async (postId: string) => {
	return postService.getProgressTracker(postId).toResult();
});

export const getContentAnalysisPublic = padCache(async (postId: string) => {
	return contentService.analyzeContent(postId).toResult();
});

// Co-author management functions
export const promoteToCoAuthor = canUpdatePostCached(async (postId: string, collaboratorUserId: string, updaterUserId: string) => {
	return postCollaborationService.promoteToCoAuthor(postId, collaboratorUserId, updaterUserId).toResult();
});

export const demoteFromCoAuthor = canUpdatePostCached(async (postId: string, coAuthorUserId: string, updaterUserId: string) => {
	return postCollaborationService.demoteFromCoAuthor(postId, coAuthorUserId, updaterUserId).toResult();
});

export const getPostAuthors = canReadPostCached(async (postId: string) => {
	return postCollaborationService.getPostAuthors(postId).toResult();
});

export const isUserAuthor = canReadPostCached(async (postId: string, userId: string) => {
	return postCollaborationService.isUserAuthor(postId, userId).toResult();
});

// Public versions for blog display
export const getPostAuthorsPublic = padCache(async (postId: string) => {
	return postCollaborationService.getPostAuthors(postId).toResult();
});

// Search and posts functionality
export const searchPosts = padCache(async (query: string, options: {
	includeUnpublished?: boolean;
	limit?: number;
	includeStats?: boolean;
} = {}) => {
	return postService.searchPosts(query, options).toResult();
});

export const getPublishedPosts = padCache(async (options: {
	limit?: number;
	includeStats?: boolean;
	authorId?: string;
} = {}) => {
	return postService.getPublishedPostsList(options).toResult();
});

export const getUserPostsWithStats = canReadPostCached(async (userId: string, options: {
	includeUnpublished?: boolean;
	limit?: number;
	offset?: number;
} = {}) => {
	return postService.getUserPostsWithStats(userId, options).toResult();
});

