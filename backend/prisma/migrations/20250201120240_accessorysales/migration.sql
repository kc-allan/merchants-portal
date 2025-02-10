/*
  Warnings:

  - You are about to alter the column `commission` on the `accessorysales` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.

*/
-- AlterTable
ALTER TABLE `accessorysales` ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `financeAmount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `financeStatus` VARCHAR(255) NULL DEFAULT 'paid',
    ADD COLUMN `financer` VARCHAR(255) NULL DEFAULT 'captech',
    MODIFY `commission` INTEGER NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `fk_accessorysales_category` ON `accessorysales`(`categoryId`);

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
