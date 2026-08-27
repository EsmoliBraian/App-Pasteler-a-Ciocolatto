"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-cioco-green-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cioco-white p-8 shadow-xl">
        <p className="font-serif text-2xl font-semibold text-cioco-green">Ciocolatto</p>
        <p className="mt-1 text-sm text-cioco-green/70">Panel administrativo</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cioco-green/60">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="w-full rounded-lg border border-cioco-green/20 bg-white px-3 py-2 text-sm text-cioco-green outline-none focus:border-cioco-green"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cioco-green/60">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-cioco-green/20 bg-white px-3 py-2 text-sm text-cioco-green outline-none focus:border-cioco-green"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-cioco-green px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cioco-white shadow-md transition hover:bg-cioco-green-dark disabled:opacity-50"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
