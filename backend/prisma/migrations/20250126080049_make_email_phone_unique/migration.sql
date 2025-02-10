-- CreateTable
CREATE TABLE `accessories` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchNumber` VARCHAR(255) NOT NULL,
    `supplierId` INTEGER NOT NULL DEFAULT 0,
    `minPrice` DECIMAL(10, 2) NOT NULL,
    `itemType` VARCHAR(255) NOT NULL,
    `CategoryId` INTEGER NOT NULL,
    `faultyItems` INTEGER UNSIGNED NULL DEFAULT 0,
    `productCost` DECIMAL(10, 2) NULL,
    `commission` DECIMAL(10, 2) NULL,
    `discount` DECIMAL(10, 2) NULL,
    `barcodePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `itemName_UNIQUE`(`batchNumber`),
    INDEX `fk_accessories_1_idx`(`CategoryId`),
    INDEX `fk_accessories_2_idx`(`supplierId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessoryHistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `addedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shopId` INTEGER NOT NULL,
    `type` VARCHAR(45) NOT NULL DEFAULT 'new stock',
    `quantity` INTEGER UNSIGNED NOT NULL,
    `productID` INTEGER NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_acccessoryHistory_1_idx`(`productID`),
    INDEX `fk_accessoryHistory_1_idx`(`shopId`),
    INDEX `fk_accessoryHistory_2_idx`(`addedBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessoryItems` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `status` VARCHAR(45) NOT NULL,
    `confirmedBy` VARCHAR(45) NULL,
    `transferId` VARCHAR(45) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `quantity` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessoryItems_1_idx`(`shopID`),
    INDEX `fk_accessoryItems_2_idx`(`accessoryID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessorysales` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `soldPrice` DECIMAL(10, 2) NOT NULL,
    `commission` VARCHAR(45) NOT NULL,
    `profit` INTEGER UNSIGNED NOT NULL,
    `customerName` VARCHAR(45) NULL DEFAULT 'doe',
    `customerEmail` VARCHAR(45) NULL DEFAULT 'doe@gmail.com',
    `customerPhoneNumber` VARCHAR(45) NULL DEFAULT '07000000',
    `paymentmethod` ENUM('mpesa', 'cash', 'creditcard') NULL,
    `finance` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `commisssionStatus` ENUM('pending', 'paid') NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessorysales_1_idx`(`productID`),
    INDEX `fk_accessorysales_2_idx`(`sellerId`),
    INDEX `fk_accessorysales_3_idx`(`shopID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessorytransferhistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fromshop` INTEGER NOT NULL,
    `toshop` INTEGER NOT NULL,
    `confirmedBy` VARCHAR(45) NULL,
    `status` VARCHAR(45) NULL DEFAULT 'pending',
    `type` ENUM('distribution', 'transfer') NULL,
    `productID` INTEGER NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessorytransferhistory_1_idx`(`productID`),
    INDEX `fk_accessorytransferhistory_2_idx`(`fromshop`),
    INDEX `fk_accessorytransferhistory_3_idx`(`toshop`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actors` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `nextofkinname` VARCHAR(255) NOT NULL,
    `nextofkinphonenumber` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `assignedshop` INTEGER NULL,
    `workingstatus` VARCHAR(45) NULL DEFAULT 'inactive',
    `phone` VARCHAR(45) NOT NULL,
    `role` VARCHAR(45) NULL DEFAULT 'seller',
    `Idimagebackward` VARCHAR(255) NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `Idimagefront` VARCHAR(255) NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `profileimage` VARCHAR(255) NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `actors_email_key`(`email`),
    UNIQUE INDEX `actors_phone_key`(`phone`),
    INDEX `fk_actors_shops1_idx`(`assignedshop`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `fromDate` DATETIME(0) NOT NULL,
    `toDate` DATETIME(0) NOT NULL,
    `status` ENUM('assigned', 'removed') NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_assignment_1_idx`(`shopID`),
    INDEX `fk_assignment_2_idx`(`userID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemName` VARCHAR(45) NULL,
    `itemModel` VARCHAR(45) NOT NULL,
    `minPrice` INTEGER UNSIGNED NOT NULL,
    `itemType` ENUM('mobiles', 'accessories') NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `itemName_UNIQUE`(`itemName`),
    UNIQUE INDEX `itemModel_UNIQUE`(`itemModel`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobileHistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `addedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shopId` INTEGER NOT NULL,
    `type` VARCHAR(45) NOT NULL DEFAULT 'new stock',
    `productID` INTEGER NOT NULL,

    INDEX `fk_mobileHistory_1_idx`(`productID`),
    INDEX `fk_mobileHistory_2_idx`(`addedBy`),
    INDEX `fk_mobileHistory_3_idx`(`shopId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobileItems` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobileID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT 'pending',
    `confirmedBy` VARCHAR(45) NULL,
    `transferId` VARCHAR(45) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_mobileItems_1_idx`(`shopID`),
    INDEX `fk_mobileItems_2_idx`(`mobileID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobilefinance` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `financer` VARCHAR(45) NOT NULL DEFAULT 'captech',
    `financeAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `financeStatus` VARCHAR(45) NULL DEFAULT 'paid',
    `productID` INTEGER NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_financer_1_idx`(`productID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobiles` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `IMEI` VARCHAR(255) NULL,
    `batchNumber` VARCHAR(255) NOT NULL DEFAULT '0',
    `supplierId` INTEGER NOT NULL,
    `availableStock` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `commission` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `productCost` DECIMAL(10, 2) NOT NULL,
    `colour` VARCHAR(45) NOT NULL,
    `finance` INTEGER NULL,
    `stockStatus` VARCHAR(45) NULL DEFAULT 'available',
    `CategoryId` INTEGER NOT NULL,
    `barcodePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `storage` VARCHAR(45) NULL,
    `phoneType` VARCHAR(45) NULL,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `itemType` VARCHAR(45) NULL DEFAULT 'mobiles',

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `IMEI_UNIQUE`(`IMEI`),
    INDEX `fk_mobiles_1_idx`(`CategoryId`),
    INDEX `fk_mobiles_2_idx`(`supplierId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobilesales` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `soldPrice` DECIMAL(10, 2) NOT NULL,
    `commission` DECIMAL(10, 2) NOT NULL,
    `profit` DECIMAL(10, 2) NOT NULL,
    `customerName` VARCHAR(45) NULL DEFAULT 'doe',
    `customerEmail` VARCHAR(45) NULL DEFAULT 'doe@gmail.com',
    `customerPhoneNumber` VARCHAR(45) NULL DEFAULT '07000000',
    `paymentmethod` ENUM('mpesa', 'cash', 'creditcard') NULL,
    `finance` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `commisssionStatus` ENUM('pending', 'paid') NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_mobilesales_1_idx`(`productID`),
    INDEX `fk_mobilesales_2_idx`(`sellerId`),
    INDEX `fk_mobilesales_3_idx`(`shopID`),
    INDEX `fk_mobilesales_4_idx`(`finance`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobilestransferHistory` (
    `idmobilestransferHistory` INTEGER NOT NULL,

    PRIMARY KEY (`idmobilestransferHistory`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobiletransferhistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fromshop` INTEGER NOT NULL,
    `toshop` INTEGER NOT NULL,
    `confirmedBy` INTEGER NULL,
    `status` VARCHAR(45) NULL DEFAULT 'pending',
    `type` ENUM('distribution', 'transfer') NULL,
    `productID` INTEGER NULL,
    `transferdBy` INTEGER NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_mobiletransferhistory_1_idx`(`productID`),
    INDEX `fk_mobiletransferhistory_2_idx`(`fromshop`),
    INDEX `fk_mobiletransferhistory_3_idx`(`toshop`),
    INDEX `fk_mobiletransferhistory_4_idx`(`confirmedBy`),
    INDEX `fk_mobiletransferhistory_5_idx`(`transferdBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shops` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `shopName` VARCHAR(25) NOT NULL,
    `address` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierAddress` VARCHAR(45) NOT NULL,
    `supplierName` VARCHAR(45) NOT NULL,
    `contact` VARCHAR(45) NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accessories` ADD CONSTRAINT `fk_accessories_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessories` ADD CONSTRAINT `fk_accessories_2` FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_acccessoryHistory_accessory__1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_accessoryHistory_1` FOREIGN KEY (`shopId`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_accessoryHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_accessoryItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_accessoryItems_2` FOREIGN KEY (`accessoryID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_3` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_2` FOREIGN KEY (`fromshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_3` FOREIGN KEY (`toshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actors` ADD CONSTRAINT `fk_actors_shops1` FOREIGN KEY (`assignedshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_2` FOREIGN KEY (`userID`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_3` FOREIGN KEY (`shopId`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_2` FOREIGN KEY (`mobileID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilefinance` ADD CONSTRAINT `fk_financer_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiles` ADD CONSTRAINT `fk_mobiles_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiles` ADD CONSTRAINT `fk_mobiles_2` FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_3` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_4` FOREIGN KEY (`finance`) REFERENCES `mobilefinance`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferhistory` ADD CONSTRAINT `fk_mobiletransferhistory_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferhistory` ADD CONSTRAINT `fk_mobiletransferhistory_2` FOREIGN KEY (`fromshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferhistory` ADD CONSTRAINT `fk_mobiletransferhistory_3` FOREIGN KEY (`toshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferhistory` ADD CONSTRAINT `fk_mobiletransferhistory_4` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferhistory` ADD CONSTRAINT `fk_mobiletransferhistory_5` FOREIGN KEY (`transferdBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
