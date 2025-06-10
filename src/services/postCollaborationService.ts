import { PrismaClient, PostCollaborator, PostRevision, CollaboratorRole, CollaborationStatus, RevisionType } from '@/generated/prisma';
import { BaseService } from './baseService';
import { TaskEither, createNotFoundError, createUnauthorizedError, createBadRequestError } from '@eleven-am/fp';

export interface CreateCollaboratorInput {
    postId: string;
    email: string;
    role: CollaboratorRole;
    inviterUserId: string;
}

export interface CreateRevisionInput {
    postId: string;
    userId: string;
    revisionType: RevisionType;
    summary: string;
    blocksAdded: number;
    blocksModified: number;
    blocksRemoved: number;
    isAutoSave?: boolean;
}

export interface CollaboratorWithUser extends PostCollaborator {
    user: {
        id: string;
        name: string | null;
        email: string;
        avatarFile: {
            id: string;
            path: string;
        } | null;
    };
}

export interface RevisionWithUser extends PostRevision {
    user: {
        id: string;
        name: string | null;
        avatarFile: {
            id: string;
            path: string;
        } | null;
    };
}

export class PostCollaborationService extends BaseService {
    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Invite a user to collaborate on a post
     */
    inviteCollaborator(input: CreateCollaboratorInput): TaskEither<PostCollaborator> {
        return this.checkCollaborationPermission(input.postId, input.inviterUserId, 'INVITE')
            .chain(canInvite => {
                if (!canInvite) {
                    return TaskEither.error(createUnauthorizedError('Cannot invite collaborators'));
                }
                
                return TaskEither.tryCatch(
                    () => this.prisma.user.findUnique({
                        where: { email: input.email }
                    }),
                    'Failed to find user by email'
                );
            })
            .nonNullable('User not found with this email')
            .chain(user => {
                // Check if user is already a collaborator
                return TaskEither.tryCatch(
                    () => this.prisma.postCollaborator.findUnique({
                        where: {
                            postId_userId: {
                                postId: input.postId,
                                userId: user.id
                            }
                        }
                    }),
                    'Failed to check existing collaboration'
                )
                .chain(existingCollaborator => {
                    if (existingCollaborator) {
                        return TaskEither.error(createBadRequestError('User is already a collaborator on this post'));
                    }
                    
                    // Check if user is the post owner
                    return TaskEither.tryCatch(
                        () => this.prisma.post.findUnique({
                            where: { id: input.postId },
                            select: { authorId: true }
                        }),
                        'Failed to check post ownership'
                    )
                    .nonNullable('Post not found')
                    .chain(post => {
                        if (post.authorId === user.id) {
                            return TaskEither.error(createBadRequestError('Post owner cannot be added as collaborator'));
                        }
                        
                        // Create collaboration invite
                        return TaskEither.tryCatch(
                            () => this.prisma.postCollaborator.create({
                                data: {
                                    postId: input.postId,
                                    userId: user.id,
                                    role: input.role,
                                    invitedBy: input.inviterUserId,
                                    status: CollaborationStatus.PENDING
                                }
                            }),
                            'Failed to create collaboration invite'
                        );
                    });
                });
            });
    }

    /**
     * Accept a collaboration invitation
     */
    acceptCollaboration(postId: string, userId: string): TaskEither<PostCollaborator> {
        return TaskEither.tryCatch(
            () => this.prisma.postCollaborator.findUnique({
                where: {
                    postId_userId: { postId, userId }
                }
            }),
            'Failed to find collaboration invitation'
        )
        .nonNullable('Collaboration invitation not found')
        .chain(collaboration => {
            if (collaboration.status !== CollaborationStatus.PENDING) {
                return TaskEither.error(createBadRequestError('Collaboration invitation is no longer pending'));
            }

            return TaskEither.tryCatch(
                () => this.prisma.postCollaborator.update({
                    where: {
                        postId_userId: { postId, userId }
                    },
                    data: {
                        status: CollaborationStatus.ACTIVE,
                        joinedAt: new Date()
                    }
                }),
                'Failed to accept collaboration'
            );
        });
    }

