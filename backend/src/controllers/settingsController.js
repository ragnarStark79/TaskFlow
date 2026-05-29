const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc   Update user profile (name, avatar)
 * @route  PUT /api/settings/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (name !== undefined) {
            if (!name.trim()) {
                res.status(400);
                throw new Error('Name cannot be empty');
            }
            user.name = name.trim();
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        // Return updated user without sensitive fields
        const updatedUser = await User.findById(user._id).select('-password -refreshTokens');

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Change user password
 * @route  PUT /api/settings/password
 * @access Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400);
            throw new Error('Please provide current and new password');
        }

        if (newPassword.length < 6) {
            res.status(400);
            throw new Error('New password must be at least 6 characters');
        }

        // Fetch user WITH password field (it's select: false by default)
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            res.status(401);
            throw new Error('Current password is incorrect');
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Update theme preference
 * @route  PUT /api/settings/theme
 * @access Private
 */
const updateTheme = async (req, res, next) => {
    try {
        const { theme } = req.body;

        if (!theme || !['dark', 'light'].includes(theme)) {
            res.status(400);
            throw new Error('Theme must be either "dark" or "light"');
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { theme },
            { new: true }
        ).select('-password -refreshTokens');

        res.status(200).json({
            success: true,
            data: user,
            message: `Theme switched to ${theme} mode`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    changePassword,
    updateTheme,
};
