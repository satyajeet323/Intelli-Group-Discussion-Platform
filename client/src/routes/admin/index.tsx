import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAdminAuthenticated } from "@/lib/adminApi";
import { getToken } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    if (!isAdminAuthenticated()) {
      if (getToken()) {
        throw redirect({ to: "/dashboard" });
      }
      throw redirect({ to: "/login" });
    }
    throw redirect({ to: "/admin/dashboard" });
  },
  component: () => null,
});