    /**
     * Decline a collaboration invitation
     */
    declineCollaboration(postId: string, userId: string): TaskEither<PostCollaborator> {
        return TaskEither.tryCatch(
            () => this.prisma.postCollaborator.findUnique({
                where: {
                    postId_userId: { postId, userId }
                }
            }),
            'Failed to find collaboration invitation'
        )
        .nonNullable('Collaboration invitation not found')
        .chain(collaboration => {
            if (collaboration.status !== CollaborationStatus.PENDING) {
                return TaskEither.error(createBadRequestError('Collaboration invitation is no longer pending'));
            }

            return TaskEither.tryCatch(
                () => this.prisma.postCollaborator.update({
                    where: {
                        postId_userId: { postId, userId }
                    },
                    data: {
                        status: CollaborationStatus.DECLINED
                    }
                }),
                'Failed to decline collaboration'
            );
        });
    }

    /**
     * Update collaborator role (only by post owner or high-level collaborators)
     */
    updateCollaboratorRole(
        postId: string, 
        collaboratorUserId: string, 
        newRole: CollaboratorRole, 
        updaterUserId: string
    ): TaskEither<PostCollaborator> {
        return this.checkCollaborationPermission(postId, updaterUserId, 'INVITE')
            .chain(canManage => {
                if (!canManage) {
                    return TaskEither.error(createUnauthorizedError('Cannot update collaborator roles'));
                }

                return TaskEither.tryCatch(
                    () => this.prisma.postCollaborator.update({
                        where: {
                            postId_userId: {
                                postId,
                                userId: collaboratorUserId
                            }
                        },
                        data: { role: newRole }
                    }),
                    'Failed to update collaborator role'
                );
            });
    }

    /**
     * Create a post revision entry
     */
    createRevision(input: CreateRevisionInput): TaskEither<PostRevision> {
        return this.checkCollaborationPermission(input.postId, input.userId, 'EDIT')
            .chain(canEdit => {
                if (!canEdit) {
                    return TaskEither.error(createUnauthorizedError('Cannot create revisions'));
                }

                return TaskEither.tryCatch(
                    () => this.prisma.postRevision.create({
                        data: {
                            postId: input.postId,
                            userId: input.userId,
                            revisionType: input.revisionType,
                            summary: input.summary,
                            blocksChanged: input.blocksModified,
                            blocksAdded: input.blocksAdded,
                            blocksRemoved: input.blocksRemoved
                        }
                    }),
                    'Failed to create revision'
                );
            });
    }

