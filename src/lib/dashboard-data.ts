import {dashboardEnhancedService, dashboardService} from '@/services/di';
import {ActivityItem, DashboardMetrics, TimeSeriesMetric} from '@/services/dashboardService';
import {
	ActivityMetrics,
	ContentQualityMetrics,
	PipelineMetrics,
	SocialEngagementMetrics
} from '@/services/dashboardEnhancedService';

/**
 * Fetches comprehensive dashboard metrics
 * @param userId - Optional user ID to filter metrics for specific user
 * @returns Dashboard metrics
 */
export async function getDashboardMetrics(userId?: string): Promise<DashboardMetrics> {
	return await dashboardService.getDashboardMetrics (userId).toPromise ();
}

/**
 * Fetches time series metrics for charts
 * @param days - Number of days to look back
 * @param userId - Optional user ID to filter for specific user
 * @returns Time series metrics
 */
export async function getTimeSeriesMetrics(days: number = 7, userId?: string): Promise<TimeSeriesMetric[]> {
	return await dashboardService.getTimeSeriesMetrics (days, userId).toPromise ();
}

/**
 * Fetches recent activity feed
 * @param limit - Number of activity items to return
 * @param userId - Optional user ID to filter for specific user
 * @returns Recent activity items
 */
export async function getRecentActivity(limit: number = 10, userId?: string): Promise<ActivityItem[]> {
	return await dashboardService.getRecentActivity (limit, userId).toPromise ();
}

/**
 * Fetches pipeline metrics
 * @param userId - Optional user ID to filter for specific user
 * @returns Pipeline metrics
 */
export async function getPipelineMetrics(userId?: string): Promise<PipelineMetrics> {
	return await dashboardEnhancedService.getPipelineMetrics (userId).toPromise ();
}

/**
 * Fetches content quality metrics
 * @param userId - Optional user ID to filter for specific user
 * @returns Content quality metrics
 */
export async function getContentQualityMetrics(userId?: string): Promise<ContentQualityMetrics> {
	return await dashboardEnhancedService.getContentQualityMetrics (userId).toPromise ();
}

/**
 * Fetches today's activity metrics
 * @param userId - Optional user ID to filter for specific user
 * @returns Activity metrics
 */
export async function getTodayActivityMetrics(userId?: string): Promise<ActivityMetrics> {
	return await dashboardEnhancedService.getTodayActivityMetrics (userId).toPromise ();
}

/**
 * Fetches social engagement metrics
 * @param userId - Optional user ID to filter for specific user
 * @returns Social engagement metrics
 */
export async function getSocialEngagementMetrics(userId?: string): Promise<SocialEngagementMetrics> {
	return await dashboardEnhancedService.getSocialEngagementMetrics (userId).toPromise ();
}