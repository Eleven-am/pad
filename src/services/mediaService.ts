import * as path from 'path';
import { randomUUID, createHmac } from 'crypto';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { File as FileModel, PrismaClient } from '@/generated/prisma';
import {TaskEither, createUnauthorizedError, createBadRequestError, Http} from '@eleven-am/fp';

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
	 * @param file - File object from FormData
	 * @param uploaderId - ID of the user uploading the file
	 * @returns Promise resolving to saved FileModel
	 * @throws Error if file type is not allowed or quota exceeded
	 */
	uploadFile (file: File, uploaderId: string): TaskEither<FileModel> {
		return this.checkUserQuota(uploaderId, file.size)
			.filter(
				() => this.ALLOWED_TYPES.includes(file.type),
				() => createBadRequestError('File type not allowed')
			)
			.filter(
				() => file.size <= this.MAX_FILE_SIZE,
				() => createBadRequestError('File size exceeds maximum limit')
			)
			.chain(() => this.saveFileToDisk(file))
			.chain(savedPath => this.saveFileMetadata(file, savedPath, uploaderId));
	}
	
	/**
	 * Downloads a file from a URL and uploads it
	 *
	 * @param url - URL to download from
	 * @param userId - ID of the user downloading the file
	 * @returns Promise resolving to saved FileModel
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
	 * Gets file content as a buffer along with metadata
	 *
	 * @param fileId - ID of the file to retrieve
	 * @returns Promise resolving to file metadata and buffer
	 * @throws Error if file not found or cannot read file
	 */
	getFileBuffer(fileId: string): TaskEither<{ file: FileModel; buffer: Buffer }> {
		return this.getFile(fileId)
			.chain(file => 
				TaskEither.tryCatch(
					() => readFile(file.path),
					'Failed to read file'
				)
				.map(buffer => ({ file, buffer }))
			);
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
			.filter(
				(file) => file.uploaderId === userId,
				() => createUnauthorizedError('You do not have permission to delete this file')
			)
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
					return TaskEither.of(existingUrl.url);
				}
				
				// Generate new signed URL
				return this.getFile(fileId)
					.map(file => {
						const expiryTimestamp = expiresAt.getTime();
						const signedUrl = this.generateSignedUrl(file, expiryTimestamp);
						
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
			)
			.nonNullable('File access stats not found');

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
			.fromBind({
				accessStats: getAccessStats,
				fileInfo: getUsageInfo,
			})
			.map(({ accessStats, fileInfo }) => {
				const usedInPosts = fileInfo.tableBlocks.length +
					fileInfo.videoFiles.length +
					fileInfo.posterFiles.length +
					fileInfo.galleryImages.length +
					fileInfo.twitterImageFiles.length +
					fileInfo.instagramFiles.length +
					fileInfo.postAudio.length;

				return {
					totalAccess: accessStats.totalAccess,
					lastAccessed: accessStats.lastAccessedAt,
					usedInPosts,
					usedInBlocks: [
						...fileInfo.tableBlocks.map(block => block.id),
						...fileInfo.videoFiles.map(video => video.id),
						...fileInfo.posterFiles.map(poster => poster.id),
						...fileInfo.galleryImages.map(image => image.id),
						...fileInfo.twitterImageFiles.map(twitterImage => twitterImage.id),
						...fileInfo.instagramFiles.map(instagramFile => instagramFile.id),
						...fileInfo.postAudio.map(audio => audio.id),
					],
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
			.filter(
				usage => usage.totalSize + fileSize <= this.USER_QUOTA,
				() => createBadRequestError('User quota exceeded')
			)
			.map(() => undefined);
	}

	private saveFileToDisk(file: File): TaskEither<string> {
		const filename = `${randomUUID()}-${file.name}`;
		const filePath = path.join(this.uploadsPath, filename);
		
		return TaskEither
			.tryCatch(
				async () => {
					const arrayBuffer = await file.arrayBuffer();
					const buffer = new Uint8Array(arrayBuffer);
					await writeFile(filePath, buffer);
				},
				'Failed to save file to disk'
			)
			.map(() => filePath);
	}
	
	private saveFileMetadata(
		file: File,
		savedPath: string,
		uploaderId: string
	): TaskEither<FileModel> {
		return TaskEither.tryCatch(
			() => this.prisma.file.create({
				data: {
					filename: path.basename(savedPath),
					path: savedPath,
					mimeType: file.type,
					size: file.size,
					uploaderId,
				},
			}),
			'Failed to save file metadata'
		);
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
		// Generate secure token with embedded fileId and expiry
		const secret = process.env.FILE_ACCESS_SECRET || 'default-secret-change-in-production';
		const token = this.generateSecureToken(file.id, timestamp, secret);
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
		return `${baseUrl}/api/files/${file.id}?token=${token}`;
	}
	
	/**
	 * Generates a cryptographically secure token for file access
	 */
	private generateSecureToken(fileId: string, expiresAt: number, secret: string): string {
		// Create payload with fileId and expiry
		const payload = `${fileId}:${expiresAt}`;
		
		// Generate HMAC signature
		const hmac = createHmac('sha256', secret);
		hmac.update(payload);
		const signature = hmac.digest('hex');
		
		// Encode payload and signature as base64url
		const encodedPayload = Buffer.from(payload).toString('base64url');
		const token = `${encodedPayload}.${signature}`;
		
		return token;
	}
	
	/**
	 * Validates a secure token and returns the fileId if valid
	 */
	static validateSecureToken(token: string, secret: string): { valid: boolean; fileId?: string; expired?: boolean } {
		try {
			const [encodedPayload, signature] = token.split('.');
			if (!encodedPayload || !signature) {
				return { valid: false };
			}
			
			// Decode payload
			const payload = Buffer.from(encodedPayload, 'base64url').toString();
			const [fileId, expiresAtStr] = payload.split(':');
			const expiresAt = parseInt(expiresAtStr, 10);
			
			// Verify signature
			const hmac = createHmac('sha256', secret);
			hmac.update(payload);
			const expectedSignature = hmac.digest('hex');
			
			if (signature !== expectedSignature) {
				return { valid: false };
			}
			
			// Check expiry
			if (Date.now() > expiresAt) {
				return { valid: false, expired: true };
			}
			
			return { valid: true, fileId };
		} catch {
			return { valid: false };
		}
	}
	
	/**
	 * Generates a filename for a blob based on its type
	 */
	private generateNameForBlob(blob: Blob): string {
		const extension = blob.type.split('/')[1] || 'bin';
		return `download-${randomUUID()}.${extension}`;
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