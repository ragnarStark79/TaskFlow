const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status:      { 
        type: String, 
        enum: ['backlog', 'todo', 'in_progress', 'review', 'done'], 
        default: 'todo' 
    },
    priority:    { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium' 
    },
    project:     { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignees:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate:     { type: Date },
    labels:      [{ 
        name:  { type: String }, 
        color: { type: String } 
    }],
    subtasks:    [{ 
        title:     { type: String }, 
        completed: { type: Boolean, default: false } 
    }],
    attachments: [{ 
        filename:   { type: String }, 
        url:        { type: String }, 
        size:       { type: Number }, 
        uploadedAt: { type: Date, default: Date.now } 
    }],
    comments:    [{
        user:      { type: Schema.Types.ObjectId, ref: 'User' },
        text:      { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    // Activity log — automatically tracks all mutations to this task
    activityLog: [{
        user:      { type: Schema.Types.ObjectId, ref: 'User' },
        action:    { type: String }, // 'created', 'updated', 'moved', 'commented', 'attached', 'subtask_added', 'subtask_toggled'
        field:     { type: String }, // which field changed (e.g. 'status', 'priority')
        oldValue:  { type: Schema.Types.Mixed },
        newValue:  { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now }
    }],
    position:    { type: Number, default: 0 }, // Ordering within column
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
