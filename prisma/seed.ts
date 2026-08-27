/**
 * Seed inicial de Ciocolatto Pastelería.
 *
 * IMPORTANTE: los precios de insumos, cantidades de receta y márgenes cargados acá
 * son datos de EJEMPLO para poder probar el sistema de punta a punta. No son los
 * costos reales de Ciocolatto — el administrador debe cargarlos/editarlos desde
 * /admin antes de operar en producción.
 */
import "dotenv/config";
import type { PurchaseUnit } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeCostPerBaseUnit, baseUnitForPurchaseUnit } from "../src/lib/pricing";
import { prisma } from "../src/lib/prisma";

interface IngredientSeed {
  name: string;
  purchaseUnit: PurchaseUnit;
  purchaseQuantity: number;
  purchasePrice: number;
  supplier?: string;
}

const ingredientSeeds: IngredientSeed[] = [
  { name: "Harina 0000", purchaseUnit: "KILOGRAM", purchaseQuantity: 10, purchasePrice: 12000 },
  { name: "Azúcar común", purchaseUnit: "KILOGRAM", purchaseQuantity: 10, purchasePrice: 9000 },
  { name: "Azúcar impalpable", purchaseUnit: "KILOGRAM", purchaseQuantity: 5, purchasePrice: 6000 },
  { name: "Huevos", purchaseUnit: "UNIT", purchaseQuantity: 30, purchasePrice: 6000 },
  { name: "Manteca", purchaseUnit: "KILOGRAM", purchaseQuantity: 5, purchasePrice: 15000 },
  { name: "Cacao amargo", purchaseUnit: "KILOGRAM", purchaseQuantity: 1, purchasePrice: 8000 },
  { name: "Chocolate cobertura", purchaseUnit: "KILOGRAM", purchaseQuantity: 5, purchasePrice: 30000 },
  { name: "Dulce de leche repostero", purchaseUnit: "KILOGRAM", purchaseQuantity: 5, purchasePrice: 12000 },
  { name: "Crema de leche", purchaseUnit: "LITER", purchaseQuantity: 5, purchasePrice: 15000 },
  { name: "Frutos rojos congelados", purchaseUnit: "KILOGRAM", purchaseQuantity: 2, purchasePrice: 10000 },
  { name: "Limón", purchaseUnit: "UNIT", purchaseQuantity: 20, purchasePrice: 4000 },
  { name: "Nutella", purchaseUnit: "KILOGRAM", purchaseQuantity: 3, purchasePrice: 27000 },
  { name: "Esencia de vainilla", purchaseUnit: "MILLILITER", purchaseQuantity: 500, purchasePrice: 5000 },
];

