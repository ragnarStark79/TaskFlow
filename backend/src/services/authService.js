const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 */
const registerUser = async (name, email, password) => {
    // Determine if User exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Encrypts automatically via Mongoose pre-save hook
    const user = await User.create({ name, email, password });

    if (!user) {
        throw new Error('Invalid user data received');
    }

    return compileAuthPayload(user);
};

/**
 * Validate credentials and login
 */
const loginUser = async (email, password) => {
    // Select password since it's hidden by default in the Schema
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.matchPassword(password))) {
        // Update Last Seen
        user.lastSeen = Date.now();
        await user.save();
        
        return compileAuthPayload(user);
    } else {
        throw new Error('Invalid email or password');
    }
};

/**
 * Validates a Rotation cycle and grants a new token suite
 */
const refreshUserToken = async (cookies) => {
    const currentRefreshToken = cookies.jwt;
    if (!currentRefreshToken) {
        throw new Error('Unauthorized, no refresh token');
    }

    let decoded;
    try {
        decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new Error('Forbidden, token expired or invalid');
    }

    // Find user and explicitly fetch their refresh tokens
    const user = await User.findById(decoded.id);

    if (!user) {
        throw new Error('User no longer exists');
    }

    // Token Rotation mechanics: check if this token actually belongs to the user
    const tokenExists = user.refreshTokens.find(rt => rt.token === currentRefreshToken);
    
    if (!tokenExists) {
        // COMPROMISED: Token reuse detected. 
        // Clear all refresh tokens immediately for safety
        user.refreshTokens = [];
        await user.save();
        throw new Error('Security Breach: Invalid refresh token reused. All active sessions terminated.');
    }

    // Filter out the "used" token from the database
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== currentRefreshToken);

    // Provide payload
    return compileAuthPayload(user);
};

/**
 * Standard logout (invalidates token)
 */
const logoutUser = async (userId, currentRefreshToken) => {
    const user = await User.findById(userId);
    if (!user) return;

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== currentRefreshToken);
    await user.save();
    return true;
};

/**
 * Helpers
 */
const compileAuthPayload = async (user) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store state in user document for tracking/rotation
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        accessToken,
        refreshToken
    };
};

module.exports = {
    registerUser,
    loginUser,
    refreshUserToken,
    logoutUser
};
