"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/ingredients", label: "Insumos", icon: "🧺" },
  { href: "/admin/products/sponges", label: "Bizcochuelos", icon: "🍰" },
  { href: "/admin/products/fillings", label: "Rellenos", icon: "🍯" },
  { href: "/admin/products/decorations", label: "Decoraciones", icon: "🎀" },
  { href: "/admin/quotes", label: "Presupuestos", icon: "🧾" },
  { href: "/admin/settings", label: "Configuración", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 bg-cioco-green-dark p-4 text-cioco-white md:h-screen md:w-60 md:sticky md:top-0">
      <div className="mb-4 px-2">
        <p className="font-serif text-xl font-semibold">Ciocolatto</p>
        <p className="text-xs text-cioco-white/50">Panel administrativo</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-cioco-white/15 font-semibold text-white" : "text-cioco-white/70 hover:bg-cioco-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-4 w-full rounded-lg px-3 py-2 text-left text-sm text-cioco-white/60 transition hover:bg-cioco-white/10 hover:text-white"
        >
          ↩ Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