async function seedIngredients() {
  const idByName = new Map<string, string>();
  for (const seed of ingredientSeeds) {
    const baseUnit = baseUnitForPurchaseUnit(seed.purchaseUnit);
    const costPerBaseUnit = computeCostPerBaseUnit(seed.purchasePrice, seed.purchaseQuantity, seed.purchaseUnit);
    const ingredient = await prisma.ingredient.upsert({
      where: { id: `seed-${slugify(seed.name)}` },
      create: {
        id: `seed-${slugify(seed.name)}`,
        name: seed.name,
        purchaseUnit: seed.purchaseUnit,
        baseUnit,
        purchaseQuantity: seed.purchaseQuantity,
        purchasePrice: seed.purchasePrice,
        costPerBaseUnit,
        supplier: seed.supplier,
      },
      update: {
        purchaseUnit: seed.purchaseUnit,
        baseUnit,
        purchaseQuantity: seed.purchaseQuantity,
        purchasePrice: seed.purchasePrice,
        costPerBaseUnit,
      },
    });
    idByName.set(seed.name, ingredient.id);
  }
  return idByName;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ProductSeed {
  type: "SPONGE" | "FILLING" | "DECORATION";
  name: string;
  description?: string;
  colorHex?: string;
  visualStyle?: string;
  decorationCategory?: "CLASSIC" | "SPECIAL" | "FRUIT" | "CUSTOM";
  isCustom?: boolean;
  marginPercent?: number;
  sortOrder: number;
  recipe?: { ingredient: string; quantity: number }[];
}

const productSeeds: ProductSeed[] = [
  // Bizcochuelos
  {
    type: "SPONGE",
    name: "Vainilla",
    colorHex: "#F3E3B8",
    sortOrder: 1,
    recipe: [
      { ingredient: "Harina 0000", quantity: 500 },
      { ingredient: "Azúcar común", quantity: 400 },
      { ingredient: "Huevos", quantity: 6 },
      { ingredient: "Manteca", quantity: 200 },
      { ingredient: "Esencia de vainilla", quantity: 10 },
    ],
  },
  {
    type: "SPONGE",
    name: "Chocolate",
    colorHex: "#5B3A29",
    sortOrder: 2,
    recipe: [
      { ingredient: "Harina 0000", quantity: 450 },
      { ingredient: "Azúcar común", quantity: 400 },
      { ingredient: "Huevos", quantity: 6 },
      { ingredient: "Manteca", quantity: 150 },
      { ingredient: "Cacao amargo", quantity: 80 },
      { ingredient: "Chocolate cobertura", quantity: 100 },
    ],
  },
  {
    type: "SPONGE",
    name: "Red Velvet",
    colorHex: "#8C1D2B",
    sortOrder: 3,
    recipe: [
      { ingredient: "Harina 0000", quantity: 480 },
      { ingredient: "Azúcar común", quantity: 400 },
      { ingredient: "Huevos", quantity: 5 },
      { ingredient: "Manteca", quantity: 180 },
      { ingredient: "Cacao amargo", quantity: 30 },
    ],
  },
  {
    type: "SPONGE",
    name: "Limón",
    colorHex: "#F5EFA0",
    sortOrder: 4,
    recipe: [
      { ingredient: "Harina 0000", quantity: 500 },
      { ingredient: "Azúcar común", quantity: 380 },
      { ingredient: "Huevos", quantity: 6 },
      { ingredient: "Manteca", quantity: 200 },
      { ingredient: "Limón", quantity: 3 },
    ],
  },

  // Rellenos
  {
    type: "FILLING",
    name: "Dulce de leche",
    colorHex: "#A9642B",
    marginPercent: 45,
    sortOrder: 1,
    recipe: [{ ingredient: "Dulce de leche repostero", quantity: 300 }],
  },
  {
    type: "FILLING",
    name: "Nutella",
    colorHex: "#4A2A1D",
    marginPercent: 45,
    sortOrder: 2,
    recipe: [{ ingredient: "Nutella", quantity: 250 }],
  },
  {
    type: "FILLING",
    name: "Frutos rojos",
    colorHex: "#B33951",
    marginPercent: 45,
    sortOrder: 3,
    recipe: [
      { ingredient: "Frutos rojos congelados", quantity: 200 },
      { ingredient: "Azúcar común", quantity: 50 },
    ],
  },
  {
    type: "FILLING",
    name: "Crema chantilly",
    colorHex: "#FBF6ED",
    marginPercent: 45,
    sortOrder: 4,
    recipe: [
      { ingredient: "Crema de leche", quantity: 200 },
      { ingredient: "Azúcar impalpable", quantity: 30 },
    ],
  },
  {
    type: "FILLING",
    name: "Chocolate",
    colorHex: "#3B2418",
    marginPercent: 45,
    sortOrder: 5,
    recipe: [
      { ingredient: "Chocolate cobertura", quantity: 150 },
      { ingredient: "Crema de leche", quantity: 80 },
    ],
  },
  {
    type: "FILLING",
    name: "Limón",
    colorHex: "#EEE07A",
    marginPercent: 45,
    sortOrder: 6,
    recipe: [
      { ingredient: "Limón", quantity: 4 },
      { ingredient: "Azúcar común", quantity: 100 },
      { ingredient: "Huevos", quantity: 2 },
      { ingredient: "Manteca", quantity: 50 },
    ],
  },

  // Decoraciones
  {
    type: "DECORATION",
    name: "Chantilly clásico",
    description: "Cobertura suave y clásica de crema chantilly.",
    visualStyle: "chantilly",
    decorationCategory: "CLASSIC",
    marginPercent: 50,
    sortOrder: 1,
    recipe: [
      { ingredient: "Crema de leche", quantity: 400 },
      { ingredient: "Azúcar impalpable", quantity: 80 },
    ],
  },
  {
    type: "DECORATION",
    name: "Chocolate ganache",
    description: "Cobertura brillante de ganache de chocolate.",
    visualStyle: "ganache",
    decorationCategory: "CLASSIC",
    marginPercent: 50,
    sortOrder: 2,
    recipe: [
      { ingredient: "Chocolate cobertura", quantity: 250 },
      { ingredient: "Crema de leche", quantity: 150 },
    ],
  },
  {
    type: "DECORATION",
    name: "Merengue italiano",
    description: "Merengue tostado al soplete, textura liviana.",
    visualStyle: "meringue",
    decorationCategory: "SPECIAL",
    marginPercent: 50,
    sortOrder: 3,
    recipe: [
      { ingredient: "Huevos", quantity: 6 },
      { ingredient: "Azúcar común", quantity: 300 },
    ],
  },
  {
    type: "DECORATION",
    name: "Rústica",
    description: "Terminación artesanal con espátula, look natural.",
    visualStyle: "rustic",
    decorationCategory: "SPECIAL",
    marginPercent: 50,
    sortOrder: 4,
    recipe: [
      { ingredient: "Chocolate cobertura", quantity: 200 },
      { ingredient: "Manteca", quantity: 50 },
    ],
  },
  {
    type: "DECORATION",
    name: "Semi naked",
    description: "Bizcochuelo a la vista con cobertura parcial.",
    visualStyle: "seminaked",
    decorationCategory: "SPECIAL",
    marginPercent: 50,
    sortOrder: 5,
    recipe: [
      { ingredient: "Crema de leche", quantity: 300 },
      { ingredient: "Azúcar impalpable", quantity: 50 },
    ],
  },
  {
    type: "DECORATION",
    name: "Drip cake",
    description: "Cobertura con caída de chocolate sobre los bordes.",
    visualStyle: "dripcake",
    decorationCategory: "FRUIT",
    marginPercent: 50,
    sortOrder: 6,
    recipe: [
      { ingredient: "Chocolate cobertura", quantity: 300 },
      { ingredient: "Crema de leche", quantity: 100 },
    ],
  },
  {
    type: "DECORATION",
    name: "Personalizado",
    description: "Contanos cómo imaginás tu torta y te cotizamos a medida.",
    visualStyle: "custom",
    decorationCategory: "CUSTOM",
    isCustom: true,
    sortOrder: 7,
  },
];

async function seedProducts(ingredientIdByName: Map<string, string>) {
  for (const seed of productSeeds) {
    const slug = slugify(`${seed.type}-${seed.name}`);
    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        type: seed.type,
        name: seed.name,
        description: seed.description,
        colorHex: seed.colorHex,
        visualStyle: seed.visualStyle,
        decorationCategory: seed.decorationCategory,
        isCustom: seed.isCustom ?? false,
        marginPercent: seed.marginPercent,
        sortOrder: seed.sortOrder,
      },
      update: {
        name: seed.name,
        description: seed.description,
        colorHex: seed.colorHex,
        visualStyle: seed.visualStyle,
        decorationCategory: seed.decorationCategory,
        isCustom: seed.isCustom ?? false,
        marginPercent: seed.marginPercent,
        sortOrder: seed.sortOrder,
      },
    });

    if (seed.recipe && seed.recipe.length > 0) {
      const recipe = await prisma.recipe.upsert({
        where: { productId: product.id },
        create: { productId: product.id },
        update: {},
      });

      await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
      for (const ri of seed.recipe) {
        const ingredientId = ingredientIdByName.get(ri.ingredient);
        if (!ingredientId) throw new Error(`Insumo no encontrado en seed: ${ri.ingredient}`);
        await prisma.recipeIngredient.create({
          data: { recipeId: recipe.id, ingredientId, quantity: ri.quantity },
        });
      }
    }
  }
}

async function seedSettings() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      businessName: "Ciocolatto Pastelería",
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5491100000000",
      whatsappGreeting: "Hola Ciocolatto 👋\nQuiero solicitar un presupuesto para una torta.",
      defaultMarginPercent: 40,
      marginMethod: "COST_PLUS",
      roundingIncrement: 100,
      maxFillings: 3,
    },
    update: {},
  });
}

async function seedAdminUser() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@ciocolatto.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "cambiar-esta-clave";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: "Administrador Ciocolatto" },
    update: { passwordHash },
  });

  console.log(`Usuario admin listo -> email: ${email}`);
}

async function main() {
  console.log("Sembrando insumos...");
  const ingredientIdByName = await seedIngredients();

  console.log("Sembrando productos y recetas...");
  await seedProducts(ingredientIdByName);

  console.log("Sembrando configuración...");
  await seedSettings();

  console.log("Sembrando usuario admin...");
  await seedAdminUser();

  console.log("Seed completo.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
