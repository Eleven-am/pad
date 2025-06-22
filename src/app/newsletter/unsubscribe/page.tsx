import { Suspense } from 'react';
import { UnsubscribeClient } from './unsubscribe-client';

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <UnsubscribeClient />
        </Suspense>
      </div>
    </div>
  );
}