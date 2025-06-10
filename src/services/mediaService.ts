import { Redis } from 'ioredis';
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
 * Service for managing media files
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
	 * @param redis - Redis client for caching
	 * @param uploadsPath - Path to store uploaded files (default: './uploads')
	 * @param signedUrlTTL - TTL for signed URLs in seconds (default: 1 hour)
	 */
	constructor (
		private prisma: PrismaClient,
		private redis: Redis,
		private uploadsPath: string,
		private signedUrlTTL: number
	) {
		void mkdir (this.uploadsPath, {recursive: true});
	}
	
	/**
	 * Uploads a file to the server and stores metadata in the database
	 *
	 * @param file - Multer file object from file upload
	 * @param userId - ID of the user uploading the file
	 * @returns Promise resolving to the created File record
	 * @throws Error if file validation fails or upload fails
	 */
	uploadFile (file: File, userId: string): TaskEither<FileModel> {
		const fileExtension = path.extname(file.name);
		const uniqueFilename = `${randomUUID()}${fileExtension}`;
		const filePath = path.join(this.uploadsPath, uniqueFilename);

		return this.validateFile(file)
		    .fromPromise(() => file.arrayBuffer())
			.map((bytes) => new Uint8Array(bytes))
			.fromPromise((buffer) => writeFile(filePath, buffer))
			.fromPromise(() => this.prisma.file.create({data: {
				filename: uniqueFilename,
				path: filePath,
				mimeType: file.type,
				size: file.size,
				uploaderId: userId,
			}}));
	}
	
	/**
	 * Downloads a file from a remote URL and saves it to the server
	 *
	 * @param url - Remote URL to download the file from
	 * @param userId - ID of the user downloading the file
	 * @returns Promise resolving to the created File record
	 * @throws Error if download fails or URL is invalid
	 */
	downloadFromUrl (url: string, userId: string): TaskEither<FileModel> {
		return Http.create(url)
			.blob()
			.getTask()
			.map((blob) => new File([blob],
				this.generateNameForBlob(blob), {
				type: blob.type,
				lastModified: Date.now(),
			}))
			.chain((file) => this.uploadFile(file, userId));
	}
	
	/**
	 * Retrieves file metadata from the database
	 *
	 * @param fileId - ID of the file to retrieve
	 * @returns Promise resolving to File record or null if not found
	 */
	getFile (fileId: string): TaskEither<FileModel> {
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findUnique({where: {id: fileId}, include: {uploader: true}}),
				'Failed to get file'
			)
			.nonNullable('File not found');
	}
	
	/**
	 * Retrieves a file by its access token
	 * Validates the token and returns the file stream
	 *
	 * @param token - Base64 encoded access token
	 * @returns TaskEither resolving to a ReadableStream of the file content
	 */
	getFileByToken (token: string): TaskEither<{ file: FileModel; stream: NodeJS.ReadableStream }>  {
		return this.validateAccessToken(token)
			.toTaskEither()
			.chain((fileId) => this.getFileStream(fileId));
	}
	
	/**
	 * Validates a file's type and size
	 *
	 * @param file - File object to validate
	 * @returns TaskEither resolving to the validated File or an error
	 */
	validateFile (file: File): TaskEither<File> {
		return TaskEither
			.of(file)
			.filter(
				(file) => this.ALLOWED_TYPES.includes(file.type),
				() => createBadRequestError(`File type ${file.type} not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`)
			)
			.filter(
				(file) => file.size <= this.MAX_FILE_SIZE,
				() => createBadRequestError(`File size ${file.size} exceeds maximum allowed size ${this.MAX_FILE_SIZE}`)
			);
	}
	
	/**
	 * Checks if a user has enough storage quota for a new file
	 *
	 * @param userId - ID of the user to check quota for
	 * @param fileSize - Size of the new file in bytes
	 * @throws Error if adding the file would exceed user's quota
	 */
	checkUserStorageQuota (userId: string, fileSize: number): TaskEither<void> {
		return this.getStorageUsage(userId)
			.filter(
				(usage) => usage.totalSize + fileSize <= this.USER_QUOTA,
				(usage) => createBadRequestError(`Storage quota exceeded. Current: ${usage.totalSize}, Quota: ${this.USER_QUOTA}`)
			)
			.map(() => undefined);
	}
	
	/**
	 * gets storage usage statistics for a user or the entire system
	 *
	 * @param userId - Optional user ID to filter by uploader
	 * @returns Promise resolving to StorageUsage object
	 */
	getStorageUsage (userId?: string): TaskEither<StorageUsage> {
		const whereClause = userId ? {uploaderId: userId} : {};
	
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findMany({where: whereClause}),
				'Failed to get storage usage'
			)
			.map((files) => {
				const totalFiles = files.length;
				const totalSize = files.reduce((sum, file) => sum + file.size, 0);
				const sizeByType = files.reduce((acc, file) => {
					const type = file.mimeType.split('/')[0];
					acc[type] = (acc[type] || 0) + file.size;
					return acc;
				}, {} as Record<string, number>);

				return {
					totalFiles,
					totalSize,
					sizeByType,
				};
			});
	}
	
	/**
	 * Cleans up orphaned files that are not referenced by any blocks or posts
	 *
	 * @returns Promise resolving to an object with deleted count and freed space
	 */
	cleanupOrphanedFiles (): TaskEither<{ deletedCount: number; freedSpace: number }> {		
		return this.getUnusedFiles()
			.mapItems((f) => f.id)
			.chain((fileIds) => this.deleteMultipleFiles(fileIds));
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
	 * Tracks file access for analytics purposes
	 *
	 * @param fileId - ID of the file being accessed
	 * @param userId - Optional user ID accessing the file
	 */
	trackFileAccess (fileId: string, userId?: string): TaskEither<void> {
		const key = `file-access:${fileId}`;
		return TaskEither
			.tryCatch(
				() => this.redis.incr(key),
				'Failed to track file access'
			)
			.fromPromise(() =>  this.redis.hset(`file-last-access:${fileId}`, {
				timestamp: Date.now (),
				userId: userId || 'anonymous',
			}))
			.map(() => undefined);
	}
	
	/**
	 * Retrieves usage statistics for a specific file
	 *
	 * @param fileId - ID of the file to get usage stats for
	 * @returns Promise resolving to FileUsageStats object
	 * @throws Error if a file not found
	 */
	getFileUsageStats(fileId: string): TaskEither<FileUsageStats> {
		const totalAccess = TaskEither
			.tryCatch(
				() => this.redis.get(`file-access:${fileId}`),
				'Failed to get file access'
			)
			.map((totalAccess) => parseInt(totalAccess || '0'));

		const lastAccessed = TaskEither
			.tryCatch(
				() => this.redis.hgetall(`file-last-access:${fileId}`),
				'Failed to get file last access'
			)
			.map((lastAccessData) => lastAccessData.timestamp ? new Date(parseInt (lastAccessData.timestamp)) : null);

		const file = TaskEither
			.tryCatch(
				() => this.prisma.file.findUnique({
					where: {id: fileId},
					include: {
						tableBlocks: {select: {postId: true}},
						videoFiles: {select: {postId: true}},
						posterFiles: {select: {postId: true}},
						galleryImages: {include: {gallery: {select: {postId: true}}}},
						twitterImageFiles: {select: {postId: true}},
						postAudio: {select: {id: true}},
						userAvatars: {select: {id: true}},
						instagramFiles: {select: {blockId: true}},
					},
				}),
				'Failed to get file'
			)
			.nonNullable('File not found')
			.map((file) => {
				const postIds = new Set<string>();
				file.tableBlocks?.forEach(block => postIds.add(block.postId));
				file.videoFiles?.forEach(block => postIds.add(block.postId));
				file.posterFiles?.forEach(block => postIds.add(block.postId));
				file.galleryImages?.forEach(img => postIds.add(img.gallery.postId));
				file.twitterImageFiles?.forEach(block => postIds.add(block.postId));
				file.instagramFiles?.forEach(file => postIds.add(file.blockId));
				file.postAudio?.forEach(audio => postIds.add(audio.id));
				file.userAvatars?.forEach(avatar => postIds.add(avatar.id));

				const usedInBlocks: string[] = [];
				if (file.tableBlocks?.length) usedInBlocks.push('table');
				if (file.videoFiles?.length) usedInBlocks.push('video');
				if (file.posterFiles?.length) usedInBlocks.push('poster');
				if (file.galleryImages?.length) usedInBlocks.push('gallery');
				if (file.twitterImageFiles?.length) usedInBlocks.push('twitter');
				if (file.instagramFiles?.length) usedInBlocks.push('instagram');
				if (file.postAudio?.length) usedInBlocks.push('audio');
				if (file.userAvatars?.length) usedInBlocks.push('avatar');

				return {
					usedInBlocks,
					usedInPosts: postIds.size,
				};
			});

		return TaskEither
			.fromBind({
				totalAccess: totalAccess,
				lastAccessed: lastAccessed,
				file: file,
			})
			.map(({totalAccess, lastAccessed, file}) => ({
				totalAccess,
				lastAccessed,
				usedInPosts: file.usedInPosts,
				usedInBlocks: file.usedInBlocks,
			}));
	}
	
	/**
	 * Generates a signed public URL for file access with Redis caching
	 * Supports multiple signed URLs per file with different expiry times
	 *
	 * @param fileId - ID of the file to generate URL for
	 * @param expiry - Optional custom expiry time in seconds
	 * @returns Promise resolving to signed URL string
	 * @throws Error if file not found
	 */
	getPublicUrl (fileId: string, expiry?: number): TaskEither<string> {
		const ttl = expiry || this.signedUrlTTL;
		
		const timestamp = Date.now();
		const cacheKey = `signed-url:${fileId}:${timestamp}`;
		
		return this.getFile(fileId)
			.fromPromise(async (file) => {
				const signedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/files?token=${this.generateAccessToken(file.id, ttl, timestamp)}`;
				await this.redis.setex(cacheKey, ttl, signedUrl);
				return signedUrl;
			});
	}
	
	/**
	 * Deletes all cached signed URLs for a specific file
	 * Useful when a file is deleted or needs cache invalidation
	 *
	 * @param fileId - ID of the file to clear URLs for
	 */
	clearSignedUrls (fileId: string): TaskEither<void> {
		return TaskEither
			.tryCatch(
				() => this.redis.keys(`signed-url:${fileId}:*`),
				() => createNotFoundError('File not found')
			)
			.chainItems((key) => TaskEither.tryCatch(() => this.redis.del(key)))
			.map(() => undefined);
	}
	
	/**
	 * Gets all cached signed URLs for a file (useful for debugging/monitoring)
	 *
	 * @param fileId - ID of the file to get URLs for
	 * @returns Promise resolving to array of cached URL info
	 */
	getCachedSignedUrls (fileId: string): TaskEither<Array<{ timestamp: number; url: string; ttl: number }>> {
		const keyDetails = (key: string) => {
			const timestamp = parseInt(key.split(':')[2]);
			return TaskEither
				.fromBind({
					url: TaskEither.tryCatch(() => this.redis.get(key)).nonNullable('URL not found'),
					ttl: TaskEither.tryCatch(() => this.redis.ttl(key)),
					timestamp: TaskEither.of(timestamp)
				});
		}

		return TaskEither
			.tryCatch(
				() => this.redis.keys(`signed-url:${fileId}:*`),
				() => createNotFoundError('File not found')
			)
			.chainItems((key) => keyDetails(key))
	}
	
	/**
	 * Deletes a file from both filesystem and database
	 * Only allows users to delete their own files
	 * Now properly clears all signed URLs for the file
	 *
	 * @param fileId - ID of the file to delete
	 * @param userId - ID of the user requesting deletion
	 * @throws Error if file not found or user doesn't have permission
	 */
	deleteFile (fileId: string, userId: string): TaskEither<FileModel> {
		return TaskEither
			.tryCatch(
				() => this.prisma.file.findFirst({
					where: {id: fileId, uploaderId: userId},
				}),
				() => createNotFoundError('File not found or access denied')
			)
			.nonNullable('File not found or access denied')
			.fromPromise(async (file) => {
				await access(file.path, constants.F_OK);
				await unlink(file.path);
				await this.clearSignedUrls(fileId);
				
				return this.prisma.file.delete({where: {id: fileId}});
			});
	}
	
	/**
	 * Validates an access token for file access
	 *
	 * @param token - Base64 encoded access token
	 * @returns Object with validation result and file ID if valid
	 */
	validateAccessToken (token: string): Either<string> {
		const schema = z.object({
			fileId: z.string(),
			exp: z.number(),
			iat: z.number()
		});
		
		return Either
			.tryCatch(() => JSON.parse(Buffer.from(token, 'base64').toString()))
			.parseSchema(schema)
			.filter(
				(payload) => Date.now() <= payload.exp,
				() => createUnauthorizedError('Access token has expired')
			)
			.map((value) => value.fileId);
	}
	
	/**
	 * Gets the file buffer for a specific file ID
	 * Useful for serving file content directly
	 *
	 * @param fileId - ID of the file to retrieve
	 * @returns TaskEither resolving to Buffer containing file data
	 */
	getFileBuffer(fileId: string): TaskEither<{ file: FileModel; buffer: Buffer }> {
		return this.getFile(fileId)
			.chain((file) => TaskEither
				.tryCatch(() => readFile(file.path))
				.map((buffer) => ({
					file: file,
					buffer: buffer
				})));
	}
	
	/**
	 * Gets a readable stream for a specific file ID
	 * Useful for streaming file content directly
	 *
	 * @param fileId - ID of the file to retrieve
	 * @returns TaskEither resolving to a ReadableStream of the file content
	 */
	getFileStream(fileId: string): TaskEither<{ file: FileModel; stream: NodeJS.ReadableStream }> {
		return this.getFile(fileId)
			.fromPromise((file) => {
				return new Promise<{ file: FileModel; stream: NodeJS.ReadableStream }>((resolve, reject) => {
					const stream = createReadStream(file.path);
					stream.on('error', reject);
					stream.on('open', () => resolve({
						file: file,
						stream: stream
					}));
				});
			});
	}
	
	/**
	 * Generates an access token for file URLs with expiry timestamp
	 *
	 * @private
	 * @param fileId - ID of the file
	 * @param expiry - Expiry time in seconds
	 * @param issuedAt - Timestamp when token was issued
	 * @returns Base64 encoded access token with embedded expiry
	 */
	private generateAccessToken (fileId: string, expiry: number, issuedAt: number): string {
		const expiryTimestamp = issuedAt + (expiry * 1000);
		const payload = {
			fileId,
			exp: expiryTimestamp,
			iat: issuedAt
		};
		return Buffer.from (JSON.stringify(payload)).toString ('base64');
	}
	
	/**
	 * Generates a unique name for a Blob file based on its type
	 * This is used to ensure files have a consistent naming scheme
	 * @param file - Blob object to generate name for
	 * @private
	 */
	private generateNameForBlob (file: Blob): string {
		const extension = file.type.split('/')[1] || 'bin';
		return `${randomUUID()}.${extension}`;
	}
}
