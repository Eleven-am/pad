import { Card, CardContent } from "@/components/ui/card";

export function BlockLoading({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardContent className="flex h-64 items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
			</CardContent>
		</Card>
	);
}
