import * as path from 'path';
import { randomUUID } from 'crypto';
import { writeFile, mkdir, unlink, access, readFile } from 'fs/promises';
import { constants, createReadStream } from 'fs';
import { File as FileModel, PrismaClient } from '@/generated/prisma';
import {TaskEither, Either, createUnauthorizedError, createNotFoundError, Http, createBadRequestError} from '@eleven-am/fp';
import { z } from 'zod';

export interface StorageUsage {
	totalFiles: number;
	totalSize: number;
	sizeByType: Record<string, number>;
}

export interface FileUsageStats {
	totalAccess: number;
	lastAccessed: Date | null;
	usedInPosts: number;
	usedInBlocks: string[];
}

/**
 * Service for managing media files with SQL-based caching and analytics
 */
export class MediaService {
	private DEFAULT_ORPHANED_FILES_AGE: number = 30 * 24 * 60 * 60 * 1000;
	private USER_QUOTA: number = 1024 * 1024 * 1024;
	private MAX_FILE_SIZE: number = 100 * 1024 * 1024;
	private ALLOWED_TYPES: string[] = [
		'image/jpeg', 'image/png', 'image/gif', 'image/webp',
		'video/mp4', 'video/webm',
		'application/json', 'text/csv', 'text/plain'
	];

	/**
	 * @param prisma - Prisma client for database operations
	 * @param uploadsPath - Path to store uploaded files (default: './uploads')
	 * @param signedUrlTTL - TTL for signed URLs in seconds (default: 1 hour)
	 */
	constructor (
		private prisma: PrismaClient,
		private uploadsPath: string,
		private signedUrlTTL: number
	) {
		void mkdir (this.uploadsPath, {recursive: true});
		// Start cleanup job for expired signed URLs
		this.startCleanupJob();
	}
	
	/**
	 * Uploads a file to the server and stores metadata in the database
	 *
	 * @param file - Express multer file object
	 * @param uploaderId - ID of the user uploading the file
	 * @returns Promise resolving to saved FileModel
	 * @throws Error if file type is not allowed or quota exceeded
	 */
	uploadFile (file: Express.Multer.File, uploaderId: string): TaskEither<FileModel> {
		return this.checkUserQuota(uploaderId, file.size)
			.chain(() => this.validateFileType(file.mimetype))
			.chain(() => this.saveFileToDisk(file))
			.chain(savedPath => this.saveFileMetadata(file, savedPath, uploaderId));
	}
	
