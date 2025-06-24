"use client";

import { useEffect, useRef, useCallback } from 'react';
import { cuid } from '@paralleldrive/cuid2';

interface UseReadingTrackerProps {
  postId: string;
  userId?: string | null;
  totalWordCount: number;
  enabled?: boolean;
}

function getAnonymousId(): string {
  const key = 'pad_anonymous_id';
  let anonymousId = localStorage.getItem(key);
  
  if (!anonymousId) {
    anonymousId = cuid();
    localStorage.setItem(key, anonymousId);
  }
  
  return anonymousId;
}

export function useReadingTracker({ 
  postId, 
  userId, 
  totalWordCount,
  enabled = true 
}: UseReadingTrackerProps) {
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const timeSpentRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const isVisibleRef = useRef(true);
  const hasSentBeaconRef = useRef(false);
  const anonymousIdRef = useRef<string | null>(null);

  // Initialize anonymous ID on client side only
  useEffect(() => {
    if (!userId && typeof window !== 'undefined') {
      anonymousIdRef.current = getAnonymousId();
    }
  }, [userId]);

  // Function to calculate and update time spent
  const updateTimeSpent = useCallback(() => {
    if (isVisibleRef.current) {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000; // in seconds
      timeSpentRef.current += elapsed;
      lastTickRef.current = now;
    }
  }, []);

  // Calculate if user has completed reading
  const calculateCompletion = useCallback(() => {
    // Estimate reading time based on average reading speed (225 words per minute)
    const estimatedReadTimeInSeconds = (totalWordCount / 225) * 60;
    const minimumReadTime = estimatedReadTimeInSeconds * 0.5; // 50% of estimated time
    
    return maxScrollRef.current >= 0.9 && timeSpentRef.current >= minimumReadTime;
  }, [totalWordCount]);

  // The function that sends the final data
  const sendBeacon = useCallback(() => {
    if (!enabled || hasSentBeaconRef.current) return;
    
    updateTimeSpent(); // Final time update
    
    // Don't send if user barely interacted with the page
    if (timeSpentRef.current < 2 && maxScrollRef.current < 0.1) {
      return;
    }
    
    const payload = {
      postId,
      userId: userId || null,
      anonymousId: !userId ? anonymousIdRef.current : null,
      scrollDepth: Math.round(maxScrollRef.current * 100) / 100, // Round to 2 decimal places
      timeSpent: Math.round(timeSpentRef.current),
      completed: calculateCompletion(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
    };

    // Use sendBeacon for reliability on exit
    const sent = navigator.sendBeacon('/api/track-read', JSON.stringify(payload));
    
    if (!sent) {
      // Fallback to fetch if sendBeacon fails
      fetch('/api/track-read', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch(console.error);
    }
    
    hasSentBeaconRef.current = true;
  }, [postId, userId, enabled, updateTimeSpent, calculateCompletion]);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      const scrollMax = scrollHeight - clientHeight;
      const scrollPercent = scrollMax > 0 ? scrollTop / scrollMax : 0;
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = Math.min(scrollPercent, 1); // Cap at 1
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isVisibleRef.current = false;
        updateTimeSpent(); // Update time when tab becomes hidden
        sendBeacon(); // Send data when user switches tabs/minimizes
      } else {
        isVisibleRef.current = true;
        lastTickRef.current = Date.now(); // Reset timer tick
        hasSentBeaconRef.current = false; // Allow sending again when visible
      }
    };
    
    // Track time in intervals
    const interval = setInterval(updateTimeSpent, 5000);

    // Initial scroll position
    handleScroll();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Use 'pagehide' for mobile, it's more reliable than 'beforeunload'
    window.addEventListener('pagehide', sendBeacon);
    
    // Also listen to beforeunload as a backup
    window.addEventListener('beforeunload', sendBeacon);

    return () => {
      // Cleanup: send final beacon on component unmount (e.g., SPA navigation)
      sendBeacon();
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendBeacon);
      window.removeEventListener('beforeunload', sendBeacon);
    };
  }, [enabled, sendBeacon, updateTimeSpent]);

  // Return current stats for debugging or display purposes
  return {
    currentScrollDepth: maxScrollRef.current,
    currentTimeSpent: timeSpentRef.current,
    isCompleted: calculateCompletion(),
  };
}