    /**
     * Get all active collaborators for a post
     */
    getPostCollaborators(postId: string): TaskEither<CollaboratorWithUser[]> {
        return TaskEither.tryCatch(
            () => this.prisma.postCollaborator.findMany({
                where: { 
                    postId, 
                    status: CollaborationStatus.ACTIVE 
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarFile: {
                                select: {
                                    id: true,
                                    path: true
                                }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'asc' }
            }),
            'Failed to get collaborators'
        );
    }

    /**
     * Get post activity/revision history
     */
    getPostActivity(postId: string, limit: number = 50): TaskEither<RevisionWithUser[]> {
        return TaskEither.tryCatch(
            () => this.prisma.postRevision.findMany({
                where: { postId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarFile: {
                                select: {
                                    id: true,
                                    path: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            'Failed to get post activity'
        );
    }

    /**
     * Get pending collaboration invitations for a user
     */
    getPendingInvitations(userId: string): TaskEither<CollaboratorWithUser[]> {
        return TaskEither.tryCatch(
            () => this.prisma.postCollaborator.findMany({
                where: {
                    userId,
                    status: CollaborationStatus.PENDING
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarFile: {
                                select: {
                                    id: true,
                                    path: true
                                }
                            }
                        }
                    },
                    post: {
                        select: {
                            id: true,
                            title: true,
                            slug: true
                        }
                    },
                    inviter: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { invitedAt: 'desc' }
            }),
            'Failed to get pending invitations'
        );
    }

    /**
     * Check if user has specific permission on a post
     */
    private checkCollaborationPermission(
        postId: string,
        userId: string,
        action: 'READ' | 'EDIT' | 'INVITE' | 'PUBLISH'
    ): TaskEither<boolean> {
        return TaskEither.tryCatch(
            () => this.prisma.post.findUnique({
                where: { id: postId },
                include: {
                    collaborators: {
                        where: { 
                            userId, 
                            status: CollaborationStatus.ACTIVE 
                        }
                    }
                }
            }),
            'Failed to check post permissions'
        )
        .nonNullable('Post not found')
        .map(post => {
            // Post owner has all permissions
            if (post.authorId === userId) {
                return true;
            }

            const collaboration = post.collaborators[0];
            if (!collaboration) {
                return false;
            }

            switch (action) {
                case 'READ':
                    return true; // All collaborators can read
                case 'EDIT':
                    return collaboration.role !== CollaboratorRole.REVIEWER;
                case 'INVITE':
                    return collaboration.role === CollaboratorRole.CONTRIBUTOR; // High-level collaborators can invite
                case 'PUBLISH':
                    return collaboration.role === CollaboratorRole.CONTRIBUTOR || post.authorId === userId;
                default:
                    return false;
            }
        });
    }

    /**
     * Check if user can edit a specific post (convenience method)
     */
    canUserEditPost(postId: string, userId: string): TaskEither<boolean> {
        return this.checkCollaborationPermission(postId, userId, 'EDIT');
    }

    /**
     * Get collaboration summary for a post
     */
    getCollaborationSummary(postId: string): TaskEither<{
        totalCollaborators: number;
        totalRevisions: number;
        lastActivity: Date | null;
        mostActiveCollaborator: string | null;
    }> {
        return TaskEither.tryCatch(
            () => Promise.all([
                this.prisma.postCollaborator.count({
                    where: { 
                        postId, 
                        status: CollaborationStatus.ACTIVE 
                    }
                }),
                this.prisma.postRevision.findMany({
                    where: { postId },
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                })
            ]),
            'Failed to get collaboration summary'
        )
        .map(([collaborators, revisions]) => {
            const lastActivity = revisions.length > 0 ? revisions[0].createdAt : null;
            
            // Find most active collaborator by revision count
            const userRevisionCounts: Record<string, { name: string; count: number }> = {};
            revisions.forEach(revision => {
                const userName = revision.user.name || 'Unknown';
                if (!userRevisionCounts[userName]) {
                    userRevisionCounts[userName] = { name: userName, count: 0 };
                }
                userRevisionCounts[userName].count++;
            });

            const mostActive = Object.values(userRevisionCounts)
                .sort((a, b) => b.count - a.count)[0];

            return {
                totalCollaborators: collaborators,
                totalRevisions: revisions.length,
                lastActivity,
                mostActiveCollaborator: mostActive?.name || null
            };
        });
    }

    /**
     * Get user's collaborative posts (posts where they are collaborators)
     */
    getUserCollaborativePosts(userId: string): TaskEither<Array<{
        id: string;
        role: CollaboratorRole;
        joinedAt: Date | null;
        post: {
            id: string;
            title: string;
            slug: string;
            published: boolean;
            updatedAt: Date;
            author: {
                name: string | null;
                email: string;
            };
        };
    }>> {
        return TaskEither.tryCatch(
            () => this.prisma.postCollaborator.findMany({
                where: {
                    userId,
                    status: CollaborationStatus.ACTIVE
                },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            published: true,
                            updatedAt: true,
                            author: {
                                select: {
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { joinedAt: 'desc' }
            }),
            'Failed to get user collaborative posts'
        );
    }
}