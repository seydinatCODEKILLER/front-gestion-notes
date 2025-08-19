import { DashboardView } from "@features/admin/dashboard/DashboardView";

export const dashbaordRoutes = [
  {
    path: "/admin/dashboard",
    component: DashboardView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Dashboard",
    },
  },
];
