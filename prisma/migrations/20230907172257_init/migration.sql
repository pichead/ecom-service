/*
  Warnings:

  - Added the required column `downloadName` to the `store_software_rent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store_software_rent` ADD COLUMN `downloadName` VARCHAR(255) NOT NULL;
