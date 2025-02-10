/*
  Warnings:

  - You are about to drop the column `itemType` on the `accessories` table. All the data in the column will be lost.
  - You are about to drop the column `minPrice` on the `accessories` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `accessories` table. All the data in the column will be lost.
  - You are about to alter the column `productCost` on the `accessories` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `commission` on the `accessories` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `discount` on the `accessories` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `confirmedBy` on the `accessoryitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.
  - You are about to alter the column `transferId` on the `accessoryitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.
  - You are about to alter the column `confirmedBy` on the `accessorytransferhistory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `accessories` DROP FOREIGN KEY `fk_accessories_2`;

-- DropIndex
DROP INDEX `fk_accessories_2_idx` ON `accessories`;

-- AlterTable
ALTER TABLE `accessories` DROP COLUMN `itemType`,
    DROP COLUMN `minPrice`,
    DROP COLUMN `supplierId`,
    ADD COLUMN `productType` VARCHAR(255) NULL,
    ADD COLUMN `supplierName` VARCHAR(255) NULL,
    ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `productCost` INTEGER NULL,
    MODIFY `commission` INTEGER NULL,
    MODIFY `discount` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessoryitems` ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `confirmedBy` INTEGER NULL,
    MODIFY `transferId` INTEGER NULL;

-- AlterTable
ALTER TABLE `accessorytransferhistory` ADD COLUMN `quantity` INTEGER UNSIGNED NULL,
    ADD COLUMN `transferdBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `confirmedBy` INTEGER NULL;

-- CreateIndex
CREATE INDEX `fk_confirmedBy_actor_2` ON `accessoryItems`(`confirmedBy`);

-- CreateIndex
CREATE INDEX `fk_confirmedBy_actor` ON `accessorytransferhistory`(`confirmedBy`);

-- CreateIndex
CREATE INDEX `fk_transferdBy_actor` ON `accessorytransferhistory`(`transferdBy`);

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_confirmedBy_actor_2` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_confirmedBy_actor` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_transferdBy_actor` FOREIGN KEY (`transferdBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
