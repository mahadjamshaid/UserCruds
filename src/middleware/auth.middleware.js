const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT token from the Authorization header.
 * Expected format: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'No token provided, authorization denied'
        });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user information from payload to request object
        req.user = decoded;
        
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Token is not valid or has expired'
        });
    }
};

module.exports = authMiddleware;
