import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {cache} from "react";
import {hasError, Result} from "@eleven-am/fp";

type Statement = {
	post: [('create' | 'read' | 'update' | 'delete' | 'publish'), ...('create' | 'read' | 'update' | 'delete' | 'publish')[]];
	file: [('upload' | 'read' | 'delete'), ...('upload' | 'read' | 'delete')[]];
	category: [('create' | 'read' | 'update' | 'delete'), ...('create' | 'read' | 'update' | 'delete')[]];
	tag: [('create' | 'read' | 'update' | 'delete'), ...('create' | 'read' | 'update' | 'delete')[]];
	analytics: ['read'];
	webhook: [('create' | 'read' | 'update' | 'delete'), ...('create' | 'read' | 'update' | 'delete')[]];
};

type FailedResult = {
	code: number;
	error: string;
}

type SuccessResult<T> = {
	data: T;
	success: true;
}

export type PadResult<T> = SuccessResult<T> | FailedResult;

export function guard<T extends keyof Statement>(
	statement: Pick<Statement, T>
) {
	return function <TArgs extends readonly unknown[], TResult>(
		fn: (...args: TArgs) => Promise<Result<TResult>>
	) {
		return async (...args: TArgs): Promise<PadResult<TResult>> => {
			const session = await auth.api.getSession({
				headers: await headers()
			});
			
			if (!session || !session.user) {
				return {
					code: 401,
					error: 'Unauthorized: You must be logged in to perform this action',
				};
			}
			
			const { error, success } = await auth.api.userHasPermission({
				body: {
					userId: session.user.id,
					permissions: {
						...statement,
					},
				},
			});
			
			if (!success || error) {
				return {
					code: 403,
					error: 'Unauthorized: You do not have permission to perform this action',
				};
			}
			
			const result = await fn(...args);
			if (hasError(result)) {
				return {
					code: result.code,
					error: result.error.message || 'An error occurred while processing your request',
				};
			}
			
			return {
				data: result.data,
				success: true,
			};
		};
	};
}

export const cachedGuard = <T extends keyof Statement>(
	statement: Pick<Statement, T>
) => {
	const guardFn = guard(statement);
	return <TArgs extends readonly unknown[], TResult>(
		fn: (...args: TArgs) => Promise<Result<TResult>>
	) => {
		return cache(guardFn(fn));
	};
}

const mapResultToPadResult = <
	TArgs extends readonly unknown[],
	TResult
>(fn: (...args: TArgs) => Promise<Result<TResult>>) => {
	return async (...args: TArgs): Promise<PadResult<TResult>> => {
		const result = await fn(...args);
		if (hasError(result)) {
			return {
				code: result.code,
				error: result.error.message || 'An error occurred while processing your request',
			};
		}
		return {
			data: result.data,
			success: true,
		};
	};
}

export const padCache = <
	TArgs extends readonly unknown[],
	TResult
>(fn: (...args: TArgs) => Promise<Result<TResult>>): ((...args: TArgs) => Promise<PadResult<TResult>>) => {
	return cache(mapResultToPadResult(fn)) as (...args: TArgs) => Promise<PadResult<TResult>>;
}
