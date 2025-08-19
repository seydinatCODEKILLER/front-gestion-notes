import { AuthGuard } from "@/app/guard/AuthGuard";
import { AdminGuard } from "@/app/guard/RoleGuard";
import { DashboardView } from "@features/admin/dashboard/DashboardView";
import { AdminNiveauView } from "../features/admin/niveaux/NiveauView.js";

export const adminRoutes = [
  {
    path: "/admin/dashboard",
    component: DashboardView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Dashboard",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/niveaux",
    component: AdminNiveauView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Niveaux",
    },
    guards: [AuthGuard, AdminGuard],
  },
];
