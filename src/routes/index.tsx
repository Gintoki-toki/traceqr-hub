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
    element: <DashboardPage />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/batches",
    element: <BatchesPage />,
  },
  {
    path: "/generate",
    element: <GeneratePage />,
  },
  {
    path: "/history",
    element: <HistoryPage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);