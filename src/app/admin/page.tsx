import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AuthGuard } from "@/components/admin/auth-guard";

export const metadata: Metadata = {
  title: "Admin | Victory Portfolio",
};

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}