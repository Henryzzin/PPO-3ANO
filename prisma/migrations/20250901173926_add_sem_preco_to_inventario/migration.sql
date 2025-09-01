-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "semPreco" BOOLEAN NOT NULL DEFAULT false,
    "idUsuarioFK" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inventario_idUsuarioFK_fkey" FOREIGN KEY ("idUsuarioFK") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inventario" ("createdAt", "id", "idUsuarioFK", "nome", "updatedAt") SELECT "createdAt", "id", "idUsuarioFK", "nome", "updatedAt" FROM "Inventario";
DROP TABLE "Inventario";
ALTER TABLE "new_Inventario" RENAME TO "Inventario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
