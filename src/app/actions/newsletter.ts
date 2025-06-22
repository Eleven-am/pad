'use server';

import {newsletterService} from '@/services/di';
import {
	NewsletterBroadcastInput,
	NewsletterBroadcastResult,
	NewsletterSubscriptionInput
} from '@/services/newsletterService';
import {hasData, hasError} from '@eleven-am/fp';

export interface NewsletterSubscriptionResult {
	success: boolean;
	message: string;
	alreadySubscribed?: boolean;
}

/**
 * Subscribe to newsletter server action
 */
export async function subscribeToNewsletter (
	email: string,
	source?: string
): Promise<NewsletterSubscriptionResult> {
	const input: NewsletterSubscriptionInput = {
		email,
		source: source || 'homepage'
	};
	
	const result = await newsletterService.subscribe(input).toResult();
	if (hasData(result)) {
		return {
			success: true,
			message: 'Thank you for subscribing! You will receive our latest updates.'
		};
	}
	
	if (result.error.message.includes('already subscribed')) {
		return {
			success: false,
			message: 'You are already subscribed to our newsletter!',
			alreadySubscribed: true
		};
	}
	
	return {
		success: false,
		message: result.error.message.includes('Invalid email')
			? 'Please enter a valid email address.'
			: 'Something went wrong. Please try again later.'
	};
}

/**
 * Check if email is already subscribed
 */
export async function checkSubscriptionStatus (email: string): Promise<boolean> {
	return newsletterService.isSubscribed (email).toPromise();
}

/**
 * Get newsletter stats (for admin dashboard)
 */
export async function getNewsletterStats () {
	return newsletterService.getStats().toPromise();
}

/**
 * Send newsletter to all subscribers
 */
export async function sendNewsletterBroadcast (
	input: NewsletterBroadcastInput
): Promise<NewsletterBroadcastResult> {
	return newsletterService.sendNewsletter(input).toPromise();
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter (email: string): Promise<{
	success: boolean;
	message: string;
}> {
	const result = await newsletterService.unsubscribe(email).toResult();
	if (hasError (result)) {
		return {
			success: false,
			message: 'Email not found or already unsubscribed.'
		};
	}
	return {
		success: true,
		message: 'You have been successfully unsubscribed from our newsletter.'
	};
}