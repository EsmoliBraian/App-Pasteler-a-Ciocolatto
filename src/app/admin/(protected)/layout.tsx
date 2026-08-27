import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cioco-cream md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
