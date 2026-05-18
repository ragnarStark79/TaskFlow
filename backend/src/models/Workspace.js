const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkspaceSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['owner', 'admin', 'read_write', 'read_only', 'member', 'guest'],
            default: 'read_write'
        }
    }],
    pendingRequests: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now }
    }],
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
