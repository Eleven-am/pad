"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/app/actions/newsletter';

export function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setResult({
        success: false,
        message: 'Please enter your email address.'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const unsubscribeResult = await unsubscribeFromNewsletter(email.trim());
      setResult(unsubscribeResult);
    } catch {
      setResult({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mail className="h-5 w-5" />
          Unsubscribe from Newsletter
        </CardTitle>
        <CardDescription>
          We&apos;re sorry to see you go. Enter your email address to unsubscribe from our newsletter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result ? (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className={`flex items-center justify-center gap-2 ${
              result.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {result.success ? 'Unsubscribed Successfully' : 'Error'}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {result.message}
            </p>

            {result.success && (
              <p className="text-xs text-muted-foreground">
                You will no longer receive newsletters from us. If you change your mind, 
                you can always subscribe again from our homepage.
              </p>
            )}

            {!result.success && (
              <Button 
                onClick={() => setResult(null)} 
                variant="outline" 
                size="sm"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}