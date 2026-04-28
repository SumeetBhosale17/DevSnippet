const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { search } = require('../controllers/searchController');

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but does NOT reject unauthenticated requests.
 * This lets search see private snippets for the logged-in owner.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // Invalid token — proceed as unauthenticated
    }
    next();
};

// GET /api/search?q=keyword&language=python&tags=beginner,hello-world&page=1&limit=20
router.get('/', optionalAuth, search);

module.exports = router;
