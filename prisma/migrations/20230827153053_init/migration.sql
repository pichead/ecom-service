/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `store_has_key` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `store_has_key_key_key` ON `store_has_key`(`key`);
