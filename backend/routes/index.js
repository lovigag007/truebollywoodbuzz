const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const movieController = require('../controllers/movieController');
const adminController = require('../controllers/adminController');
const feedbackController = require('../controllers/feedbackController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// OTP rate limit
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { success: false, message: 'Too many OTP requests. Try again in 10 minutes.' } });

// ─── AUTH ────────────────────────────────────────────────
router.post('/auth/send-otp', otpLimiter, authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.get('/auth/me', authenticate, authController.getMe);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ─── MOVIES (public) ────────────────────────────────────
router.get('/movies', movieController.getMovies);
router.get('/movies/trending', movieController.getTrending);
router.get('/movies/search/suggestions', movieController.getSearchSuggestions);
router.get('/movies/:slug', optionalAuth, movieController.getMovieBySlug);
router.post('/movies/:id/rate', authenticate, movieController.rateMovie);
router.post('/movies/:id/share', movieController.trackShare);

// ─── FEEDBACK ───────────────────────────────────────────
router.post('/feedback', optionalAuth, feedbackController.submitFeedback);

// ─── ADMIN ──────────────────────────────────────────────
router.use('/admin', authenticate, requireAdmin);

router.get('/admin/stats', adminController.getDashboardStats);

router.get('/admin/movies', movieController.adminGetMovies);
router.post('/admin/movies', upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), movieController.createMovie);
router.put('/admin/movies/:id', upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), movieController.updateMovie);
router.delete('/admin/movies/:id', movieController.deleteMovie);

router.get('/admin/users', adminController.getUsers);
router.put('/admin/users/:id/toggle', adminController.toggleUser);

router.get('/admin/feedbacks', adminController.getFeedbacks);
router.put('/admin/feedbacks/:id', adminController.updateFeedback);
router.delete('/admin/ratings/:id', adminController.deleteRating);

module.exports = router;
