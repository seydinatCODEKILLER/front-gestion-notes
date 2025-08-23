import { AuthGuard } from "@/app/guard/AuthGuard";
import { TeacherGuard } from "@/app/guard/RoleGuard";
import { TeacherClassView } from "@/features/teacher/classes/TeacherClassView";
import { AdminEvaluationView } from "@/features/teacher/evaluation/AdminEvaluationView";
import { TeacherSubjectView } from "@/features/teacher/matieres/TeacherSubjectView";
import { AverageView } from "@/features/teacher/moyenne/AverageView";
import { AdminEvaluationNoteView } from "@/features/teacher/notes/AdminEvaluationNoteView";


export const teacherRoutes = [
  {
    path: "/teacher/classes",
    component: TeacherClassView,
    meta: {
      layout: "teacher",
      requiresAuth: true,
      title: "Professeur | Classes",
    },
    guards: [AuthGuard, TeacherGuard],
  },
  {
    path: "/teacher/matieres",
    component: TeacherSubjectView,
    meta: {
      layout: "teacher",
      requiresAuth: true,
      title: "Professeur | matieres",
    },
    guards: [AuthGuard, TeacherGuard],
  },
  {
    path: "/teacher/evaluations",
    component: AdminEvaluationView,
    meta: {
      layout: "teacher",
      requiresAuth: true,
      title: "Professeur | evaluations",
    },
    guards: [AuthGuard, TeacherGuard],
  },
  {
    path: "/teacher/notes",
    component: AdminEvaluationNoteView,
    meta: {
      layout: "teacher",
      requiresAuth: true,
      title: "Professeur | notes",
    },
    guards: [AuthGuard, TeacherGuard],
  },
  {
    path: "/teacher/averages",
    component: AverageView,
    meta: {
      layout: "teacher",
      requiresAuth: true,
      title: "Professeur | moyennes",
    },
    guards: [AuthGuard, TeacherGuard],
  },
];
