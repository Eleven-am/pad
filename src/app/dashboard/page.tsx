import { DashboardEnhanced } from "@/components/dashboard/dashboard-enhanced";
import { getDashboardMetrics } from "@/lib/dashboard-data";
import { auth } from "@/lib/better-auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers()
	});

	if (!session) {
		redirect("/auth");
	}

	const metrics = await getDashboardMetrics(session.user.id);

	return <DashboardEnhanced metrics={metrics} />;
}
