import { Metadata } from 'next'
import { getAdminInfo } from '@/app/actions/admin-info'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for this Pad instance',
}

export default async function PrivacyPage() {
  const adminInfo = await getAdminInfo();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              How we collect, use, and protect your information
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
                This privacy policy describes how {adminInfo.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) 
                collects, uses, and protects information when you use this instance of Pad, an open-source 
                blogging platform. This instance is operated independently and is not affiliated with the 
                original Pad software developers.
              </p>
            </section>

            {/* Important Notice */}
            <section className="border-l-4 border-primary pl-6 bg-primary/5 py-4">
              <h3 className="text-lg font-medium mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                Pad is self-hosted, open-source software. Each instance is operated independently. 
                The original software developers have no access to, control over, or responsibility 
                for data collected by individual instances.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Account Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Email address (required for account creation)</li>
                    <li>• Name and profile information you provide</li>
                    <li>• Social media profiles (Twitter, LinkedIn, GitHub) if you choose to link them</li>
                    <li>• Profile picture/avatar</li>
                    <li>• Account preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Content and Files</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Blog posts, articles, and other content you create</li>
                    <li>• Comments and interactions with other users&apos; content</li>
                    <li>• Files and images you upload</li>
                    <li>• Collaboration and editing history</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Usage Analytics</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Reading time and engagement metrics</li>
                    <li>• Page views and navigation patterns</li>
                    <li>• Device and browser information</li>
                    <li>• IP address and general location (country/region)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Authentication Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• OAuth tokens from third-party providers (Google, GitHub)</li>
                    <li>• Session information and login history</li>
                    <li>• Security-related data for account protection</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Provide and maintain the blogging platform services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Enable collaboration and content sharing features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Improve platform performance and user experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Provide analytics and insights to content creators</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Communicate with you about your account and platform updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Ensure security and prevent abuse</span>
                </li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your data is stored on servers controlled by this instance operator. We implement 
                  reasonable security measures to protect your information, including:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Encrypted data transmission (HTTPS)</li>
                  <li>• Secure authentication through trusted OAuth providers</li>
                  <li>• Regular security updates and monitoring</li>
                  <li>• Access controls and user permission systems</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>File Upload Notice:</strong> By default, uploaded files may be publicly 
                    accessible via direct URLs. Please avoid uploading sensitive or private content.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We do not sell or rent your personal information. We may share information in these limited circumstances:</p>
                <ul className="space-y-2 ml-4">
                  <li>• With your explicit consent</li>
                  <li>• When required by law or legal process</li>
                  <li>• To protect our rights, safety, or the safety of others</li>
                  <li>• With service providers who help operate this platform (hosting, analytics)</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                  <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li>• <strong>Portability:</strong> Export your content and data</li>
                  <li>• <strong>Objection:</strong> Opt out of certain data processing activities</li>
                </ul>
                <p className="text-sm">
                  To exercise these rights, please contact us at {adminInfo.email}.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use essential cookies to provide platform functionality, including:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Authentication and session management</li>
                  <li>• User preferences and settings</li>
                  <li>• Security and fraud prevention</li>
                </ul>
                <p className="text-sm">
                  We respect &quot;Do Not Track&quot; browser settings and do not use third-party advertising cookies.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <div className="text-muted-foreground">
                <p>
                  We retain your information for as long as your account is active or as needed to 
                  provide services. You may delete your account at any time through your account 
                  settings. [INSERT SPECIFIC RETENTION PERIODS FOR YOUR INSTANCE]
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
              <div className="text-muted-foreground">
                <p>
                  This platform is not intended for children under 13. We do not knowingly collect 
                  personal information from children under 13. If you become aware that a child has 
                  provided us with personal information, please contact us so we can take appropriate action.
                </p>
              </div>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">International Users</h2>
              <div className="text-muted-foreground">
                <p>
                  This instance is self-hosted and operated independently. Data is stored and processed 
                  on servers controlled by the instance operator. If you are accessing this platform 
                  from a different country than where the servers are located, your information may be 
                  transferred across international borders.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Data Protection Laws:</strong> Different countries have different data protection 
                    requirements (such as GDPR in Europe or CCPA in California). The instance operator is 
                    responsible for complying with applicable laws based on their server location and user base.
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
                    <strong>For Legal Compliance:</strong> If you have specific questions about data handling 
                    for your jurisdiction, please contact the instance operator directly using the contact 
                    information provided below.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
              <div className="text-muted-foreground">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  material changes by posting the new privacy policy on this page and updating the 
                  effective date. Your continued use of the platform after such changes constitutes 
                  acceptance of the new policy.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <div className="text-muted-foreground space-y-2">
                <p>If you have questions about this privacy policy or your personal information:</p>
                <p><strong>Email:</strong> {adminInfo.email}</p>
                <p className="text-sm">
                  For additional contact methods or if a physical address is required in your jurisdiction, 
                  please refer to the platform&apos;s main contact information or reach out via email.
                </p>
              </div>
            </section>

            {/* Open Source Notice */}
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