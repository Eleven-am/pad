import { Dashboard } from "@/components/dashboard/dashboard";
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

	return <Dashboard metrics={metrics} />;
}
