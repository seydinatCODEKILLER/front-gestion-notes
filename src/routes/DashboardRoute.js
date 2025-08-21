import { AuthGuard } from "@/app/guard/AuthGuard";
import { AdminGuard } from "@/app/guard/RoleGuard";
import { DashboardView } from "@features/admin/dashboard/DashboardView";
import { AdminNiveauView } from "../features/admin/niveaux/NiveauView.js";
import { AdminAnneeScolaireView } from "@/features/admin/annee_scolaire/AdminAnneeScolaireView.js";
import { AdminTrimestreView } from "@/features/admin/trimestre/AdminTrimestreView.js";
import { AdminClassView } from "@/features/admin/classe/AdminClassView.js";
import { AdminTeacherView } from "@/features/admin/professeur/AdminTeacherView.js";
import { AdminStudentView } from "@/features/admin/etudiant/AdminStudentView.js";
import { AdminSubjectView } from "@/features/admin/matieres/AdminSubjectView.js";
import { AdminTeacherSubjectView } from "@/features/admin/teacher_subject/AdminTeacherSubjectView.js";
import { AdminClassSubjectView } from "@/features/admin/classe_subject/AdminClassSubjectView.js";
import { AdminReportCardView } from "@/features/admin/bulletins/AdminReportCardView.js";

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
  {
    path: "/admin/annees",
    component: AdminAnneeScolaireView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Annees scolaire",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/trimestres",
    component: AdminTrimestreView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Trimestres",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/classes",
    component: AdminClassView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Classes",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/professeurs",
    component: AdminTeacherView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Professeurs",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/etudiants",
    component: AdminStudentView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Etudiants",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/matieres",
    component: AdminSubjectView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Matieres",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/affectations",
    component: AdminTeacherSubjectView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Affectation matieres",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/bulletins",
    component: AdminReportCardView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      title: "Admin | Bulletins",
    },
    guards: [AuthGuard, AdminGuard],
  },

];
