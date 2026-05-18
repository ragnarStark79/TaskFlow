const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check header for 'Bearer <token>'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract numerical token
            token = req.headers.authorization.split(' ')[1];

            // Decode and verify the signature using short-lived secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Hydrate the request object with the User instance (minus password and tokens)
            req.user = await User.findById(decoded.id).select('-password -refreshTokens');

            next();
        } catch (error) {
            console.error('Authentication Error:', error.message);
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token provided'));
    }
};

module.exports = { protect };
