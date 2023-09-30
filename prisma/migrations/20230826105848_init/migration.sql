-- AlterTable
ALTER TABLE `admin` ADD COLUMN `permissions` JSON NULL,
    MODIFY `fname` VARCHAR(255) NULL,
    MODIFY `lname` VARCHAR(255) NULL;
