"use client";

import {useCallback, useEffect, useState} from "react";
import {unwrap} from "@/lib/unwrap";
import {getPublicUrl} from "@/lib/data";

export function useFileId(fileId: string) {
	const [url, setUrl] = useState ("");
	
	const getFileUrl = useCallback(async () => {
		const url = await unwrap(getPublicUrl(fileId));
		setUrl(url as string);
	}, [fileId]);
	
	useEffect(() => void getFileUrl(), [getFileUrl]);
	
	return {
		url,
		isLoading: !url,
		reload: getFileUrl
	};
}