	/**
	 * Gets metadata for a specific file
	 *
	 * @param fileId - ID of the file to retrieve
	 * @returns Promise resolving to FileModel
	 * @throws Error if file not found
	 */
	getFile(fileId: string): TaskEither<FileModel> {
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findUnique({ where: { id: fileId } }),
				'Failed to get file'
			)
			.nonNullable('File not found');
	}
	
	/**
	 * Gets files uploaded by a specific user
	 *
	 * @param userId - ID of the user
	 * @param limit - Maximum number of files to return
	 * @param offset - Number of files to skip
	 * @returns Promise resolving to array of FileModel objects
	 */
	getUserFiles(userId: string, limit: number = 50, offset: number = 0): TaskEither<FileModel[]> {
		return TaskEither.tryCatch(
			() => this.prisma.file.findMany({
				where: { uploaderId: userId },
				orderBy: { uploadedAt: 'desc' },
				take: limit,
				skip: offset,
			}),
			'Failed to get user files'
		);
	}
	
	/**
	 * Deletes a file and its metadata
	 *
	 * @param fileId - ID of the file to delete
	 * @param userId - ID of the user requesting deletion
	 * @returns Promise resolving to deleted FileModel
	 * @throws Error if file not found or user not authorized
	 */
	deleteFile(fileId: string, userId: string): TaskEither<FileModel> {
		return this.getFile(fileId)
			.chain(file => this.checkFileOwnership(file, userId))
			.chain(file => this.deleteFileFromDisk(file))
			.chain(file => this.deleteFileMetadata(file));
	}
	
	/**
	 * Gets total storage usage for a specific user
	 *
	 * @param userId - ID of the user
	 * @returns Promise resolving to StorageUsage object
	 */
	getUserStorageUsage(userId: string): TaskEither<StorageUsage> {
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findMany({
					where: { uploaderId: userId },
					select: { size: true, mimeType: true },
				}),
				'Failed to get user storage usage'
			)
			.map(files => {
				const sizeByType: Record<string, number> = {};
				let totalSize = 0;
				
				files.forEach(file => {
					totalSize += file.size;
					const type = file.mimeType.split('/')[0];
					sizeByType[type] = (sizeByType[type] || 0) + file.size;
				});
				
				return {
					totalFiles: files.length,
					totalSize,
					sizeByType,
				};
			});
	}
	
	/**
	 * Generates a public URL for a file with optional expiration
	 * Uses SQL-based caching to avoid regenerating URLs
	 *
	 * @param fileId - ID of the file
	 * @param expiryInSeconds - Optional custom expiry time
	 * @returns Promise resolving to public URL string
	 * @throws Error if file not found
	 */
	getPublicUrl (fileId: string, expiryInSeconds?: number): TaskEither<string> {
		const ttl = expiryInSeconds || this.signedUrlTTL;
		const expiresAt = new Date(Date.now() + ttl * 1000);
		
		// Check for existing non-expired URL
		return TaskEither
			.tryCatch(
				() => this.prisma.signedUrl.findFirst({
					where: {
						fileId,
						expiresAt: { gt: new Date() }
					},
					orderBy: { expiresAt: 'desc' }
				}),
				'Failed to check for existing signed URL'
			)
			.chain(existingUrl => {
				if (existingUrl) {
					return TaskEither.success(existingUrl.url);
				}
				
				// Generate new signed URL
				return this.getFile(fileId)
					.map(file => {
						const timestamp = Date.now();
						const signedUrl = this.generateSignedUrl(file, timestamp);
						
						// Save to database
						void this.prisma.signedUrl.create({
							data: {
								fileId,
								url: signedUrl,
								expiresAt
							}
						});
						
						return signedUrl;
					});
			});
	}
	
	/**
	 * Retrieves a list of unused files older than a specified date
	 *
	 * @param olderThan - Optional date to filter files by upload date
	 * @returns Promise resolving to an array of FileModel objects
	 */
	getUnusedFiles (olderThan?: Date): TaskEither<FileModel[]> {
		const cutoffDate = olderThan || new Date(Date.now() - this.DEFAULT_ORPHANED_FILES_AGE);
		
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findMany ({
						where: {
							uploadedAt: {lt: cutoffDate},
							AND: [
								{tableBlocks: {none: {}}},
								{videoFiles: {none: {}}},
								{posterFiles: {none: {}}},
								{galleryImages: {none: {}}},
								{twitterImageFiles: {none: {}}},
								{postAudio: {none: {}}},
								{userAvatars: {none: {}}},
								{instagramFiles: {none: {}}},
							],
						},
					}),
				'Failed to get unused files'
			);
	}
	
	/**
	 * Deletes multiple files by their IDs
	 *
	 * @param fileIds - Array of file IDs to delete
	 * @returns Promise resolving to an object with deleted count and freed space
	 */
	deleteMultipleFiles (fileIds: string[]): TaskEither<{ deletedCount: number; freedSpace: number }> {
		const deleteFiles = (files: FileModel[]): TaskEither<FileModel[]> => TaskEither
			.tryCatch(
				() => this.prisma.file.deleteMany({
					where: {id: {in: files.map(file => file.id)}},
				})
			)
			.map(() => files);

		return TaskEither
			.tryCatch(
				() => this.prisma.file.findMany({where: {id: {in: fileIds}}}),
				'Failed to get files'
			)
			.chain((files) => deleteFiles(files))
			.map((files) => ({
				deletedCount: files.length,
				freedSpace: files.reduce((sum, file) => sum + file.size, 0),
			}));
	}
	
	/**
	 * Tracks file access for analytics purposes using SQL
	 *
	 * @param fileId - ID of the file being accessed
	 * @param userId - Optional user ID accessing the file
	 */
	trackFileAccess (fileId: string, userId?: string): TaskEither<void> {
		return TaskEither
			.tryCatch(
				() => this.prisma.fileAccessStats.upsert({
					where: { fileId },
					create: {
						fileId,
						totalAccess: 1,
						lastAccessedAt: new Date(),
						lastAccessedBy: userId || 'anonymous'
					},
					update: {
						totalAccess: { increment: 1 },
						lastAccessedAt: new Date(),
						lastAccessedBy: userId || 'anonymous'
					}
				}),
				'Failed to track file access'
			)
			.map(() => undefined);
	}
	
	/**
	 * Retrieves usage statistics for a specific file
	 *
	 * @param fileId - ID of the file to get usage stats for
	 * @returns Promise resolving to FileUsageStats object
	 * @throws Error if file not found
	 */
	getFileUsageStats(fileId: string): TaskEither<FileUsageStats> {
		const getAccessStats = TaskEither
			.tryCatch(
				() => this.prisma.fileAccessStats.findUnique({
					where: { fileId }
				}),
				'Failed to get file access stats'
			);

		const getUsageInfo = TaskEither
			.tryCatch(
				() => this.prisma.file.findUnique({
					where: { id: fileId },
					include: {
						tableBlocks: { select: { id: true } },
						videoFiles: { select: { id: true } },
						posterFiles: { select: { id: true } },
						galleryImages: { select: { id: true } },
						twitterImageFiles: { select: { id: true } },
						instagramFiles: { select: { id: true } },
						postAudio: { select: { id: true } },
					},
				}),
				'Failed to get file usage info'
			)
			.nonNullable('File not found');

		return TaskEither
			.all([getAccessStats, getUsageInfo])
			.map(([accessStats, file]) => {
				const usedInBlocks: string[] = [];
				
				if (file.tableBlocks.length > 0) {
					usedInBlocks.push(...file.tableBlocks.map(() => 'table'));
				}
				if (file.videoFiles.length > 0) {
					usedInBlocks.push(...file.videoFiles.map(() => 'video'));
				}
				if (file.posterFiles.length > 0) {
					usedInBlocks.push(...file.posterFiles.map(() => 'video-poster'));
				}
				if (file.galleryImages.length > 0) {
					usedInBlocks.push(...file.galleryImages.map(() => 'gallery'));
				}
				if (file.twitterImageFiles.length > 0) {
					usedInBlocks.push(...file.twitterImageFiles.map(() => 'twitter'));
				}
				if (file.instagramFiles.length > 0) {
					usedInBlocks.push(...file.instagramFiles.map(() => 'instagram'));
				}
				
				const usedInPosts = file.postAudio.length;
				
				return {
					totalAccess: accessStats?.totalAccess || 0,
					lastAccessed: accessStats?.lastAccessedAt || null,
					usedInPosts,
					usedInBlocks,
				};
			});
	}
	
	/**
	 * Invalidates all signed URLs for a specific file
	 *
	 * @param fileId - ID of the file to invalidate URLs for
	 * @returns Promise resolving to number of URLs invalidated
	 */
	invalidateSignedUrls(fileId: string): TaskEither<number> {
		return TaskEither
			.tryCatch(
				() => this.prisma.signedUrl.deleteMany({
					where: { fileId }
				}),
				'Failed to invalidate signed URLs'
			)
			.map(result => result.count);
	}
	
	/**
	 * Retrieves all active signed URLs for a specific file
	 *
	 * @param fileId - ID of the file
	 * @returns Promise resolving to array of signed URLs with TTL info
	 */
	getActiveSignedUrls(fileId: string): TaskEither<Array<{ url: string; ttl: number }>> {
		return TaskEither
			.tryCatch(
				() => this.prisma.signedUrl.findMany({
					where: {
						fileId,
						expiresAt: { gt: new Date() }
					}
				}),
				'Failed to get active signed URLs'
			)
			.map(urls => urls.map(urlRecord => ({
				url: urlRecord.url,
				ttl: Math.floor((urlRecord.expiresAt.getTime() - Date.now()) / 1000)
			})));
	}
	
	private checkUserQuota(userId: string, fileSize: number): TaskEither<void> {
		return this.getUserStorageUsage(userId)
			.chain(usage => {
				if (usage.totalSize + fileSize > this.USER_QUOTA) {
					return TaskEither.fail(createBadRequestError('User quota exceeded'));
				}
				return TaskEither.success(undefined);
			});
	}
	
	private validateFileType(mimeType: string): TaskEither<void> {
		if (!this.ALLOWED_TYPES.includes(mimeType)) {
			return TaskEither.fail(createBadRequestError(`File type ${mimeType} not allowed`));
		}
		return TaskEither.success(undefined);
	}
	
	private saveFileToDisk(file: Express.Multer.File): TaskEither<string> {
		const filename = `${randomUUID()}-${file.originalname}`;
		const filePath = path.join(this.uploadsPath, filename);
		
		return TaskEither
			.tryCatch(
				() => writeFile(filePath, file.buffer),
				'Failed to save file to disk'
			)
			.map(() => filePath);
	}
	
	private saveFileMetadata(
		file: Express.Multer.File,
		savedPath: string,
		uploaderId: string
	): TaskEither<FileModel> {
		return TaskEither.tryCatch(
			() => this.prisma.file.create({
				data: {
					filename: path.basename(savedPath),
					path: savedPath,
					mimeType: file.mimetype,
					size: file.size,
					uploaderId,
				},
			}),
			'Failed to save file metadata'
		);
	}
	
	private checkFileOwnership(file: FileModel, userId: string): TaskEither<FileModel> {
		if (file.uploaderId !== userId) {
			return TaskEither.fail(createUnauthorizedError('You do not have permission to delete this file'));
		}
		return TaskEither.success(file);
	}
	
	private deleteFileFromDisk(file: FileModel): TaskEither<FileModel> {
		return TaskEither
			.tryCatch(
				() => unlink(file.path),
				'Failed to delete file from disk'
			)
			.map(() => file);
	}
	
	private deleteFileMetadata(file: FileModel): TaskEither<FileModel> {
		return TaskEither
			.tryCatch(
				() => this.prisma.file.delete({
					where: { id: file.id },
				}),
				'Failed to delete file metadata'
			)
			.map(() => file);
	}
	
	private generateSignedUrl(file: FileModel, timestamp: number): string {
		// Simple signed URL generation - in production, use a proper signing mechanism
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
		return `${baseUrl}/api/files/${file.id}?t=${timestamp}`;
	}
	
	/**
	 * Cleanup job for expired signed URLs
	 * Runs every hour to remove expired URLs from the database
	 */
	private startCleanupJob(): void {
		setInterval(() => {
			void this.prisma.signedUrl.deleteMany({
				where: {
					expiresAt: { lt: new Date() }
				}
			});
		}, 60 * 60 * 1000); // Run every hour
	}
}