import "server-only";
import { prisma } from "@/lib/prisma";
import type { Settings } from "@prisma/client";

const SETTINGS_ID = "singleton";

/** Devuelve la configuración global, creándola con valores por defecto si no existe. */
export async function getSettings(): Promise<Settings> {
  const existing = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: SETTINGS_ID } });
}
