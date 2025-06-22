"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { fileUrlCache, CACHE_DURATION, pendingRequests } from "./useFileId";

interface FileUrlResult {
	fileId: string;
	url: string;
	error?: string;
}

interface UseFileIdsReturn {
	urls: Map<string, string>;
	loading: boolean;
	errors: Map<string, string>;
	reload: () => void;
}

// Batch API endpoint type (for future use)
interface _BatchFileUrlResponse {
	files: Array<{
		fileId: string;
		url?: string;
		error?: string;
	}>;
}

// Singleton batch request cache
const pendingBatchRequests = new Map<string, Promise<FileUrlResult[]>>();

export function useFileIds(fileIds: string[]): UseFileIdsReturn {
	const [urls, setUrls] = useState<Map<string, string>>(new Map());
	const [loading, setLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<Map<string, string>>(new Map());
	
	// Use refs to track component mount state
	const isMounted = useRef(true);
	const abortControllerRef = useRef<AbortController | null>(null);
	
	// Memoize the sorted file IDs to create a stable cache key (for future use)
	const _sortedFileIds = useMemo(() => {
		return [...fileIds].sort().join(',');
	}, [fileIds]);
	
	// Check cache for all file IDs
	const { cachedUrls, uncachedIds } = useMemo(() => {
		const cached = new Map<string, string>();
		const uncached: string[] = [];
		
		fileIds.forEach(id => {
			if (!id) return;
			
			const cachedEntry = fileUrlCache.get(id);
			if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
				cached.set(id, cachedEntry.url);
			} else {
				// Remove expired cache entry
				if (cachedEntry) {
					fileUrlCache.delete(id);
				}
				uncached.push(id);
			}
		});
		
		return { cachedUrls: cached, uncachedIds: uncached };
	}, [fileIds]);
	
	// Batch fetch function
	const fetchBatchFileUrls = useCallback(async (ids: string[], signal: AbortSignal): Promise<FileUrlResult[]> => {
		if (ids.length === 0) return [];
		
		// Create a stable key for the batch request
		const batchKey = ids.sort().join(',');
		
		// Check if there's already a pending batch request
		const pendingRequest = pendingBatchRequests.get(batchKey);
		if (pendingRequest) {
			return pendingRequest;
		}
		
		// For now, we'll make individual requests in parallel
		// In a real implementation, you'd have a batch endpoint
		const requestPromise = Promise.all(
			ids.map(async (id): Promise<FileUrlResult> => {
				try {
					// Check individual pending requests first
					const pending = pendingRequests.get(id);
					if (pending) {
						const url = await pending;
						return { fileId: id, url };
					}
					
					const response = await fetch(`/api/files/${id}/public-url`, { signal });
					
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					const data = await response.json();
					
					if (data.error) {
						throw new Error(data.error);
					}
					
					// Cache the successful result
					fileUrlCache.set(id, { url: data.url, timestamp: Date.now() });
					
					return { fileId: id, url: data.url };
				} catch (error) {
					return {
						fileId: id,
						url: '',
						error: error instanceof Error ? error.message : 'Failed to load image'
					};
				}
			})
		).finally(() => {
			// Clean up pending batch request
			pendingBatchRequests.delete(batchKey);
		});
		
		// Store pending batch request
		pendingBatchRequests.set(batchKey, requestPromise);
		
		return requestPromise;
	}, []);
	
	// Main function to get file URLs
	const getFileUrls = useCallback(async () => {
		// Cancel any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		
		if (fileIds.length === 0) {
			setUrls(new Map());
			setErrors(new Map());
			setLoading(false);
			return;
		}
		
		// Start with cached URLs
		const newUrls = new Map(cachedUrls);
		const newErrors = new Map<string, string>();
		
		// If all are cached, we're done
		if (uncachedIds.length === 0) {
			setUrls(newUrls);
			setErrors(newErrors);
			setLoading(false);
			return;
		}
		
		// Create new abort controller
		const abortController = new AbortController();
		abortControllerRef.current = abortController;
		
		setLoading(true);
		
		try {
			const results = await fetchBatchFileUrls(uncachedIds, abortController.signal);
			
			// Only update state if component is still mounted and request wasn't aborted
			if (isMounted.current && !abortController.signal.aborted) {
				results.forEach(result => {
					if (result.url) {
						newUrls.set(result.fileId, result.url);
					}
					if (result.error) {
						newErrors.set(result.fileId, result.error);
					}
				});
				
				setUrls(newUrls);
				setErrors(newErrors);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}
			
			// Only update error state if component is still mounted
			if (isMounted.current && !abortController.signal.aborted) {
				console.error('Error fetching file URLs:', err);
				// Set error for all uncached IDs
				uncachedIds.forEach(id => {
					newErrors.set(id, err instanceof Error ? err.message : 'Failed to load image');
				});
				setErrors(newErrors);
			}
		} finally {
			// Only update loading state if component is still mounted
			if (isMounted.current && !abortController.signal.aborted) {
				setLoading(false);
			}
		}
	}, [fileIds, cachedUrls, uncachedIds, fetchBatchFileUrls]);
	
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
	
	// Effect to fetch URLs when fileIds change
	useEffect(() => {
		void getFileUrls();
	}, [getFileUrls]);
	
	// Memoized return value to prevent unnecessary re-renders
	return useMemo(() => ({
		urls,
		loading,
		errors,
		reload: getFileUrls
	}), [urls, loading, errors, getFileUrls]);
}