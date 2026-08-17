import React from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import App from "./App"
import HomePage from "./pages/HomePage"
import ProjectsPage from "./pages/ProjectsPage"
import SubmitProjectPage from "./pages/SubmitProjectPage"
import CommunityPage from "./pages/CommunityPage"
import AdminPage from "./pages/AdminPage"
import NotFound from "./pages/NotFound"
import "./index.css"

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "proyectos", element: <ProjectsPage /> },
      { path: "enviar-proyecto", element: <SubmitProjectPage /> },
      { path: "comunidad", element: <CommunityPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const root = document.getElementById("root");

createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);