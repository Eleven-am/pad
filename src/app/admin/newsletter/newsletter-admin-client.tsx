"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, UserCheck, UserX, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendNewsletterBroadcast } from '@/app/actions/newsletter';
import { NewsletterBroadcastResult } from '@/services/newsletterService';

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  recentSubscriptions: number;
}

interface NewsletterAdminClientProps {
  initialStats: NewsletterStats | null;
}

export function NewsletterAdminClient({ initialStats }: NewsletterAdminClientProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [senderName, setSenderName] = useState('Pad Newsletter');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewsletterBroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      setError('Please fill in both subject and content fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const broadcastResult = await sendNewsletterBroadcast({
        subject: subject.trim(),
        content: content.trim(),
        previewText: previewText.trim() || undefined,
        senderName: senderName.trim() || 'Pad Newsletter'
      });

      setResult(broadcastResult);
      
      // Clear form on success if all emails were sent
      if (broadcastResult.failed === 0) {
        setSubject('');
        setContent('');
        setPreviewText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {initialStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{initialStats.total}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total Subscribers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold">{initialStats.active}</div>
              </div>
              <p className="text-xs text-muted-foreground">Active Subscribers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold">{initialStats.unsubscribed}</div>
              </div>
              <p className="text-xs text-muted-foreground">Unsubscribed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold">{initialStats.recentSubscriptions}</div>
              </div>
              <p className="text-xs text-muted-foreground">New (30 days)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Newsletter Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Newsletter</CardTitle>
          <CardDescription>
            Compose and send a newsletter to all active subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender">Sender Name</Label>
                <Input
                  id="sender"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Pad Newsletter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your newsletter subject..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview">Preview Text (optional)</Label>
              <Input
                id="preview"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Short preview text that appears in email clients..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here... You can use HTML tags for formatting."
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a&gt; for formatting.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                {initialStats && (
                  <>Will be sent to {initialStats.active} active subscribers</>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Newsletter
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Newsletter Sent!</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Recipients</div>
                <div className="text-muted-foreground">{result.totalSubscribers}</div>
              </div>
              <div>
                <div className="font-medium">Successfully Sent</div>
                <div className="text-green-600">{result.emailsSent}</div>
              </div>
              <div>
                <div className="font-medium">Failed</div>
                <div className="text-red-600">{result.failed}</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <div className="font-medium text-sm mb-2">Errors:</div>
                <div className="space-y-1">
                  {result.errors.map((error, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {error}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}