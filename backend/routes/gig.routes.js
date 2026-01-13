import express from 'express';
import { body } from 'express-validator';
import {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs
} from '../controllers/gig.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

// Validation
const gigValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('budget').isNumeric().isFloat({ min: 1 }).withMessage('Budget must be at least $1'),
  validate
];

// Routes
router.get('/', apiLimiter, getAllGigs);
router.get('/my-gigs', authenticate, getMyGigs);
router.get('/:id', getGigById);
router.post('/', authenticate, apiLimiter, gigValidation, createGig);
router.put('/:id', authenticate, gigValidation, updateGig);
router.delete('/:id', authenticate, deleteGig);

export default router;
