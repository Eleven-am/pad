"use client";

// Client-side data fetching functions that can be used in components
// These functions make API calls instead of direct server function calls

// Simple in-memory cache for public URLs
const urlCache = new Map<string, Promise<string>>();

export function getPublicUrlClient(fileId: string): Promise<string> {
  // Return cached promise if it exists
  if (urlCache.has(fileId)) {
    return urlCache.get(fileId)!;
  }

  // Create new promise and cache it
  const promise = fetch(`/api/files/${fileId}/public-url`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch public URL');
      }
      return response.json();
    })
    .then(data => data.url);

  urlCache.set(fileId, promise);
  return promise;
}