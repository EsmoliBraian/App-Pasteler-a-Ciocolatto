import { BuilderApp } from "@/components/builder/BuilderApp";
import { getPublicSponges, getPublicFillings, getPublicDecorations } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sponges, fillings, decorations, settings] = await Promise.all([
    getPublicSponges(),
    getPublicFillings(),
    getPublicDecorations(),
    getSettings(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-cioco-cream">
      <BuilderApp
        sponges={sponges}
        fillings={fillings}
        decorations={decorations}
        maxFillings={settings.maxFillings}
      />
    </main>
  );
}
