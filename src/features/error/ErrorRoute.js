import { NotFoundView } from "@features/error/NotFoundView";
import { UnauthorizedView } from "@features/error/UnAuthorizedView";


export const errorRoutes = [
  {
    path: "/404",
    component: NotFoundView,
    meta: {
      layout: "error",
      noAuthRequired: true,
      title: "Page introuvable",
    },
  },
  {
    path: "/unauthorized",
    component: UnauthorizedView,
    meta: {
      layout: "error",
      noAuthRequired: true,
      title: "Accès non autorisé",
    },
  },
];
