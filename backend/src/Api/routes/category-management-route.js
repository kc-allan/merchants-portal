// Import necessary modules
import express from 'express';
const router = express.Router();
import { verifyUser } from '../../middleware/verification.js';
import { createCategory, updateCategory, getCategoryById, getAllCategories } from '../controllers/category-managment-controller.js';


router.get('/all', verifyUser, getAllCategories);

router.get('/get-category/:id', verifyUser, getCategoryById);

router.post('/create-category', verifyUser, createCategory);

router.put('/update/:id', verifyUser, updateCategory);

// // Delete a category
// router.delete('/:id', deleteCategory);

export default router;