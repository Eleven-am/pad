import { useState, useCallback } from 'react';

interface UploadProgress {
	loaded: number;
	total: number;
	percentage: number;
}

interface UseFileUploadReturn<Data> {
	response: Data | null;
	error: string | null;
	progress: UploadProgress | null;
	isUploading: boolean;
	uploadFile: (file: File, endpoint: string, options?: UploadOptions<Data>) => Promise<void>;
	reset: () => void;
}

interface UploadOptions<Data> {
	headers?: Record<string, string>;
	fieldName?: string;
	additionalData?: Record<string, string | Blob>;
	timeout?: number;
	onUploadComplete?: (response: Data, file: File) => void;
}

export function useFileUpload<Data>(): UseFileUploadReturn<Data> {
	const [response, setResponse] = useState<Data | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<UploadProgress | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	
	const reset = useCallback(() => {
		setResponse(null);
		setError(null);
		setProgress(null);
		setIsUploading(false);
	}, []);
	
	const uploadFile = useCallback(async (
		file: File,
		endpoint: string,
		options: UploadOptions<Data> = {}
	) => {
		const {
			headers = {},
			fieldName = 'file',
			additionalData = {},
			timeout = 0,
			onUploadComplete
		} = options;
		
		// Reset previous state
		setResponse(null);
		setError(null);
		setProgress(null);
		setIsUploading(true);
		
		return new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			
			const formData = new FormData();
			formData.append(fieldName, file);
			
			Object.entries(additionalData).forEach(([key, value]) => {
				formData.append(key, value);
			});
			
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progressData: UploadProgress = {
						loaded: event.loaded,
						total: event.total,
						percentage: Math.round((event.loaded / event.total) * 100)
					};
					setProgress(progressData);
				}
			});
			
			xhr.addEventListener('load', () => {
				setIsUploading(false);
				
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const responseData = xhr.responseText ? JSON.parse(xhr.responseText) : null;
						setResponse(responseData);
						if (onUploadComplete) {
							onUploadComplete(responseData.file, file);
						}
						
						resolve();
					} catch (parseError) {
						const errorMessage = `Failed to parse response: ${(parseError as Error).message}`;
						setError(errorMessage);
						reject(new Error(errorMessage));
					}
				} else {
					const errorMessage = `Upload failed with status ${xhr.status}: ${xhr.statusText}`;
					setError(errorMessage);
					reject(new Error(errorMessage));
				}
			});
			
			xhr.addEventListener('error', () => {
				setIsUploading(false);
				const errorMessage = 'Network error occurred during upload';
				setError(errorMessage);
				reject(new Error(errorMessage));
			});
			
			xhr.addEventListener('timeout', () => {
				setIsUploading(false);
				const errorMessage = 'Upload request timed out';
				setError(errorMessage);
				reject(new Error(errorMessage));
			});
			
			xhr.addEventListener('abort', () => {
				setIsUploading(false);
				const errorMessage = 'Upload was aborted';
				setError(errorMessage);
				reject(new Error(errorMessage));
			});
			
			xhr.open('POST', endpoint);
			
			Object.entries(headers).forEach(([key, value]) => {
				xhr.setRequestHeader(key, value);
			});
			
			if (timeout > 0) {
				xhr.timeout = timeout;
			}
			
			xhr.send(formData);
		});
	}, []);
	
	return {
		response,
		error,
		progress,
		isUploading,
		uploadFile,
		reset
	};
};