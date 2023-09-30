/*
  Warnings:

  - Added the required column `unit` to the `store_software_package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitEng` to the `store_software_package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `downloadUrl` to the `store_software_rent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `store_software_rent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store_software_package` ADD COLUMN `unit` VARCHAR(255) NOT NULL,
    ADD COLUMN `unitEng` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `store_software_rent` ADD COLUMN `downloadUrl` VARCHAR(255) NOT NULL,
    ADD COLUMN `shortName` VARCHAR(255) NOT NULL,
    MODIFY `imgPath` VARCHAR(255) NULL;
