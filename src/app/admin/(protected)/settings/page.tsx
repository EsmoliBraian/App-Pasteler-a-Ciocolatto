import { getSettings } from "@/lib/settings";
import { SettingsForms } from "@/components/admin/SettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-cioco-green">Configuración</h1>
        <p className="text-sm text-cioco-green/60">Datos del negocio, WhatsApp, precios y constructor</p>
      </div>
      <SettingsForms
        settings={{
          businessName: settings.businessName,
          logoUrl: settings.logoUrl,
          contactInfo: settings.contactInfo,
          whatsappNumber: settings.whatsappNumber,
          whatsappGreeting: settings.whatsappGreeting,
          defaultMarginPercent: Number(settings.defaultMarginPercent),
          marginMethod: settings.marginMethod,
          roundingIncrement: settings.roundingIncrement,
          maxFillings: settings.maxFillings,
        }}
      />
    </div>
  );
}
