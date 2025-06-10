"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 6 * 1000,
			},
		},
	});
}

interface QueryProviderProps {
	children: ReactNode;
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (isServer) {
		return makeQueryClient();
		
	} else {
		if (!browserQueryClient) {
			browserQueryClient = makeQueryClient();
		}

		return browserQueryClient;
	}
}

export function QueryProvider({ children }: QueryProviderProps) {
	const queryClient = getQueryClient();
	
	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}