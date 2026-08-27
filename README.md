# Ciocolatto Pastelería — Constructor de presupuestos

Aplicación real (no demo) para que los clientes de Ciocolatto diseñen su torta paso a paso
(bizcochuelo → rellenos → decoración), vean el precio actualizarse en tiempo real y envíen el
presupuesto por WhatsApp — con un panel administrativo protegido para gestionar insumos, costos,
recetas, márgenes y presupuestos.

## Stack

- **Next.js 16** (App Router, Server Actions) + **TypeScript** estricto
- **Tailwind CSS v4** + **Framer Motion** para la UI del constructor
- **React Three Fiber / Three.js** (+ `@react-three/drei`, `@react-spring/three`) para la torta 3D real: geometría, luces, sombras y rotación genuina en vez de CSS. La cámara se auto-encuadra según la altura de la torta (`CameraRig.tsx`) para que nunca quede cortada, en mobile ni en desktop. El fondo de "estudio" (cortina + mesa) es 100% procedural (`StudioBackdrop.tsx`, textura generada por canvas) — no usa fotos de stock.
- **PostgreSQL** + **Prisma ORM 7** (driver adapter `@prisma/adapter-pg`)
- **Auth.js (NextAuth v5)** con credenciales para el admin, protegido en `proxy.ts` (middleware)
- **Zod** para validación de todos los server actions

## Arquitectura de precios (lo más importante del sistema)

Nada de precios está hardcodeado. La cadena es:

```
Ingredient (costo de compra)
  → costPerBaseUnit  (se calcula solo: precio compra ÷ cantidad en unidad base)
  → RecipeIngredient (cantidad usada en la receta de un Product)
  → costo de receta  (Σ cantidad × costPerBaseUnit)
  → precio de venta  (costo + margen, redondeado)
```

Fórmulas (configurables en **Admin → Configuración → Precios**):

- `COST_PLUS` (por defecto): `precio = costo × (1 + margen / 100)`
- `MARGIN_ON_PRICE`: `precio = costo ÷ (1 − margen / 100)`

El margen puede fijarse globalmente (`Settings.defaultMarginPercent`) o sobreescribirse por
producto (`Product.marginPercent`). El precio final se redondea según `Settings.roundingIncrement`
(0, 10, 50, 100, 500).

**Snapshots históricos**: cuando un cliente envía un presupuesto, `Quote`/`QuoteItem` guardan el
nombre y precio *congelados* en ese momento. Si mañana cambia el costo de un insumo, los productos
recalculan su precio de venta automáticamente, pero los presupuestos ya emitidos no se alteran
retroactivamente (verificado en desarrollo: ver sección de pruebas).

El cliente del constructor (`/`) solo ve el precio final. El costo y el margen solo se exponen en
`/admin` (nunca en las respuestas públicas — ver `src/lib/products.ts`, tipo `PublicProduct` vs
`ProductWithBreakdown`).

## Estructura

```
prisma/schema.prisma       Modelo de datos completo
prisma/seed.ts             Datos iniciales de ejemplo (insumos, bizcochuelos, rellenos, decoraciones)
src/lib/pricing.ts         Motor de cálculo de costo/margen/redondeo (puro, sin DB)
src/lib/products.ts        Acceso a productos con precio calculado (separa vista pública/admin)
src/lib/whatsapp.ts        Armado del mensaje y link wa.me
src/app/page.tsx           Constructor de tortas (cliente)
src/app/admin/             Panel administrativo (protegido)
  (protected)/             Dashboard, insumos, productos, presupuestos, configuración
  login/                   Login (fuera del layout protegido)
src/app/actions/           Server Actions (quotes, ingredients, products, settings, auth)
src/components/cake/       Torta 3D real (React Three Fiber): capas, decoración procedural, giro y plato
src/components/builder/    UI del wizard del cliente
src/components/admin/      UI del panel (tablas, formularios, editor de recetas)
```

## Puesta en marcha local

```bash
cp .env.example .env
# completar DATABASE_URL, AUTH_SECRET (npx auth secret), SEED_ADMIN_EMAIL/PASSWORD

docker compose up -d        # levanta Postgres local (puerto 5434)
npm install
npx prisma migrate dev      # crea las tablas
npm run db:seed             # carga datos de ejemplo + usuario admin
npm run dev                 # http://localhost:3000
```

Login admin: `/admin/login` con las credenciales de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

> Los costos, cantidades y márgenes del seed son **datos de ejemplo** para poder probar el sistema
> de punta a punta — no son los costos reales de Ciocolatto. Cargá los valores reales desde
> `/admin/ingredients` y `/admin/products/*` antes de operar en producción.

## Deploy en Vercel

1. Crear un proyecto en Vercel apuntando a este repo.
2. Base de datos: usar Vercel Postgres, Neon o Supabase (Prisma 7 se conecta vía
   `@prisma/adapter-pg`, cualquier Postgres estándar sirve).
3. Variables de entorno en Vercel: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (la URL pública
   del deploy), `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `WHATSAPP_NUMBER` (fallback — el número
   real y editable vive en Admin → Configuración → WhatsApp).
4. Ejecutar migraciones + seed contra la base de producción una sola vez:
   ```bash
   DATABASE_URL="<url de producción>" npx prisma migrate deploy
   DATABASE_URL="<url de producción>" npm run db:seed
   ```
5. Deploy. Next.js App Router con Server Actions corre nativamente en Vercel (Node runtime).

**Nota sobre GitHub Pages**: esta aplicación necesita un servidor (API routes, Server Actions,
autenticación, base de datos) y por lo tanto **no puede publicarse como sitio estático en GitHub
Pages** — eso eliminaría todo el panel admin, el cálculo de precios en servidor y el guardado de
presupuestos. Vercel es el equivalente correcto para un proyecto Next.js full-stack como este.

## Modelo de datos (resumen)

- `Ingredient`: costo de compra → `costPerBaseUnit` calculado automáticamente.
- `Product`: bizcochuelo / relleno / decoración. Tiene una `Recipe` opcional (los productos
  `isCustom`, como "Personalizado", no tienen receta ni precio fijo).
- `Recipe` + `RecipeIngredient`: ingredientes y cantidades que componen un producto.
- `Settings`: fila única con configuración global (margen, redondeo, WhatsApp, máx. rellenos).
- `Quote` + `QuoteItem`: presupuesto con snapshot de nombre/precio, estado
  (`PENDING/CONTACTED/CONFIRMED/REJECTED/COMPLETED`) y soporte para decoración personalizada
  (`isCustomDecoration`, `customDescription`, `total: null` = "a confirmar").

## Seguridad

- `/admin/*` está protegido en `src/proxy.ts` (corre en el servidor/edge, no confía en el cliente).
- Los endpoints/acciones públicas (`getPublicSponges`, `getPublicFillings`, `getPublicDecorations`,
  `createQuoteAction`) nunca devuelven costo ni margen — solo el precio final.
- Todas las mutaciones (insumos, productos, configuración, presupuestos) validan con Zod en el
  servidor antes de tocar la base de datos.

## Scripts

```bash
npm run dev         # servidor de desarrollo
npm run build       # build de producción
npm run start       # servidor de producción (después de build)
npm run db:migrate  # prisma migrate dev
npm run db:seed     # cargar datos de ejemplo
npm run db:studio   # explorar la base de datos con Prisma Studio
```
