import nodemailer from 'nodemailer';
import { TaskEither } from '@eleven-am/fp';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface CollaborationInviteEmailData {
  inviterName: string;
  inviterEmail: string;
  postTitle: string;
  postSlug: string;
  role: string;
  invitationToken: string;
  appName: string;
  baseUrl: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  /**
   * Send a generic email
   */
  sendEmail(emailContent: EmailContent): TaskEither<void> {
    return TaskEither.tryCatch(
      async () => {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || 'noreply@pad.com',
          to: emailContent.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      },
      'Failed to send email'
    );
  }

  /**
   * Send collaboration invitation email
   */
  sendCollaborationInvite(data: CollaborationInviteEmailData): TaskEither<void> {
    const htmlTemplate = this.generateCollaborationInviteHTML(data);
    const textTemplate = this.generateCollaborationInviteText(data);

    const emailContent: EmailContent = {
      to: data.inviterEmail,
      subject: `${data.inviterName} invited you to collaborate on "${data.postTitle}"`,
      html: htmlTemplate,
      text: textTemplate,
    };

    return this.sendEmail(emailContent);
  }

  /**
   * Generate HTML template for collaboration invitation
   */
  private generateCollaborationInviteHTML(data: CollaborationInviteEmailData): string {
    const roleText = data.role === 'CO_AUTHOR' ? 'co-author' : 'collaborator';
    const acceptUrl = `${data.baseUrl}/invite/accept?token=${data.invitationToken}`;
    const declineUrl = `${data.baseUrl}/invite/decline?token=${data.invitationToken}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Collaboration Invitation</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background-color: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .content { 
              background-color: #ffffff; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
            }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              margin: 10px 5px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 600; 
              text-align: center; 
            }
            .accept { 
              background-color: #10b981; 
              color: white; 
            }
            .decline { 
              background-color: #ef4444; 
              color: white; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280; 
            }
            .post-title { 
              font-weight: 600; 
              color: #1f2937; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.appName}</h1>
          </div>
          
          <div class="content">
            <h2>You've been invited to collaborate!</h2>
            
            <p>Hi there,</p>
            
            <p><strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to be a <strong>${roleText}</strong> on the post:</p>
            
            <p class="post-title">"${data.postTitle}"</p>
            
            <p>As a ${roleText}, you'll be able to:</p>
            <ul>
              ${data.role === 'CO_AUTHOR' ? `
                <li>Edit and modify the post content</li>
                <li>Be credited as a co-author</li>
                <li>View analytics and engagement data</li>
              ` : `
                <li>Edit and contribute to the post content</li>
                <li>Leave comments and suggestions</li>
                <li>Collaborate with other team members</li>
              `}
            </ul>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${acceptUrl}" class="button accept">Accept Invitation</a>
              <a href="${declineUrl}" class="button decline">Decline Invitation</a>
            </div>
            
            <p><strong>Note:</strong> If you don't have an account yet, clicking "Accept Invitation" will guide you through the registration process.</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by ${data.inviterName} via ${data.appName}.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text template for collaboration invitation
   */
  private generateCollaborationInviteText(data: CollaborationInviteEmailData): string {
    const roleText = data.role === 'CO_AUTHOR' ? 'co-author' : 'collaborator';
    const acceptUrl = `${data.baseUrl}/invite/accept?token=${data.invitationToken}`;
    const declineUrl = `${data.baseUrl}/invite/decline?token=${data.invitationToken}`;

    return `
${data.appName} - Collaboration Invitation

Hi there,

${data.inviterName} (${data.inviterEmail}) has invited you to be a ${roleText} on the post: "${data.postTitle}"

As a ${roleText}, you'll be able to edit and contribute to the post content.

To accept this invitation, visit: ${acceptUrl}
To decline this invitation, visit: ${declineUrl}

Note: If you don't have an account yet, clicking the accept link will guide you through the registration process.

This invitation was sent by ${data.inviterName} via ${data.appName}.
If you didn't expect this invitation, you can safely ignore this email.
    `.trim();
  }

  /**
   * Verify email service connection
   */
  verifyConnection(): TaskEither<boolean> {
    return TaskEither.tryCatch(
      async () => {
        await this.transporter.verify();
        return true;
      },
      'Failed to verify email service connection'
    );
  }
}

// Factory function to create email service instance
export function createEmailService(): EmailService {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return new EmailService(config);
}