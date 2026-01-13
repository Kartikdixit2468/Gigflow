import express from 'express';
import { body } from 'express-validator';
import {
  submitBid,
  getBidsForGig,
  getMyBids,
  hireBid,
  updateBid,
  withdrawBid
} from '../controllers/bid.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { apiLimiter, strictLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

// Validation
const bidValidation = [
  body('gigId').isMongoId().withMessage('Valid gig ID is required'),
  body('message').trim().isLength({ min: 20, max: 1000 }).withMessage('Message must be 20-1000 characters'),
  body('proposedPrice').isNumeric().isFloat({ min: 1 }).withMessage('Price must be at least $1'),
  body('deliveryTime').isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  validate
];

const bidUpdateValidation = [
  body('message').trim().isLength({ min: 20, max: 1000 }).withMessage('Message must be 20-1000 characters'),
  body('proposedPrice').isNumeric().isFloat({ min: 1 }).withMessage('Price must be at least $1'),
  body('deliveryTime').isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  validate
];

// Routes
router.post('/', authenticate, apiLimiter, bidValidation, submitBid);
router.get('/my-bids', authenticate, getMyBids);
router.get('/:gigId', authenticate, getBidsForGig);
router.patch('/:bidId', authenticate, bidUpdateValidation, updateBid);
router.delete('/:bidId', authenticate, withdrawBid);

// Hiring route with strict rate limiting (prevents race conditions + rate limits)
router.patch('/:bidId/hire', authenticate, strictLimiter, hireBid);

export default router;
