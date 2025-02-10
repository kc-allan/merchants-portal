/*
  Warnings:

  - You are about to drop the column `assignedshop` on the `actors` table. All the data in the column will be lost.
  - You are about to alter the column `minPrice` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Int`.
  - You are about to alter the column `confirmedBy` on the `mobileitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.
  - You are about to alter the column `transferId` on the `mobileitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.
  - You are about to drop the column `colour` on the `mobiles` table. All the data in the column will be lost.
  - You are about to drop the column `finance` on the `mobiles` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `mobiles` table. All the data in the column will be lost.
  - You are about to alter the column `soldPrice` on the `mobilesales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `commission` on the `mobilesales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `profit` on the `mobilesales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - The primary key for the `mobiletransferhistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `mobiletransferhistory` table. All the data in the column will be lost.
  - You are about to drop the `mobilestransferhistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maxPrice` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `mobiletransferHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `actors` DROP FOREIGN KEY `fk_actors_shops1`;

-- DropForeignKey
ALTER TABLE `mobiles` DROP FOREIGN KEY `fk_mobiles_2`;

-- DropForeignKey
ALTER TABLE `mobiletransferhistory` DROP FOREIGN KEY `fk_mobiletransferhistory_1`;

-- DropForeignKey
ALTER TABLE `mobiletransferhistory` DROP FOREIGN KEY `fk_mobiletransferhistory_2`;

-- DropForeignKey
ALTER TABLE `mobiletransferhistory` DROP FOREIGN KEY `fk_mobiletransferhistory_3`;

-- DropForeignKey
ALTER TABLE `mobiletransferhistory` DROP FOREIGN KEY `fk_mobiletransferhistory_4`;

-- DropForeignKey
ALTER TABLE `mobiletransferhistory` DROP FOREIGN KEY `fk_mobiletransferhistory_5`;

-- DropIndex
DROP INDEX `fk_actors_shops1_idx` ON `actors`;

-- DropIndex
DROP INDEX `fk_mobiles_2_idx` ON `mobiles`;

-- DropIndex
DROP INDEX `_id_UNIQUE` ON `mobiletransferhistory`;

-- AlterTable
ALTER TABLE `accessories` ADD COLUMN `availableStock` INTEGER UNSIGNED NULL DEFAULT 0,
    ADD COLUMN `color` VARCHAR(255) NULL DEFAULT 'white',
    ADD COLUMN `stockStatus` VARCHAR(255) NULL DEFAULT 'available';

-- AlterTable
ALTER TABLE `accessoryitems` ADD COLUMN `productStatus` VARCHAR(255) NULL DEFAULT 'new stock';

-- AlterTable
ALTER TABLE `accessorysales` ADD COLUMN `quantity` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `actors` DROP COLUMN `assignedshop`;

-- AlterTable
ALTER TABLE `assignment` ADD COLUMN `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `brand` VARCHAR(255) NULL DEFAULT 'unknown',
    ADD COLUMN `maxPrice` INTEGER NOT NULL,
    MODIFY `minPrice` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `mobilehistory` ADD COLUMN `sellerId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `mobileitems` ADD COLUMN `productStatus` VARCHAR(255) NULL DEFAULT 'new stock',
    ADD COLUMN `quantity` INTEGER UNSIGNED NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `confirmedBy` INTEGER NULL,
    MODIFY `transferId` INTEGER NULL;

-- AlterTable
ALTER TABLE `mobiles` DROP COLUMN `colour`,
    DROP COLUMN `finance`,
    DROP COLUMN `supplierId`,
    ADD COLUMN `color` VARCHAR(255) NULL DEFAULT 'white',
    ADD COLUMN `supplierName` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `mobilesales` ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `financeAmount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `financeStatus` VARCHAR(255) NULL DEFAULT 'captech',
    ADD COLUMN `financer` VARCHAR(255) NULL DEFAULT 'captech',
    ADD COLUMN `quantity` INTEGER NULL DEFAULT 0,
    ADD COLUMN `salesType` VARCHAR(255) NULL DEFAULT 'direct',
    MODIFY `soldPrice` INTEGER NULL DEFAULT 0,
    MODIFY `commission` INTEGER NULL DEFAULT 0,
    MODIFY `profit` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `mobiletransferhistory` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `quantity` INTEGER UNSIGNED NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `type` ENUM('distribution', 'transfer', 'return') NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `mobilestransferhistory`;

-- CreateTable
CREATE TABLE `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INTEGER UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fk_mobileHistory_seller` ON `mobileHistory`(`sellerId`);

-- CreateIndex
CREATE INDEX `fk_mobileItems_confirmedBy` ON `mobileItems`(`confirmedBy`);

-- CreateIndex
CREATE INDEX `fk_mobileSales_category` ON `mobilesales`(`categoryId`);

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_seller` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobileSales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_fromshop` FOREIGN KEY (`fromshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_mobiles` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_toshop` FOREIGN KEY (`toshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_transferdBy` FOREIGN KEY (`transferdBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `mobiletransferhistory` RENAME INDEX `fk_mobiletransferhistory_1_idx` TO `fk_mobiletransferhistory_mobiles`;

-- RenameIndex
ALTER TABLE `mobiletransferhistory` RENAME INDEX `fk_mobiletransferhistory_2_idx` TO `fk_mobiletransferhistory_fromshop`;

-- RenameIndex
ALTER TABLE `mobiletransferhistory` RENAME INDEX `fk_mobiletransferhistory_3_idx` TO `fk_mobiletransferhistory_toshop`;

-- RenameIndex
ALTER TABLE `mobiletransferhistory` RENAME INDEX `fk_mobiletransferhistory_4_idx` TO `fk_mobiletransferhistory_confirmedBy`;

-- RenameIndex
ALTER TABLE `mobiletransferhistory` RENAME INDEX `fk_mobiletransferhistory_5_idx` TO `fk_mobiletransferhistory_transferdBy`;
