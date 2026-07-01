import { dashboardStats, analyticsData } from '../data/mockData.js';

/**
 * Placeholder analytics service providing dashboard and exam readiness data.
 */

export function getDashboardAnalytics() {
  return Promise.resolve(dashboardStats);
}

export function getExamReadiness() {
  return Promise.resolve({ readiness: analyticsData.readiness });
}