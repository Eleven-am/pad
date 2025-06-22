import { PrismaClient, User, UserRole } from '@/generated/prisma';
import { MediaService } from '@/services/mediaService';
import { TaskEither } from '@eleven-am/fp';

export interface UpdateUserInput {
	name?: string;
	bio?: string;
	website?: string;
	twitter?: string;
	linkedin?: string;
	github?: string;
}

interface UserStats {
	totalPosts: number;
	totalReads: number;
	totalLikes: number;
	joinedAt: Date;
	lastActiveAt: Date;
}

/**
 * Simple UserService for OAuth-only authentication
 * Works with Better Auth for Google & GitHub OAuth
 */
export class UserService {
	/**
	 * Creates a new UserService instance
	 *
	 * @param prisma - Prisma client for database operations
	 * @param mediaService - Media service for avatar uploads
	 */
	constructor (
		private prisma: PrismaClient,
		private mediaService: MediaService
	) {
	}
	
	/**
	 * Gets user by ID
	 *
	 * @param id - User ID
	 * @returns Promise resolving to User or null
	 */
	getUserById (id: string): TaskEither<User> {
		return TaskEither.tryCatch(
			() => this.prisma.user.findUnique({
				where: {id},
				include: {
					avatarFile: true,
				},
			}),
			'Failed to get user by ID'
		)
		.nonNullable('User not found');
	}
	
	/**
	 * Gets user by email
	 *
	 * @param email - User email
	 * @returns Promise resolving to User or null
	 */
	getUserByEmail (email: string): TaskEither<User> {
		return TaskEither.tryCatch(
			() => this.prisma.user.findUnique({
				where: {email},
				include: {
					avatarFile: true,
				},
			}),
			'Failed to get user by email'
		)
		.nonNullable('User not found');
	}
	
	/**
	 * Updates user profile information
	 *
	 * @param userId - ID of user to update
	 * @param data - Profile update data
	 * @returns Promise resolving to updated User
	 * @throws Error if user not found
	 */
	updateProfile (userId: string, data: UpdateUserInput): TaskEither<User> {
		return this.getUserById(userId)
			.fromPromise(() => this.prisma.user.update({
				where: {id: userId},
				data,
				include: {avatarFile: true},
			}));
	}
	
	/**
	 * Uploads and sets user avatar
	 *
	 * @param userId - ID of user
	 * @param file - Avatar image file
	 * @returns Promise resolving to updated User
	 * @throws Error if user not found or upload fails
	 */
	uploadAvatar (userId: string, file: File): TaskEither<User> {
		return this.getUserById(userId)
			.matchTask([
				{
					predicate: (user) => user.avatarFileId !== null,
					run: (user) => this.mediaService.deleteFile(user.avatarFileId!, userId)
						.map(() => user),
				},
				{
					predicate: (user) => user.avatarFileId === null,
					run: (user) => TaskEither.of(user)
				}
			])
			.chain(() => this.mediaService.uploadFile(file, userId))
			.fromPromise((uploadedFile) => this.prisma.user.update({
				where: {id: userId},
				data: {avatarFileId: uploadedFile.id},
				include: {avatarFile: true},
			}));
	}
	
	/**
	 * Removes user avatar
	 *
	 * @param userId - ID of user
	 * @returns Promise resolving to updated User
	 * @throws Error if user not found
	 */
	removeAvatar (userId: string): TaskEither<User> {
		return this.getUserById(userId)
			.matchTask([
				{
					predicate: (user) => user.avatarFileId !== null,
					run: (user) => this.mediaService.deleteFile(user.avatarFileId!, userId)
						.map(() => user),
				},
				{
					predicate: (user) => user.avatarFileId === null,
					run: (user) => TaskEither.of(user)
				}
			])
			.fromPromise(() => this.prisma.user.update({
				where: {id: userId},
				data: {avatarFileId: null},
				include: {avatarFile: true},
			}));
	}
	
	/**
	 * Updates user role (admin-only operation)
	 *
	 * @param userId - ID of user to update
	 * @param role - New role to assign
	 * @returns Promise resolving to updated User
	 * @throws Error if user not found
	 */
	updateUserRole (userId: string, role: UserRole): TaskEither<User> {
		return this.getUserById(userId)
			.fromPromise(() => this.prisma.user.update({
				where: {id: userId},
				data: {role},
			}));
	}
	
	/**
	 * Gets users by role
	 *
	 * @param role - Role to filter by
	 * @returns Promise resolving to array of Users
	 */
	getUsersByRole (role: UserRole): TaskEither<User[]> {
		return TaskEither.tryCatch(
			() => this.prisma.user.findMany({
				where: {role},
				include: {
					avatarFile: true,
				},
				orderBy: {createdAt: 'desc'},
			}),
			'Failed to get users by role'
		);
	}
	
	/**
	 * Gets basic user statistics
	 *
	 * @param userId - ID of user to get stats for
	 * @returns Promise resolving to user stats object
	 */
	getUserStats (userId: string): TaskEither<UserStats> {
		return TaskEither
			.fromBind({
				totalPosts: TaskEither.tryCatch(() => this.prisma.post.count({where: {authorId: userId}})),
				totalReads: TaskEither.tryCatch(() => this.prisma.postRead.count({where: {post: {authorId: userId}}})),
				totalLikes: TaskEither.tryCatch(() => this.prisma.postLike.count({where: {post: {authorId: userId}}})),
				joinedAt: this.getUserById(userId).map((user) => user.createdAt),
				lastActiveAt: this.getUserById(userId).map((user) => user.updatedAt),
			});
	}

	/**
	 * Permanently deletes a user and all associated data
	 * This includes posts, files, collaborations, etc.
	 * 
	 * @param userId - ID of user to delete
	 * @returns Promise resolving when deletion is complete
	 * @throws Error if user not found or deletion fails
	 */
	deleteUser(userId: string): TaskEither<void> {
		return this.getUserById(userId)
			.chain(() => TaskEither.tryCatch(
				() => this.prisma.$transaction(async (tx) => {
					// Get user's uploaded files for physical cleanup
					const userFiles = await tx.file.findMany({
						where: { uploaderId: userId },
						select: { id: true }
					});

					// Delete files using media service for proper cleanup
					// This handles physical file deletion from storage
					for (const file of userFiles) {
						await this.mediaService.deleteFile(file.id, userId).toPromise();
					}

					// Delete the user - cascade will handle most related records:
					// - Files (uploaderId cascade)
					// - Posts and all their blocks (authorId cascade) 
					// - PostReads, PostViews, PostLikes, PostBookmarks (userId cascade)
					// - PostCollaborator (userId cascade)
					// - Sessions, Accounts (userId cascade via Better Auth)
					// - API keys (userId cascade)
					await tx.user.delete({
						where: { id: userId }
					});
				}),
				'Failed to delete user account'
			))
			.map(() => undefined);
	}

}

