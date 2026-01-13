import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser,
  googleAuthSuccess,
  googleAuthFailure
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/api/auth/google/failure',
      session: false
    }),
    googleAuthSuccess
  );

  router.get('/google/failure', googleAuthFailure);
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      success: false, 
      message: 'Google OAuth is not configured' 
    });
  });
}

export default router;
