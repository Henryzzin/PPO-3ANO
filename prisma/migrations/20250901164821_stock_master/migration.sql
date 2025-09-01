-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "preco" REAL NOT NULL,
    "idInventarioFK" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produto_idInventarioFK_fkey" FOREIGN KEY ("idInventarioFK") REFERENCES "Inventario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Produto" ("createdAt", "id", "idInventarioFK", "nome", "preco", "quantidade", "updatedAt") SELECT "createdAt", "id", "idInventarioFK", "nome", "preco", "quantidade", "updatedAt" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
