import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isAdminAuthenticated } from "@/lib/adminApi";
import { getToken } from "@/lib/api";

// Pathless layout route — wraps all /admin/* pages.
export const Route = createFileRoute("/admin/_layout")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin/login") return;
    if (!isAdminAuthenticated()) {
      // Regular users are prevented from accessing admin panel and safely redirected to dashboard
      if (getToken()) {
        throw redirect({ to: "/dashboard" });
      }
      // Unauthenticated users are redirected to login
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
