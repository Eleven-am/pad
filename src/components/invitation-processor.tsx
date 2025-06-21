'use client';

import { useEffect, useRef } from 'react';
import { acceptPendingInvitations } from '@/app/actions/accept-pending-invitations';
import { toast } from 'sonner';

/**
 * Automatically processes pending email invitations for newly signed-up users
 * This component should be included in the root layout or dashboard
 */
export function InvitationProcessor() {
	const hasProcessed = useRef(false);
	
	useEffect(() => {
		// Only process once per session
		if (hasProcessed.current) return;
		
		// Check if this is a new session (could be refined based on your needs)
		const isNewSession = sessionStorage.getItem('invitations-processed') !== 'true';
		
		if (isNewSession) {
			hasProcessed.current = true;
			
			acceptPendingInvitations().then(result => {
				if (result.success && 'acceptedCount' in result && result.acceptedCount > 0) {
					toast.success(result.message);
				}
				
				// Mark as processed for this session
				sessionStorage.setItem('invitations-processed', 'true');
			}).catch(error => {
				console.error('Failed to process invitations:', error);
			});
		}
	}, []);
	
	return null;
}