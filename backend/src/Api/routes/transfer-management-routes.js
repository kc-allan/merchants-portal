import express from "express"

const router = express.Router();

import { verifyUser } from "../../middleware/verification.js"


import {
    handleBulkTransfer,
} from "../controllers/transfer-management-controller.js"



router.post("/bulk-transfer", verifyUser, handleBulkTransfer)

export default router;