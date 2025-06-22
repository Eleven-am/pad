"use client";

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

interface NewsletterFormProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function NewsletterForm({ 
  source = 'homepage',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  className = ''
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your email address'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await subscribeToNewsletter(email.trim(), source);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message
        });
        setEmail(''); // Clear form on success
      } else {
        setStatus({
          type: result.alreadySubscribed ? 'info' : 'error',
          message: result.message
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Mail className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusTextColor = () => {
    switch (status.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg border bg-background"
          required
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Subscribing...' : buttonText}
        </button>
      </form>
      
      {status.message && (
        <div className={`flex items-center justify-center gap-2 mt-3 text-sm ${getStatusTextColor()}`}>
          {getStatusIcon()}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}