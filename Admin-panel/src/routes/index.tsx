import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./authRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { PublicCmsViewerPage } from "../features/CMS/pages/PublicCmsViewerPage";

export const router = createBrowserRouter([
  authRoutes,
  {
    path: "/cms/:slug",
    element: <PublicCmsViewerPage />,
  },
  {
    path: "/page/:slug",
    element: <PublicCmsViewerPage />,
  },
  {
    path: "/cms-view/:slug",
    element: <PublicCmsViewerPage />,
  },
  protectedRoutes,
]);
