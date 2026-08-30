import "server-only";
import { formatARS } from "@/lib/pricing";

export interface WhatsappQuoteData {
  greeting: string;
  sizeName: string;
  spongeName: string;
  spongePrice: number;
  fillings: { name: string; price: number }[];
  toppings: { name: string; price: number }[];
  isCustomDecoration: boolean;
  decorationName?: string;
  decorationPrice?: number;
  customDescription?: string;
  total: number | null;
}

/** Arma el texto del mensaje de WhatsApp a partir de la selección del cliente. */
export function buildWhatsappMessage(data: WhatsappQuoteData): string {
  const lines: string[] = [];
  lines.push(data.greeting.trim());
  lines.push("");
  lines.push("🎂 TORTA");
  lines.push("Medida:");
  lines.push(data.sizeName);
  lines.push("");
  lines.push("Bizcochuelo:");
  lines.push(`${data.spongeName} — ${formatARS(data.spongePrice)}`);
  lines.push("");
  lines.push("Rellenos:");
  for (const filling of data.fillings) {
    lines.push(`• ${filling.name} — ${formatARS(filling.price)}`);
  }
  lines.push("");

  if (data.toppings.length > 0) {
    lines.push("Toppings:");
    for (const topping of data.toppings) {
      lines.push(`• ${topping.name} — ${formatARS(topping.price)}`);
    }
    lines.push("");
  }

  if (data.isCustomDecoration) {
    lines.push("Decoración:");
    lines.push("Personalizada");
    lines.push("Descripción:");
    lines.push(`"${data.customDescription ?? ""}"`);
    lines.push("Precio:");
    lines.push("A confirmar");
  } else {
    lines.push("Decoración:");
    lines.push(`${data.decorationName} — ${formatARS(data.decorationPrice ?? 0)}`);
    lines.push("");
    lines.push("💰 Total estimado:");
    lines.push(formatARS(data.total));
  }

  return lines.join("\n");
}

/** Genera el link wa.me a partir del número configurado (sin exponerlo hardcodeado). */
export function buildWhatsappLink(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
