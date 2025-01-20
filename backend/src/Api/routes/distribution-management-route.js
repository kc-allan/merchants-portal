import express from "express"

const router = express.Router();

import { verifyUser } from "../../middleware/verification.js"


import {
    handleBulkDistibution,
} from "../controllers/distribution-management-controller.js"



router.post("/bulk-distribution", verifyUser, handleBulkDistibution)

export default router;