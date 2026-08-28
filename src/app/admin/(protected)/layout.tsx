import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-cioco-cream">
      <AdminSidebar />
      <main className="min-h-screen p-4 pt-20 md:ml-60 md:p-8">{children}</main>
    </div>
  );
}
