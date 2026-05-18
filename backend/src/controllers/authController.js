const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }

        const data = await authService.registerUser(name, email, password);
        sendHttpToken(res, data, 201);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        const data = await authService.loginUser(email, password);
        sendHttpToken(res, data, 200);
    } catch (error) {
        res.status(401);
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const data = await authService.refreshUserToken(req.cookies);
        sendHttpToken(res, data, 200);
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // req.user might not exist if they logout while token is expired but cookie exists
        const currentRefreshToken = req.cookies.jwt;

        // Even if not strictly Authorized by middleware, attempt to scrub token
        if (req.user && currentRefreshToken) {
            await authService.logoutUser(req.user._id, currentRefreshToken);
        }

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        // req.user is hydrated by the authMiddleware (protect)
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
};

// Helper to bundle the response and cookie logic
const sendHttpToken = (res, data, status) => {
    // Deconstruct refreshToken out to hide it from JSON response body
    const { refreshToken, ...publicData } = data;

    // Attach Refresh Token exclusively to an HTTP-Only cookie to prevent XSS
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching JWT expiration
    });

    res.status(status).json({
        success: true,
        data: publicData
    });
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    getMe
};
