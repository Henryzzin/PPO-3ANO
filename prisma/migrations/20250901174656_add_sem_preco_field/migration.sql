-- Add semPreco field to Inventario table
ALTER TABLE "Inventario" ADD COLUMN "semPreco" BOOLEAN NOT NULL DEFAULT false;