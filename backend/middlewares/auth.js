const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches the decoded user payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            data: null,
            message: 'Access denied. No token provided.'
        });
    }

    // Expect "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            data: null,
            message: 'Access denied. Malformed token.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, email }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            data: null,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = { verifyToken };
