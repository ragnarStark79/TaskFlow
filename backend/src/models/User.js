const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true },
    password:      { type: String, required: true, select: false },  // hidden by default
    avatar:        { type: String, default: '' },
    role:          { type: String, enum: ['user', 'admin'], default: 'user' },
    theme:         { type: String, enum: ['dark', 'light'], default: 'dark' },
    refreshTokens: [{ token: String, createdAt: Date }],
    isVerified:    { type: Boolean, default: false },
    lastSeen:      { type: Date, default: Date.now },
}, { timestamps: true });

// Pre-save hook to hash password before persisting to DB
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare password during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
