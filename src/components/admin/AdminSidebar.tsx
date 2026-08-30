"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/ingredients", label: "Insumos", icon: "🧺" },
  { href: "/admin/sizes", label: "Medidas", icon: "📏" },
  { href: "/admin/products/sponges", label: "Bizcochuelos", icon: "🍰" },
  { href: "/admin/products/fillings", label: "Rellenos", icon: "🍯" },
  { href: "/admin/products/toppings", label: "Toppings", icon: "🍬" },
  { href: "/admin/products/decorations", label: "Decoraciones", icon: "🎀" },
  { href: "/admin/quotes", label: "Presupuestos", icon: "🧾" },
  { href: "/admin/settings", label: "Configuración", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cierra el drawer automáticamente al navegar a otra sección.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Evita que el fondo scrollee mientras el drawer mobile está abierto.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-cioco-green-dark px-4 text-cioco-white md:hidden">
        <div>
          <p className="font-serif text-lg font-semibold leading-none">Ciocolatto</p>
          <p className="text-[11px] text-cioco-white/50">Panel administrativo</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="rounded-lg p-2 text-xl leading-none hover:bg-cioco-white/10"
        >
          {open ? "✕" : "☰"}
        </button>
      </header>

      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] w-64 flex-col gap-1 bg-cioco-green-dark p-4 text-cioco-white transition-transform duration-200 ease-out md:top-0 md:h-screen md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 hidden px-2 md:block">
          <p className="font-serif text-xl font-semibold">Ciocolatto</p>
          <p className="text-xs text-cioco-white/50">Panel administrativo</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
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
    </>
  );
}
