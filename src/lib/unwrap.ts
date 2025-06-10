"use client";

import {PadResult} from "@/lib/guard";

export async function unwrap<T>(result: Promise<PadResult<T>>): Promise<T> {
	const res = await result;

	if ('success' in res && res.success) {
		return res.data;
	}
	
	const error = 'error' in res ? res.error : 'An unknown error occurred';
	throw new Error(error);
}
