import { createBrowserRouter } from "react-router-dom";

import LandingPage from "../pages/landing";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";

import DashboardPage from "../pages/dashboard";
import ProductsPage from "../pages/products";
import BatchesPage from "../pages/batches";
import GeneratePage from "../pages/generate";
import HistoryPage from "../pages/history";
import UsersPage from "../pages/users";
import SettingsPage from "../pages/settings";
import NotFoundPage from "../pages/notfound";

import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute>
        <ProductsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/batches",
    element: (
      <ProtectedRoute>
        <BatchesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/generate",
    element: (
      <ProtectedRoute>
        <GeneratePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <HistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);