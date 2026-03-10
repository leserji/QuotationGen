-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quotation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "clientName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Quotation" ("clientName", "createdAt", "currency", "date", "id", "notes", "number", "updatedAt") SELECT "clientName", "createdAt", "currency", "date", "id", "notes", "number", "updatedAt" FROM "Quotation";
DROP TABLE "Quotation";
ALTER TABLE "new_Quotation" RENAME TO "Quotation";
CREATE UNIQUE INDEX "Quotation_number_key" ON "Quotation"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
