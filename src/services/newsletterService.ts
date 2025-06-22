import {Newsletter, PrismaClient} from '@/generated/prisma';
import {BaseService} from '@/services/baseService';
import {TaskEither} from '@eleven-am/fp';
import {EmailContent, EmailService} from '@/services/emailService';

export interface NewsletterSubscriptionInput {
	email: string;
	source?: string;
}

export interface NewsletterBroadcastInput {
	subject: string;
	content: string;
	previewText?: string;
	senderName?: string;
	unsubscribeText?: string;
}

export interface NewsletterBroadcastResult {
	totalSubscribers: number;
	emailsSent: number;
	failed: number;
	errors: string[];
}

export class NewsletterService extends BaseService {
	constructor (
		prisma: PrismaClient,
		private emailService: EmailService
	) {
		super (prisma);
	}
	
	/**
	 * Subscribe an email to the newsletter
	 * @param input - The subscription data
	 * @returns The created newsletter subscription
	 */
	subscribe (input: NewsletterSubscriptionInput): TaskEither<Newsletter> {
		return TaskEither
			.fromNullable(input.email.toLowerCase().trim())
			.fromPromise(
				(email) => this.prisma.newsletter.upsert({
					where: {email},
					update: {
						isActive: true,
						subscribedAt: new Date(),
						unsubscribedAt: null,
						source: input.source || 'unknown'
					},
					create: {
						email,
						isActive: true,
						subscribedAt: new Date(),
						source: input.source || 'unknown'
					}
				}),
			);
	}
	
	/**
	 * Unsubscribe an email from the newsletter
	 * @param email - The email to unsubscribe
	 * @returns The updated newsletter subscription
	 */
	unsubscribe (email: string): TaskEither<Newsletter> {
		return TaskEither
			.of (email.toLowerCase ().trim ())
			.chain ((email) =>
				TaskEither.tryCatch (
					() => this.prisma.newsletter.update ({
						where: {email},
						data: {
							isActive: false,
							unsubscribedAt: new Date ()
						}
					}),
					'Failed to unsubscribe from newsletter'
				)
			);
	}
	
	/**
	 * Get all active subscribers
	 * @returns List of active newsletter subscriptions
	 */
	getActiveSubscribers (): TaskEither<Newsletter[]> {
		return TaskEither.tryCatch (
			() => this.prisma.newsletter.findMany ({
				where: {isActive: true},
				orderBy: {subscribedAt: 'desc'}
			}),
			'Failed to fetch newsletter subscribers'
		);
	}
	
	/**
	 * Get subscription stats
	 * @returns Newsletter subscription statistics
	 */
	getStats (): TaskEither<{
		total: number;
		active: number;
		unsubscribed: number;
		recentSubscriptions: number; // Last 30 days
	}> {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const wrapPromise = <T>(fn: () => Promise<T>): TaskEither<T> => {
			return TaskEither.tryCatch(fn);
		}
		
		return TaskEither
			.fromBind({
				total: wrapPromise(() => this.prisma.newsletter.count()),
				active: wrapPromise(() => this.prisma.newsletter.count({where: {isActive: true}})),
				unsubscribed: wrapPromise(() => this.prisma.newsletter.count({where: {isActive: false}})),
				recentSubscriptions: wrapPromise(() => this.prisma.newsletter.count({
					where: {
						subscribedAt: {gte: thirtyDaysAgo},
						isActive: true
					}
				}))
			});
	}
	
	/**
	 * Check if email is already subscribed
	 * @param email - The email to check
	 * @returns Whether the email is subscribed
	 */
	isSubscribed (email: string): TaskEither<boolean> {
		return TaskEither
			.tryCatch(
				() => this.prisma.newsletter.findUnique({
					where: {email: email.toLowerCase().trim()}
				}),
			)
			.nonNullable('Email not found')
			.map((subscription) => subscription.isActive)
	}
	
	/**
	 * Send newsletter to all active subscribers
	 * @param input - The newsletter content
	 * @returns The broadcast result
	 */
	sendNewsletter (input: NewsletterBroadcastInput): TaskEither<NewsletterBroadcastResult> {
		return this.getActiveSubscribers()
			.chainItems(
				(subscriber) => TaskEither
					.tryCatch(
						() => {
							const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
							const emailContent = this.generateNewsletterEmail(input, subscriber.email, unsubscribeUrl);
							return this.emailService.sendEmail(emailContent).toPromise();
						},
					)
					.map(() => ({
						success: true,
						message: 'Newsletter broadcast sent successfully',
						email: subscriber.email
					}))
					.orElse(() => TaskEither.of({
						success: false,
						message: 'Failed to send newsletter broadcast',
						email: subscriber.email
					}))
			)
			.map(
				(results) => {
					const totalSubscribers = results.length;
					const emailsSent = results.filter(r => r.success).length;
					const failed = results.filter(r => !r.success).length;
					const errors = results.filter(r => !r.success).map(r => r.message);
					
					return {
						totalSubscribers,
						emailsSent,
						failed,
						errors
					};
				}
			);
	}
	
	/**
	 * Generate newsletter email HTML
	 * @param input - Newsletter content
	 * @param recipientEmail - Recipient's email
	 * @param unsubscribeUrl - Unsubscribe URL
	 * @returns Email content
	 */
	private generateNewsletterEmail (
		input: NewsletterBroadcastInput,
		recipientEmail: string,
		unsubscribeUrl: string
	): EmailContent {
		const senderName = input.senderName || 'Pad Newsletter';
		const unsubscribeText = input.unsubscribeText || 'Unsubscribe from our newsletter';
		const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Pad';
		
		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${input.subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f9fafb;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header { 
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content h1, .content h2, .content h3 {
              color: #1f2937;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .content p {
              margin-bottom: 15px;
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280;
              text-align: center;
            }
            .unsubscribe {
              margin-top: 15px;
            }
            .unsubscribe a {
              color: #6b7280;
              text-decoration: underline;
            }
            ${input.previewText ? '.preview { display: none; }' : ''}
          </style>
        </head>
        <body>
          ${input.previewText ? `<div class="preview">${input.previewText}</div>` : ''}
          
          <div class="container">
            <div class="header">
              <div class="logo">${appName}</div>
            </div>
            
            <div class="content">
              ${input.content}
            </div>
            
            <div class="footer">
              <p>You're receiving this email because you subscribed to our newsletter.</p>
              <p style="margin-top: 10px; font-weight: 500;">${senderName}</p>
              <div class="unsubscribe">
                <a href="${unsubscribeUrl}">${unsubscribeText}</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
		
		const text = this.generatePlainTextNewsletter (input, unsubscribeUrl);
		
		return {
			to: recipientEmail,
			subject: input.subject,
			html,
			text
		};
	}
	
	/**
	 * Generate plain text version of newsletter
	 */
	private generatePlainTextNewsletter (input: NewsletterBroadcastInput, unsubscribeUrl: string): string {
		const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Pad';
		const unsubscribeText = input.unsubscribeText || 'Unsubscribe from our newsletter';
		
		// Strip HTML tags for plain text version
		const plainContent = input.content.replace (/<[^>]*>/g, '').replace (/\s+/g, ' ').trim ();
		
		return `
${appName} Newsletter

${plainContent}

---

You're receiving this email because you subscribed to our newsletter.
${unsubscribeText}: ${unsubscribeUrl}
    `.trim ();
	}
	
	/**
	 * Validate email format
	 * @param email - The email to validate
	 * @returns Whether the email is valid
	 */
	private isValidEmail (email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test (email);
	}
}