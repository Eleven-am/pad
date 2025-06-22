import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Software License & Disclaimer',
  description: 'License and disclaimer for Pad open-source software',
}

export default function SoftwareLicensePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Pad Software License & Disclaimer</h1>
            <p className="text-muted-foreground text-lg">
              Open-source blogging platform licensed under GPL-3.0
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            
            {/* Software Information */}
            <section className="bg-muted/30 rounded-lg p-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Software:</strong> Pad</p>
                <p><strong>Version:</strong> Open Source</p>
                <p><strong>Developer:</strong> Roy OSSAI</p>
                <p><strong>License:</strong> GPL-3.0</p>
                <p><strong>Repository:</strong> <a href="https://github.com/eleven-am/pad" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://github.com/eleven-am/pad</a></p>
              </div>
            </section>

            {/* Important Notice */}
            <section className="border-l-4 border-red-500 pl-6 bg-red-50/50 dark:bg-red-950/20 py-4">
              <h3 className="text-lg font-medium mb-2 text-red-800 dark:text-red-200">Important Legal Notice</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                This page explains the legal relationship between the Pad software itself and individual 
                instances operated by third parties. Roy OSSAI (the software developer) has no access to, 
                control over, or liability for individual instances of this software.
              </p>
            </section>

            {/* GPL-3.0 License Summary */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Open Source License (GPL-3.0)</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Pad is free and open-source software licensed under the GNU General Public License v3.0. 
                  This means you have the freedom to:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Use the software for any purpose</li>
                  <li>• Study how the software works and modify it</li>
                  <li>• Distribute copies of the software</li>
                  <li>• Distribute modified versions of the software</li>
                </ul>
                <p className="text-sm">
                  For the complete license terms, visit: <a 
                    href="https://www.gnu.org/licenses/gpl-3.0.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.gnu.org/licenses/gpl-3.0.html
                  </a>
                </p>
              </div>
            </section>

            {/* Software Developer Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Software Developer Disclaimers</h2>
              <div className="text-muted-foreground space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">No Warranties</h3>
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    Pad software is provided &quot;AS IS&quot; without warranty of any kind. Roy OSSAI 
                    disclaims all warranties, express or implied, including but not limited to warranties 
                    of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">No Liability</h3>
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Roy OSSAI shall not be liable for any damages arising from the use of Pad software, 
                    including but not limited to direct, indirect, incidental, consequential, or punitive 
                    damages, even if advised of the possibility of such damages.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">No Data Access</h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Roy OSSAI has no access to, control over, or knowledge of any data stored on individual 
                    instances of Pad. Each instance operator is solely responsible for their deployment, 
                    data handling, and compliance with applicable laws.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">No Trademark License</h3>
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    This license does not grant you any right to use the &quot;Pad&quot; name, logo, or other 
                    trademarks of the project in a way that suggests endorsement by the developer. You are 
                    responsible for branding your own instance appropriately.
                  </p>
                </div>
              </div>
            </section>

            {/* Instance Operator Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Instance Operator Responsibilities</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  When you deploy Pad on your infrastructure, you become the operator of that instance 
                  and assume full responsibility for:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Server security and maintenance</li>
                  <li>• User data protection and privacy compliance</li>
                  <li>• Content moderation and community guidelines</li>
                  <li>• Legal compliance in your jurisdiction</li>
                  <li>• Terms of service and privacy policy for your users</li>
                  <li>• Backup and disaster recovery procedures</li>
                  <li>• Software updates and security patches</li>
                </ul>
                <p className="text-sm italic">
                  Note: This software includes template privacy policy and terms of service documents 
                  that instance operators must customize for their specific deployment and jurisdiction.
                </p>
              </div>
            </section>

            {/* No Support Obligations */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">No Support Obligations</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  Pad is a passion project developed and maintained by Roy OSSAI. There are no guarantees 
                  regarding:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Ongoing development or updates</li>
                  <li>• Technical support or assistance</li>
                  <li>• Bug fixes or feature requests</li>
                  <li>• Compatibility with future technologies</li>
                  <li>• Migration assistance between versions</li>
                </ul>
                <p className="text-sm">
                  While the software is actively maintained as of June 2024, this may change at any time 
                  without notice. Users are encouraged to fork the repository if they require guaranteed 
                  ongoing maintenance.
                </p>
              </div>
            </section>

            {/* Independent Operation */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Independent Instance Operation</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  Each deployment of Pad operates independently. Roy OSSAI:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Cannot access data on any instance</li>
                  <li>• Is not responsible for instance uptime or availability</li>
                  <li>• Does not monitor or moderate individual instances</li>
                  <li>• Cannot assist with instance-specific technical issues</li>
                  <li>• Is not liable for content posted on any instance</li>
                  <li>• Does not collect analytics or usage data from instances</li>
                </ul>
              </div>
            </section>

            {/* Modification and Distribution */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Modification and Distribution</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  Under the GPL-3.0 license, you may modify and redistribute Pad software, provided you:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• Include the original copyright notice</li>
                  <li>• License your modifications under GPL-3.0</li>
                  <li>• Provide source code for any distributed modifications</li>
                  <li>• Document any changes made to the original software</li>
                </ul>
                <p className="text-sm">
                  Modified versions should clearly indicate they are not the original Pad software to 
                  avoid confusion about support and responsibility.
                </p>
              </div>
            </section>

            {/* Contact and Contributions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact and Contributions</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  For questions about the Pad software itself (not individual instances):
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• GitHub Repository: <a href="https://github.com/eleven-am/pad" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://github.com/eleven-am/pad</a></li>
                  <li>• Developer: Roy OSSAI (<a href="https://github.com/eleven-am" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@eleven-am</a>)</li>
                </ul>
                <p className="text-sm">
                  Contributions via pull requests are welcome, but acceptance is at the sole discretion 
                  of the maintainer. No contributor agreements or support obligations are implied.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <div className="text-muted-foreground">
                <p>
                  These disclaimers and the GPL-3.0 license are governed by French law. Any disputes 
                  related to the Pad software itself (not individual instances) shall be subject to 
                  the jurisdiction of French courts.
                </p>
              </div>
            </section>

            {/* Footer */}
            <section className="border-t pt-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Pad - Open Source Blogging Platform<br />
                  Built with ❤️ by <a 
                    href="https://github.com/eleven-am" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Roy OSSAI
                  </a> in France
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}