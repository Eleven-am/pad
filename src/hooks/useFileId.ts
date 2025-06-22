"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";

// Simple in-memory cache for file URLs
export const fileUrlCache = new Map<string, { url: string; timestamp: number }>();
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Singleton promise cache to prevent duplicate requests
export const pendingRequests = new Map<string, Promise<string>>();

interface UseFileIdReturn {
	url: string;
	loading: boolean;
	isLoading: boolean; // Backward compatibility
	error: string | null;
	reload: () => void;
}

export function useFileId(fileId: string): UseFileIdReturn {
	const [url, setUrl] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	
	// Use refs to track component mount state
	const isMounted = useRef(true);
	const abortControllerRef = useRef<AbortController | null>(null);
	
	// Memoized cache check
	const cachedUrl = useMemo(() => {
		if (!fileId) return null;
		
		const cached = fileUrlCache.get(fileId);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.url;
		}
		
		// Remove expired cache entry
		if (cached) {
			fileUrlCache.delete(fileId);
		}
		
		return null;
	}, [fileId]);
	
	// Memoized fetch function
	const fetchFileUrl = useCallback(async (id: string, signal: AbortSignal): Promise<string> => {
		// Check if there's already a pending request for this file ID
		const pendingRequest = pendingRequests.get(id);
		if (pendingRequest) {
			return pendingRequest;
		}
		
		// Create new request promise
		const requestPromise = fetch(`/api/files/${id}/public-url`, { signal })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				
				const data = await response.json();
				
				if (data.error) {
					throw new Error(data.error);
				}
				
				// Cache the successful result
				fileUrlCache.set(id, { url: data.url, timestamp: Date.now() });
				
				return data.url;
			})
			.finally(() => {
				// Clean up pending request
				pendingRequests.delete(id);
			});
		
		// Store pending request
		pendingRequests.set(id, requestPromise);
		
		return requestPromise;
	}, []);
	
	// Main function to get file URL
	const getFileUrl = useCallback(async () => {
		// Cancel any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		
		if (!fileId) {
			setUrl("");
			setLoading(false);
			setError(null);
			return;
		}
		
		// Check cache first
		const cached = cachedUrl;
		if (cached) {
			setUrl(cached);
			setLoading(false);
			setError(null);
			return;
		}
		
		// Create new abort controller
		const abortController = new AbortController();
		abortControllerRef.current = abortController;
		
		setLoading(true);
		setError(null);
		
		try {
			const fetchedUrl = await fetchFileUrl(fileId, abortController.signal);
			
			// Only update state if component is still mounted and request wasn't aborted
			if (isMounted.current && !abortController.signal.aborted) {
				setUrl(fetchedUrl);
				setError(null);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}
			
			// Only update error state if component is still mounted
			if (isMounted.current && !abortController.signal.aborted) {
				console.error('Error fetching file URL:', err);
				setError(err instanceof Error ? err.message : 'Failed to load image');
				setUrl("");
			}
		} finally {
			// Only update loading state if component is still mounted
			if (isMounted.current && !abortController.signal.aborted) {
				setLoading(false);
			}
		}
	}, [fileId, cachedUrl, fetchFileUrl]);
	
	// Effect to handle cleanup
	useEffect(() => {
		isMounted.current = true;
		
		return () => {
			isMounted.current = false;
			// Cancel any pending request when component unmounts
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);
	
	// Effect to fetch URL when fileId changes
	useEffect(() => {
		void getFileUrl();
	}, [getFileUrl]);
	
	// Memoized return value to prevent unnecessary re-renders
	return useMemo(() => ({
		url,
		loading,
		isLoading: loading, // Backward compatibility
		error,
		reload: getFileUrl
	}), [url, loading, error, getFileUrl]);
}

// Optional: Export cache control functions for manual cache management
export const clearFileUrlCache = () => {
	fileUrlCache.clear();
	pendingRequests.clear();
};

export const removeFromFileUrlCache = (fileId: string) => {
	fileUrlCache.delete(fileId);
	pendingRequests.delete(fileId);
};