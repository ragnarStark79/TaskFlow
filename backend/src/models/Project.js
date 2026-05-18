const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Default columns matching Kanban methodology
const DEFAULT_COLUMNS = [
    { id: 'backlog', name: 'Backlog', position: 0 },
    { id: 'todo', name: 'Todo', position: 1 },
    { id: 'in_progress', name: 'In Progress', position: 2 },
    { id: 'review', name: 'Review', position: 3 },
    { id: 'done', name: 'Done', position: 4 },
];

const ProjectSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
    origin: { type: String, enum: ['tasks', 'workspace'], default: 'tasks' },
    color: { type: String, default: '#1D4ED8' },
    dueDate: { type: Date },
    members: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
    }],
    columns: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        position: { type: Number, default: 0 }
    }],
}, { timestamps: true });

// Pre-save: inject default columns on creation if none provided
ProjectSchema.pre('save', function (next) {
    if (this.isNew && (!this.columns || this.columns.length === 0)) {
        this.columns = DEFAULT_COLUMNS;
    }
    // If origin is not explicitly set, infer from workspace presence for new docs
    if (this.isNew && !this.origin) {
        this.origin = this.workspace ? 'workspace' : 'tasks';
    }
    next();
});

module.exports = mongoose.model('Project', ProjectSchema);
