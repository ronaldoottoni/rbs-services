/*
  Warnings:

  - You are about to drop the column `valorRecebido` on the `Pagamento` table. All the data in the column will be lost.
  - Added the required column `valorPago` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pagamento"
RENAME COLUMN "valorRecebido" TO "valorPago";
