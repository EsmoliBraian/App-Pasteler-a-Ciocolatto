import { BuilderApp } from "@/components/builder/BuilderApp";
import {
  getPublicSponges,
  getPublicFillings,
  getPublicToppings,
  getPublicDecorations,
  getPublicSizes,
} from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sizes, sponges, fillings, toppings, decorations, settings] = await Promise.all([
    getPublicSizes(),
    getPublicSponges(),
    getPublicFillings(),
    getPublicToppings(),
    getPublicDecorations(),
    getSettings(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-cioco-cream">
      <BuilderApp
        sizes={sizes}
        sponges={sponges}
        fillings={fillings}
        toppings={toppings}
        decorations={decorations}
        maxFillings={settings.maxFillings}
      />
    </main>
  );
}
