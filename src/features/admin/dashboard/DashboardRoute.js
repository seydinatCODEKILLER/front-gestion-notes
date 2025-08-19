import { AuthGuard } from "@/app/guard/AuthGuard";
import { AdminGuard } from "@/app/guard/RoleGuard";
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
    guards: [AuthGuard, AdminGuard]
  },
];
