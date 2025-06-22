import { Metadata } from 'next'
import { getAdminInfo } from '@/app/actions/admin-info'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for this Pad instance',
}

export default async function TermsPage() {
  const adminInfo = await getAdminInfo();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Rules and guidelines for using this platform
            </p>
{!adminInfo.isFound && (
              <div className="inline-flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 px-3 py-2 rounded-lg">
                <span className="text-base">⚠️</span>
                <span className="font-medium">Template Document:</span>
                <span>No admin user found - showing placeholder information</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            
            {/* Effective Date */}
            <section className="bg-muted/30 rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Effective Date:</strong> June 22, 2024
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Instance Operator:</strong> {adminInfo.name} {!adminInfo.isFound && <span className="text-amber-600">[Placeholder - No admin user found]</span>}
              </p>
            </section>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your use of this instance of Pad, operated by 
                {adminInfo.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using this 
                platform, you agree to be bound by these Terms. If you do not agree to these Terms, 
                do not use this platform.
              </p>
            </section>

            {/* Important Notice */}
            <section className="border-l-4 border-primary pl-6 bg-primary/5 py-4">
              <h3 className="text-lg font-medium mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                This is an independent instance of Pad, an open-source blogging platform. The original 
                Pad software developers are not responsible for this instance&apos;s operation, content, 
                or policies. All liability rests with the instance operator.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <div className="text-muted-foreground space-y-3">
                <p>By using this platform, you confirm that:</p>
                <ul className="space-y-2 ml-4">
                  <li>• You are at least 13 years old</li>
                  <li>• You have the legal capacity to enter into these Terms</li>
                  <li>• You will comply with all applicable laws and regulations</li>
                  <li>• You understand this is a self-hosted instance operated independently</li>
                </ul>
              </div>
            </section>

            {/* Platform Description */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Platform Description</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  This platform provides blogging and content creation services including:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Rich content creation with multiple block types</li>
                  <li>• File upload and media management</li>
                  <li>• Content collaboration and sharing</li>
                  <li>• Analytics and engagement tracking</li>
                  <li>• User profiles and social features</li>
                </ul>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
              <div className="text-muted-foreground space-y-3">
                <h3 className="text-lg font-medium text-foreground">Account Creation</h3>
                <ul className="space-y-2 ml-4">
                  <li>• You must provide accurate and complete information</li>
                  <li>• You are responsible for maintaining account security</li>
                  <li>• One person may not maintain multiple accounts</li>
                  <li>• You must notify us of any unauthorized account access</li>
                </ul>
                
                <h3 className="text-lg font-medium text-foreground mt-6">Account Termination</h3>
                <ul className="space-y-2 ml-4">
                  <li>• You may delete your account at any time</li>
                  <li>• We may suspend or terminate accounts that violate these Terms</li>
                  <li>• Account termination may result in loss of content and data</li>
                </ul>
              </div>
            </section>

            {/* Content Guidelines */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Content Guidelines</h2>
              <div className="text-muted-foreground space-y-4">
                <h3 className="text-lg font-medium text-foreground">Acceptable Use</h3>
                <p>You may use this platform to create and share:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Original blog posts and articles</li>
                  <li>• Creative writing and storytelling</li>
                  <li>• Educational and informational content</li>
                  <li>• Professional and personal commentary</li>
                  <li>• Photography and visual content you own or have rights to use</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-6">Prohibited Content</h3>
                <p>You may not post content that:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Violates any laws or regulations</li>
                  <li>• Infringes on intellectual property rights</li>
                  <li>• Contains harassment, threats, or hate speech</li>
                  <li>• Includes spam, malware, or deceptive practices</li>
                  <li>• Exploits or harms minors</li>
                  <li>• Contains explicit adult content without appropriate warnings</li>
                  <li>• Promotes violence or illegal activities</li>
                  <li>• Violates others&apos; privacy or includes personal information without consent</li>
                </ul>
              </div>
            </section>

            {/* Content Ownership */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Content Ownership and Rights</h2>
              <div className="text-muted-foreground space-y-4">
                <h3 className="text-lg font-medium text-foreground">Your Content</h3>
                <ul className="space-y-2 ml-4">
                  <li>• You retain ownership of content you create</li>
                  <li>• You grant us a license to host, display, and distribute your content</li>
                  <li>• You are responsible for ensuring you have rights to all content you post</li>
                  <li>• You may delete your content at any time</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">Platform Content</h3>
                <ul className="space-y-2 ml-4">
                  <li>• The platform interface and functionality remain our property</li>
                  <li>• You may not copy, modify, or redistribute platform code without permission</li>
                  <li>• User-generated content remains the property of respective creators</li>
                </ul>
              </div>
            </section>

            {/* File Uploads */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">File Uploads and Storage</h2>
              <div className="text-muted-foreground space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Important:</strong> Uploaded files may be publicly accessible via direct URLs. 
                    Do not upload confidential, private, or sensitive information.
                  </p>
                </div>
                <ul className="space-y-2 ml-4">
                  <li>• You are responsible for all files you upload</li>
                  <li>• File size and type restrictions may apply</li>
                  <li>• We may remove files that violate these Terms</li>
                  <li>• Backup your important files independently</li>
                </ul>
              </div>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy and Data Protection</h2>
              <div className="text-muted-foreground">
                <p>
                  Your privacy is important to us. Please review our{' '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{' '}
                  to understand how we collect, use, and protect your information. By using this 
                  platform, you also consent to our data practices as described in the Privacy Policy.
                </p>
              </div>
            </section>

            {/* Platform Availability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Platform Availability</h2>
              <div className="text-muted-foreground space-y-3">
                <p>We strive to maintain platform availability, but we do not guarantee:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Uninterrupted access to the platform</li>
                  <li>• Error-free operation of all features</li>
                  <li>• Specific uptime or performance metrics</li>
                  <li>• Advance notice of maintenance or downtime</li>
                </ul>
                <p>We reserve the right to modify, suspend, or discontinue any part of the platform at any time.</p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimers and Limitations</h2>
              <div className="text-muted-foreground space-y-4">
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">No Warranties</h3>
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    This platform is provided &quot;as is&quot; without warranties of any kind. We disclaim all 
                    warranties, express or implied, including warranties of merchantability, fitness 
                    for a particular purpose, and non-infringement.
                  </p>
                </div>

                <h3 className="text-lg font-medium text-foreground">Limitation of Liability</h3>
                <p>To the maximum extent permitted by law:</p>
                <ul className="space-y-2 ml-4">
                  <li>• We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>• Our total liability shall not exceed the amount you paid to use this platform</li>
                  <li>• We are not responsible for user-generated content or third-party actions</li>
                  <li>• You use this platform at your own risk</li>
                </ul>
              </div>
            </section>

            {/* Open Source Software */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Open Source Software</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  This platform is built using Pad, open-source software licensed under GPL-3.0. 
                  Key points about the underlying software:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• The software source code is available on GitHub</li>
                  <li>• The original software developers provide no warranties or support</li>
                  <li>• This instance operator is solely responsible for maintenance and operation</li>
                  <li>• Software updates are at the discretion of this instance operator</li>
                </ul>
                <p className="text-sm">
                  For more information about Pad, visit{' '}
                  <a 
                    href="https://github.com/eleven-am/pad" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://github.com/eleven-am/pad
                  </a>
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
              <div className="text-muted-foreground">
                <p>
                  You agree to indemnify and hold harmless the platform operator from any claims, 
                  damages, losses, or expenses (including legal fees) arising from your use of this 
                  platform, your content, or your violation of these Terms.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law and Disputes</h2>
              <div className="text-muted-foreground">
                <p>
                  These Terms are governed by the laws of the jurisdiction where this instance is operated. 
                  Any disputes arising from your use of this platform will be resolved according to the 
                  applicable laws and court system of that jurisdiction. If any provision of these Terms 
                  is found invalid, the remaining provisions will continue in effect.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Legal Questions:</strong> For specific legal questions about jurisdiction, 
                    applicable laws, or dispute resolution procedures, please contact the instance operator 
                    using the information provided below.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
              <div className="text-muted-foreground">
                <p>
                  We may update these Terms from time to time. We will notify users of material 
                  changes by posting the updated Terms on this page and updating the effective date. 
                  Your continued use of the platform after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <div className="text-muted-foreground space-y-3">
                <p>These Terms remain in effect until terminated. Termination may occur:</p>
                <ul className="space-y-2 ml-4">
                  <li>• When you delete your account</li>
                  <li>• When we suspend or terminate your account for violations</li>
                  <li>• When we discontinue the platform</li>
                </ul>
                <p>Upon termination, your right to use the platform ceases, but these Terms&apos; provisions regarding content ownership, disclaimers, and limitations of liability survive.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <div className="text-muted-foreground space-y-2">
                <p>If you have questions about these Terms or need to report violations:</p>
                <p><strong>Email:</strong> {adminInfo.email}</p>
                <p className="text-sm">
                  For additional contact methods, reporting mechanisms, or if a physical address is required 
                  in your jurisdiction, please reach out via email for further contact information.
                </p>
              </div>
            </section>

            {/* Open Source Credit */}
            <section className="border-t pt-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  This platform is powered by{' '}
                  <a 
                    href="https://github.com/eleven-am/pad" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Pad
                  </a>
                  , an open-source blogging platform built by{' '}
                  <a 
                    href="https://github.com/eleven-am" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Roy OSSAI
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}