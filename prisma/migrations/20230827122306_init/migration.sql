/*
  Warnings:

  - You are about to alter the column `credit` on the `credit_transaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `credit_transaction` MODIFY `credit` DOUBLE NOT NULL;
