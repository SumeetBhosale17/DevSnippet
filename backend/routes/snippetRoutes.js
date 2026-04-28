const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
    create,
    getAll,
    getPublic,
    getOne,
    update,
    remove,
    generateShareLink,
    shareWithUser,
    generateSummary,
    getTrendingTags,
    getDashboardStats
} = require('../controllers/snippetController');

/**
 * Optional auth middleware: attaches req.user if a valid token
 * is present, but does NOT reject unauthenticated requests.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const jwt = require('jsonwebtoken');
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // Invalid token is fine for optional auth — just proceed without user
    }
    next();
};

// Public routes
router.get('/public', getPublic);
router.get('/tags/trending', getTrendingTags);

// Routes with optional auth (returns different data based on auth status)
router.get('/', optionalAuth, getAll);

// Dashboard stats (Protected)
router.get('/dashboard-stats', verifyToken, getDashboardStats);

router.get('/:id', optionalAuth, getOne);

// Protected routes (require authentication)
router.post('/', verifyToken, create);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

// Sharing routes
router.post('/:id/share/link', verifyToken, generateShareLink);
router.post('/:id/share/user', verifyToken, shareWithUser);

// AI Summarization
router.post('/:id/summarize', verifyToken, generateSummary);

// Comments routing
const commentRoutes = require('./commentRoutes');
router.use('/:id/comments', commentRoutes);

module.exports = router;
