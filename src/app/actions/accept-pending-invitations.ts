'use server';

import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { postCollaborationService } from '@/services/di';
import { TaskEither, createUnauthorizedError, hasError } from '@eleven-am/fp';

/**
 * Accepts all pending email invitations for the currently authenticated user
 * This should be called after a user signs up or logs in for the first time
 */
export async function acceptPendingInvitations() {
	const hdrs = await headers();
	
	return TaskEither
		.tryCatch(
			() => auth.api.getSession({ headers: hdrs }),
			'Failed to get session'
		)
		.filter(
			(session) => !!session?.user?.email && !!session?.user?.id,
			() => createUnauthorizedError('User not authenticated')
		)
		.chain((session) => 
			postCollaborationService.acceptPendingInvitationsForEmail(
				session!.user.email,
				session!.user.id
			)
		)
		.map((collaborators) => ({
			success: true,
			acceptedCount: collaborators.length,
			message: collaborators.length > 0
				? `Successfully accepted ${collaborators.length} collaboration invitation${collaborators.length > 1 ? 's' : ''}`
				: 'No pending invitations found'
		}))
		.toResult()
		.then((result) => {
			if (hasError(result)) {
				return {
					success: false,
					message: 'Failed to process invitations'
				};
			}
			return result.data;
		});
}