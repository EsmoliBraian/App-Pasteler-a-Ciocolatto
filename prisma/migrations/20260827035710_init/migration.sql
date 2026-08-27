-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SPONGE', 'FILLING', 'DECORATION');

-- CreateEnum
CREATE TYPE "DecorationCategory" AS ENUM ('CLASSIC', 'SPECIAL', 'FRUIT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PurchaseUnit" AS ENUM ('KILOGRAM', 'GRAM', 'LITER', 'MILLILITER', 'UNIT');

-- CreateEnum
CREATE TYPE "BaseUnit" AS ENUM ('GRAM', 'MILLILITER', 'UNIT');

-- CreateEnum
CREATE TYPE "MarginMethod" AS ENUM ('COST_PLUS', 'MARGIN_ON_PRICE');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONFIRMED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QuoteItemType" AS ENUM ('SPONGE', 'FILLING', 'DECORATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplier" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "purchaseUnit" "PurchaseUnit" NOT NULL,
    "baseUnit" "BaseUnit" NOT NULL,
    "purchaseQuantity" DECIMAL(12,3) NOT NULL,
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "costPerBaseUnit" DECIMAL(14,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "colorHex" TEXT,
    "visualStyle" TEXT,
    "imageUrl" TEXT,
    "decorationCategory" "DecorationCategory",
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "marginPercent" DECIMAL(5,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'Ciocolatto Pastelería',
    "logoUrl" TEXT,
    "contactInfo" TEXT,
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "whatsappGreeting" TEXT NOT NULL DEFAULT 'Hola Ciocolatto 👋
Quiero solicitar un presupuesto para una torta.',
    "defaultMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 40,
    "marginMethod" "MarginMethod" NOT NULL DEFAULT 'COST_PLUS',
    "roundingIncrement" INTEGER NOT NULL DEFAULT 100,
    "maxFillings" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT,
    "customerPhone" TEXT,
    "isCustomDecoration" BOOLEAN NOT NULL DEFAULT false,
    "customDescription" TEXT,
    "subtotal" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "type" "QuoteItemType" NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Ingredient_active_idx" ON "Ingredient"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_type_active_idx" ON "Product"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_productId_key" ON "Recipe"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
