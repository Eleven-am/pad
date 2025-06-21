import {
	CollaborationStatus,
	CollaboratorRole,
	EmailInvitation,
	InvitationStatus,
	PostCollaborator,
	PostRevision,
	PrismaClient,
	RevisionType
} from '@/generated/prisma';
import {BaseService} from './baseService';
import {createBadRequestError, createUnauthorizedError, TaskEither} from '@eleven-am/fp';
import {CollaborationInviteEmailData, EmailService} from './emailService';
import {randomBytes} from "node:crypto";

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
	constructor (prisma: PrismaClient, private emailService: EmailService) {
		super (prisma);
	}
	
	/**
	 * Invite a user to collaborate on a post (supports both registered and unregistered users)
	 */
	inviteCollaborator (input: CreateCollaboratorInput): TaskEither<PostCollaborator | EmailInvitation> {
		return this.checkCollaborationPermission (input.postId, input.inviterUserId, 'INVITE')
			.filter(
				(canInvite) => canInvite,
				() => createUnauthorizedError ('Cannot invite collaborators')
			)
			.fromPromise(() => this.prisma.user.findUnique ({
				where: {email: input.email}
			}))
			.matchTask<PostCollaborator | EmailInvitation>([
				{
					predicate: (user) => !!user,
					run: (user) => this.createDirectCollaboration (user!, input),
				},
				{
					predicate: () => true,
					run: () => this.createEmailInvitation (input)
				}
			])
	}
	
	/**
	 * Accept a collaboration invitation
	 */
	acceptCollaboration (postId: string, userId: string): TaskEither<PostCollaborator> {
		return TaskEither.tryCatch (
			() => this.prisma.postCollaborator.findUnique ({
				where: {
					postId_userId: {postId, userId}
				}
			}),
			'Failed to find collaboration invitation'
		)
			.nonNullable ('Collaboration invitation not found')
			.chain (collaboration => {
				if (collaboration.status !== CollaborationStatus.PENDING) {
					return TaskEither.error (createBadRequestError ('Collaboration invitation is no longer pending'));
				}
				
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.update ({
						where: {
							postId_userId: {postId, userId}
						},
						data: {
							status: CollaborationStatus.ACTIVE,
							joinedAt: new Date ()
						}
					}),
					'Failed to accept collaboration'
				);
			});
	}
	
	/**
	 * Decline a collaboration invitation
	 */
	declineCollaboration (postId: string, userId: string): TaskEither<PostCollaborator> {
		return TaskEither.tryCatch (
			() => this.prisma.postCollaborator.findUnique ({
				where: {
					postId_userId: {postId, userId}
				}
			}),
			'Failed to find collaboration invitation'
		)
			.nonNullable ('Collaboration invitation not found')
			.chain (collaboration => {
				if (collaboration.status !== CollaborationStatus.PENDING) {
					return TaskEither.error (createBadRequestError ('Collaboration invitation is no longer pending'));
				}
				
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.update ({
						where: {
							postId_userId: {postId, userId}
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
	updateCollaboratorRole (
		postId: string,
		collaboratorUserId: string,
		newRole: CollaboratorRole,
		updaterUserId: string
	): TaskEither<PostCollaborator> {
		return this.checkCollaborationPermission (postId, updaterUserId, 'INVITE')
			.chain (canManage => {
				if ( ! canManage) {
					return TaskEither.error (createUnauthorizedError ('Cannot update collaborator roles'));
				}
				
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.update ({
						where: {
							postId_userId: {
								postId,
								userId: collaboratorUserId
							}
						},
						data: {role: newRole}
					}),
					'Failed to update collaborator role'
				);
			});
	}
	
	/**
	 * Create a post revision entry
	 */
	createRevision (input: CreateRevisionInput): TaskEither<PostRevision> {
		return this.checkCollaborationPermission (input.postId, input.userId, 'EDIT')
			.chain (canEdit => {
				if ( ! canEdit) {
					return TaskEither.error (createUnauthorizedError ('Cannot create revisions'));
				}
				
				return TaskEither.tryCatch (
					() => this.prisma.postRevision.create ({
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
	getPostCollaborators (postId: string): TaskEither<CollaboratorWithUser[]> {
		return TaskEither.tryCatch (
			() => this.prisma.postCollaborator.findMany ({
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
				orderBy: {joinedAt: 'asc'}
			}),
			'Failed to get collaborators'
		);
	}
	
	/**
	 * Get post activity/revision history
	 */
	getPostActivity (postId: string, limit: number = 50): TaskEither<RevisionWithUser[]> {
		return TaskEither.tryCatch (
			() => this.prisma.postRevision.findMany ({
				where: {postId},
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
				orderBy: {createdAt: 'desc'},
				take: limit
			}),
			'Failed to get post activity'
		);
	}
	
	/**
	 * Get pending collaboration invitations for a user
	 */
	getPendingInvitations (userId: string): TaskEither<CollaboratorWithUser[]> {
		return TaskEither.tryCatch (
			() => this.prisma.postCollaborator.findMany ({
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
				orderBy: {invitedAt: 'desc'}
			}),
			'Failed to get pending invitations'
		);
	}
	
	/**
	 * Check if user can edit a specific post (convenience method)
	 */
	canUserEditPost (postId: string, userId: string): TaskEither<boolean> {
		return this.checkCollaborationPermission (postId, userId, 'EDIT');
	}
	
	/**
	 * Get collaboration summary for a post
	 */
	getCollaborationSummary (postId: string): TaskEither<{
		totalCollaborators: number;
		totalRevisions: number;
		lastActivity: Date | null;
		mostActiveCollaborator: string | null;
	}> {
		return TaskEither.tryCatch (
			() => Promise.all ([
				this.prisma.postCollaborator.count ({
					where: {
						postId,
						status: CollaborationStatus.ACTIVE
					}
				}),
				this.prisma.postRevision.findMany ({
					where: {postId},
					include: {
						user: {
							select: {
								name: true
							}
						}
					},
					orderBy: {createdAt: 'desc'}
				})
			]),
			'Failed to get collaboration summary'
		)
			.map (([collaborators, revisions]) => {
				const lastActivity = revisions.length > 0 ? revisions[0].createdAt : null;
				
				// Find most active collaborator by revision count
				const userRevisionCounts: Record<string, { name: string; count: number }> = {};
				revisions.forEach (revision => {
					const userName = revision.user.name || 'Unknown';
					if ( ! userRevisionCounts[userName]) {
						userRevisionCounts[userName] = {name: userName, count: 0};
					}
					userRevisionCounts[userName].count ++;
				});
				
				const mostActive = Object.values (userRevisionCounts)
					.sort ((a, b) => b.count - a.count)[0];
				
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
	getUserCollaborativePosts (userId: string): TaskEither<Array<{
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
		return TaskEither.tryCatch (
			() => this.prisma.postCollaborator.findMany ({
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
				orderBy: {joinedAt: 'desc'}
			}),
			'Failed to get user collaborative posts'
		);
	}
	
	/**
	 * Promote a collaborator to co-author
	 */
	promoteToCoAuthor (postId: string, collaboratorUserId: string, updaterUserId: string): TaskEither<PostCollaborator> {
		return this.checkCollaborationPermission (postId, updaterUserId, 'INVITE')
			.chain (canManage => {
				if ( ! canManage) {
					return TaskEither.error (createUnauthorizedError ('Cannot promote collaborators'));
				}
				
				// Check if the collaborator exists and is active
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.findUnique ({
						where: {
							postId_userId: {
								postId,
								userId: collaboratorUserId
							}
						}
					}),
					'Failed to find collaborator'
				)
					.nonNullable ('Collaborator not found')
					.chain (collaborator => {
						if (collaborator.status !== CollaborationStatus.ACTIVE) {
							return TaskEither.error (createBadRequestError ('Collaborator is not active'));
						}
						
						if (collaborator.role === CollaboratorRole.OWNER) {
							return TaskEither.error (createBadRequestError ('Cannot change owner role'));
						}
						
						// Promote to co-author
						return TaskEither.tryCatch (
							() => this.prisma.postCollaborator.update ({
								where: {
									postId_userId: {
										postId,
										userId: collaboratorUserId
									}
								},
								data: {role: CollaboratorRole.CO_AUTHOR}
							}),
							'Failed to promote to co-author'
						);
					});
			});
	}
	
	/**
	 * Demote a co-author to contributor
	 */
	demoteFromCoAuthor (postId: string, coAuthorUserId: string, updaterUserId: string): TaskEither<PostCollaborator> {
		return this.checkCollaborationPermission (postId, updaterUserId, 'INVITE')
			.chain (canManage => {
				if ( ! canManage) {
					return TaskEither.error (createUnauthorizedError ('Cannot demote co-authors'));
				}
				
				// Check if the user is currently a co-author
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.findUnique ({
						where: {
							postId_userId: {
								postId,
								userId: coAuthorUserId
							}
						}
					}),
					'Failed to find co-author'
				)
					.nonNullable ('Co-author not found')
					.chain (collaborator => {
						if (collaborator.role !== CollaboratorRole.CO_AUTHOR) {
							return TaskEither.error (createBadRequestError ('User is not a co-author'));
						}
						
						// Demote to contributor
						return TaskEither.tryCatch (
							() => this.prisma.postCollaborator.update ({
								where: {
									postId_userId: {
										postId,
										userId: coAuthorUserId
									}
								},
								data: {role: CollaboratorRole.CONTRIBUTOR}
							}),
							'Failed to demote from co-author'
						);
					});
			});
	}
	
	/**
	 * Get all authors (owner + co-authors) for a post
	 */
	getPostAuthors (postId: string): TaskEither<{
		owner: {
			id: string;
			name: string | null;
			email: string;
			avatarFile: { id: string; path: string } | null;
		};
		coAuthors: Array<{
			id: string;
			name: string | null;
			email: string;
			avatarFile: { id: string; path: string } | null;
			joinedAt: Date | null;
		}>;
	}> {
		return TaskEither.tryCatch (
			() => Promise.all ([
				// Get post owner
				this.prisma.post.findUnique ({
					where: {id: postId},
					select: {
						author: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
								avatarFile: {
									select: {
										id: true,
										path: true
									}
								}
							}
						}
					}
				}),
				// Get co-authors
				this.prisma.postCollaborator.findMany ({
					where: {
						postId,
						role: CollaboratorRole.CO_AUTHOR,
						status: CollaborationStatus.ACTIVE
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
								avatarFile: {
									select: {
										id: true,
										path: true
									}
								}
							}
						}
					},
					orderBy: {joinedAt: 'asc'}
				})
			]),
			'Failed to get post authors'
		)
			.map (([postData, coAuthorCollaborators]) => {
				if ( ! postData?.author) {
					throw new Error ('Post or author not found');
				}
				
				return {
					owner: postData.author,
					coAuthors: coAuthorCollaborators.map (collab => ({
						id: collab.user.id,
						name: collab.user.name,
						email: collab.user.email,
						avatarFile: collab.user.avatarFile,
						joinedAt: collab.joinedAt
					}))
				};
			});
	}
	
	/**
	 * Check if a user is an author (owner or co-author) of a post
	 */
	isUserAuthor (postId: string, userId: string): TaskEither<boolean> {
		return TaskEither.tryCatch (
			() => Promise.all ([
				// Check if user is the owner
				this.prisma.post.findUnique ({
					where: {id: postId},
					select: {authorId: true}
				}),
				// Check if user is a co-author
				this.prisma.postCollaborator.findUnique ({
					where: {
						postId_userId: {
							postId,
							userId
						}
					},
					select: {role: true, status: true}
				})
			]),
			'Failed to check author status'
		)
			.map (([post, collaborator]) => {
				if ( ! post) return false;
				
				// Check if user is the owner
				if (post.authorId === userId) return true;
				
				// Check if user is an active co-author
				return collaborator?.role === CollaboratorRole.CO_AUTHOR &&
					collaborator?.status === CollaborationStatus.ACTIVE;
			});
	}
	
	/**
	 * Accept an email invitation (when user registers/logs in)
	 */
	acceptEmailInvitation (token: string, userId: string): TaskEither<PostCollaborator> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.findUnique ({
				where: {token},
				include: {
					post: {
						select: {
							id: true,
							title: true,
							authorId: true
						}
					}
				}
			}),
			'Failed to find email invitation'
		)
			.nonNullable ('Email invitation not found')
			.chain (invitation => {
				// Check if invitation is still valid
				if (invitation.status !== InvitationStatus.PENDING) {
					return TaskEither.error (createBadRequestError ('Invitation is no longer valid'));
				}
				
				if (invitation.expiresAt < new Date ()) {
					return TaskEither.error (createBadRequestError ('Invitation has expired'));
				}
				
				if (invitation.post.authorId === userId) {
					return TaskEither.error (createBadRequestError ('Post owner cannot accept collaboration invitation'));
				}
				
				// Check if user is already a collaborator
				return TaskEither.tryCatch (
					() => this.prisma.postCollaborator.findUnique ({
						where: {
							postId_userId: {
								postId: invitation.postId,
								userId
							}
						}
					}),
					'Failed to check existing collaboration'
				)
					.chain (existingCollaborator => {
						if (existingCollaborator) {
							return TaskEither.error (createBadRequestError ('User is already a collaborator on this post'));
						}
						
						// Create collaboration and mark invitation as accepted
						return TaskEither.tryCatch (
							() => this.prisma.$transaction (async (tx) => {
								// Create collaboration
								const collaborator = await tx.postCollaborator.create ({
									data: {
										postId: invitation.postId,
										userId,
										role: invitation.role,
										invitedBy: invitation.invitedBy,
										status: CollaborationStatus.ACTIVE,
										joinedAt: new Date ()
									}
								});
								
								// Mark email invitation as accepted
								await tx.emailInvitation.update ({
									where: {id: invitation.id},
									data: {status: InvitationStatus.ACCEPTED}
								});
								
								return collaborator;
							}),
							'Failed to accept email invitation'
						);
					});
			});
	}
	
	/**
	 * Accept all pending email invitations for a user's email
	 * This is called when a user signs up with an invited email
	 */
	acceptPendingInvitationsForEmail (email: string, userId: string): TaskEither<PostCollaborator[]> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.findMany ({
				where: {
					email,
					status: InvitationStatus.PENDING,
					expiresAt: {gte: new Date ()}
				},
				include: {
					post: {
						select: {
							id: true,
							title: true,
							authorId: true
						}
					}
				}
			}),
			'Failed to find pending email invitations'
		)
			.matchTask<PostCollaborator[]>([
				{
					predicate: (invitations) => invitations.length === 0,
					run: () => TaskEither.tryCatch(() => Promise.resolve([]), 'No invitations')
				},
				{
					predicate: () => true,
					run: (invitations) => TaskEither.tryCatch (
						() => this.prisma.$transaction (async (tx) => {
							// Filter out invitations where user is the post owner
							const validInvitations = invitations.filter(inv => inv.post.authorId !== userId);
							
							// Process all valid invitations
							const collaborators = await Promise.all(
								validInvitations.map(async invitation => {
									// Check if already a collaborator
									const existingCollaborator = await tx.postCollaborator.findUnique ({
										where: {
											postId_userId: {
												postId: invitation.postId,
												userId
											}
										}
									});
									
									// Mark invitation as accepted
									await tx.emailInvitation.update ({
										where: {id: invitation.id},
										data: {status: InvitationStatus.ACCEPTED}
									});
									
									return existingCollaborator ?? await tx.postCollaborator.create ({
										data: {
											postId: invitation.postId,
											userId,
											role: invitation.role,
											invitedBy: invitation.invitedBy,
											status: CollaborationStatus.ACTIVE,
											joinedAt: new Date ()
										}
									});
								})
							);
							
							return collaborators.filter(c => c !== null) as PostCollaborator[];
						}),
						'Failed to accept pending email invitations'
					)
				}
			]);
	}
	
	/**
	 * Decline an email invitation
	 */
	declineEmailInvitation (token: string): TaskEither<void> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.findUnique ({
				where: {token}
			}),
			'Failed to find email invitation'
		)
			.nonNullable ('Email invitation not found')
			.chain (invitation => {
				if (invitation.status !== InvitationStatus.PENDING) {
					return TaskEither.error (createBadRequestError ('Invitation is no longer valid'));
				}
				
				return TaskEither.tryCatch (
					() => this.prisma.emailInvitation.update ({
						where: {id: invitation.id},
						data: {status: InvitationStatus.DECLINED}
					}),
					'Failed to decline email invitation'
				)
					.map (() => undefined);
			});
	}
	
	/**
	 * Get email invitation details by token
	 */
	getEmailInvitation (token: string): TaskEither<EmailInvitation & {
		post: { title: string; slug: string };
		inviter: { name: string | null }
	}> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.findUnique ({
				where: {token},
				include: {
					post: {
						select: {
							title: true,
							slug: true
						}
					},
					inviter: {
						select: {
							name: true
						}
					}
				}
			}),
			'Failed to get email invitation'
		)
			.nonNullable ('Email invitation not found');
	}
	
	/**
	 * Get pending email invitations for an email address
	 */
	getUserEmailInvitations (email: string): TaskEither<Array<EmailInvitation & {
		post: { title: string; slug: string };
		inviter: { name: string | null }
	}>> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.findMany ({
				where: {
					email,
					status: InvitationStatus.PENDING,
					expiresAt: {
						gt: new Date ()
					}
				},
				include: {
					post: {
						select: {
							title: true,
							slug: true
						}
					},
					inviter: {
						select: {
							name: true
						}
					}
				},
				orderBy: {invitedAt: 'desc'}
			}),
			'Failed to get user email invitations'
		);
	}
	
	/**
	 * Clean up expired email invitations
	 */
	cleanupExpiredEmailInvitations (): TaskEither<number> {
		return TaskEither.tryCatch (
			() => this.prisma.emailInvitation.updateMany ({
				where: {
					status: InvitationStatus.PENDING,
					expiresAt: {
						lt: new Date ()
					}
				},
				data: {
					status: InvitationStatus.EXPIRED
				}
			}),
			'Failed to cleanup expired email invitations'
		)
			.map (result => result.count);
	}
	
	/**
	 * Create collaboration for existing registered user
	 */
	private createDirectCollaboration (user: {
		id: string;
		name: string | null;
		email: string
	}, input: CreateCollaboratorInput): TaskEither<PostCollaborator> {
		return TaskEither
			.tryCatch(
				() => this.prisma.postCollaborator.upsert({
					where: {
						postId_userId: {
							postId: input.postId,
							userId: user.id
						}
					},
					update: {
						role: input.role,
						status: CollaborationStatus.PENDING,
						invitedBy: input.inviterUserId,
						joinedAt: null // Reset joined date for pending invites
					},
					create: {
						postId: input.postId,
						userId: user.id,
						role: input.role,
						invitedBy: input.inviterUserId,
						status: CollaborationStatus.PENDING
					}
				})
			)
	}
	
	/**
	 * Create email invitation for unregistered user
	 */
	private createEmailInvitation (input: CreateCollaboratorInput): TaskEither<EmailInvitation> {
		return TaskEither
			.tryCatch (
				() => this.prisma.emailInvitation.upsert ({
					where: {
						email_postId: {
							email: input.email,
							postId: input.postId
						}
					},
					update: {
						status: InvitationStatus.PENDING,
						invitedBy: input.inviterUserId,
						expiresAt: new Date (Date.now () + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
					},
					create: {
						email: input.email,
						postId: input.postId,
						role: input.role,
						invitedBy: input.inviterUserId,
						token: randomBytes (32).toString ('hex'),
						expiresAt: new Date (Date.now () + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
						status: InvitationStatus.PENDING
					}
				})
			)
	}
	
	/**
	 * Send collaboration email to registered user
	 */
	private sendCollaborationEmail (user: { id: string; name: string | null; email: string }, post: {
		title: string;
		slug: string
	}, input: CreateCollaboratorInput): TaskEither<void> {
		return TaskEither.tryCatch (
			() => this.prisma.user.findUnique ({
				where: {id: input.inviterUserId},
				select: {name: true, email: true}
			}),
			'Failed to get inviter details'
		)
			.nonNullable ('Inviter not found')
			.chain (inviter => {
				const emailData: CollaborationInviteEmailData = {
					inviterName: inviter.name || 'A user',
					inviterEmail: inviter.email,
					postTitle: post.title,
					postSlug: post.slug,
					role: input.role,
					invitationToken: '', // Not needed for registered users
					appName: process.env.APP_NAME || 'Pad',
					baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
				};
				
				return this.emailService.sendCollaborationInvite (emailData);
			});
	}
	
	/**
	 * Check if user has specific permission on a post
	 */
	private checkCollaborationPermission (
		postId: string,
		userId: string,
		action: 'READ' | 'EDIT' | 'INVITE' | 'PUBLISH'
	): TaskEither<boolean> {
		return TaskEither.tryCatch (
			() => this.prisma.post.findUnique ({
				where: {id: postId},
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
			.nonNullable ('Post not found')
			.map (post => {
				// Post owner has all permissions
				if (post.authorId === userId) {
					return true;
				}
				
				const collaboration = post.collaborators[0];
				if ( ! collaboration) {
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
}