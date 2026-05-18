const Task = require('../models/Task');

// --- Helper: push activity log entry ---
const logActivity = (task, userId, action, field = null, oldValue = null, newValue = null) => {
    task.activityLog.push({
        user: userId,
        action,
        field,
        oldValue,
        newValue,
        timestamp: new Date()
    });
};

// --- CRUD Operations ---

const createTask = async (userId, projectId, data) => {
    // Calculate the next position in the target column
    const lastTask = await Task.findOne({ project: projectId, status: data.status || 'todo' })
        .sort({ position: -1 });
    const nextPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
        title: data.title,
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        project: projectId,
        createdBy: userId,
        assignees: data.assignees || [],
        dueDate: data.dueDate || null,
        labels: data.labels || [],
        position: nextPosition,
        activityLog: [{
            user: userId,
            action: 'created',
            field: null,
            oldValue: null,
            newValue: data.title,
            timestamp: new Date()
        }]
    });

    return task;
};

const getTasksByProject = async (projectId) => {
    return await Task.find({ project: projectId })
        .populate('assignees', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ position: 1 });
};

const getMyTasks = async (userId) => {
    return await Task.find({ assignees: userId })
        .populate({
            path: 'project',
            select: 'name color workspace origin',
            populate: { path: 'workspace', select: 'name' }
        })
        .populate('assignees', 'name email avatar')
        .sort({ dueDate: 1 });
};

const getTaskById = async (taskId) => {
    const task = await Task.findById(taskId)
        .populate('assignees', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('comments.user', 'name email avatar')
        .populate('activityLog.user', 'name email avatar');

    if (!task) throw new Error('Task not found');
    return task;
};

/**
 * Update task fields with automatic activity logging.
 * Diffs old vs new values for every changed field.
 */
const updateTask = async (taskId, updates, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    // Track changes before applying
    const trackedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    for (const field of trackedFields) {
        if (updates[field] !== undefined && String(updates[field]) !== String(task[field])) {
            logActivity(task, userId, 'updated', field, task[field], updates[field]);
        }
    }

    // Handle labels/assignees array changes
    if (updates.labels) {
        logActivity(task, userId, 'updated', 'labels', task.labels, updates.labels);
    }
    if (updates.assignees) {
        logActivity(task, userId, 'updated', 'assignees', task.assignees, updates.assignees);
    }

    // Apply updates
    Object.assign(task, updates);
    await task.save();

    return await getTaskById(taskId);
};

/**
 * Dedicated drag-and-drop handler.
 * Updates both status (column) and position (order) atomically.
 */
const moveTask = async (taskId, newStatus, newPosition, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;
    const oldPosition = task.position;

    // If moving within the same column, re-order siblings
    if (oldStatus === newStatus) {
        if (oldPosition < newPosition) {
            await Task.updateMany(
                { project: task.project, status: newStatus, position: { $gt: oldPosition, $lte: newPosition } },
                { $inc: { position: -1 } }
            );
        } else {
            await Task.updateMany(
                { project: task.project, status: newStatus, position: { $gte: newPosition, $lt: oldPosition } },
                { $inc: { position: 1 } }
            );
        }
    } else {
        // Moving across columns: close the gap in the old column
        await Task.updateMany(
            { project: task.project, status: oldStatus, position: { $gt: oldPosition } },
            { $inc: { position: -1 } }
        );
        // Open a gap in the new column
        await Task.updateMany(
            { project: task.project, status: newStatus, position: { $gte: newPosition } },
            { $inc: { position: 1 } }
        );
    }

    // Log the move
    if (oldStatus !== newStatus) {
        logActivity(task, userId, 'moved', 'status', oldStatus, newStatus);
    }

    task.status = newStatus;
    task.position = newPosition;
    await task.save();

    return task;
};

const deleteTask = async (taskId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    await task.deleteOne();
    return true;
};

// --- Comment Operations ---

const addComment = async (taskId, userId, text) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.comments.push({ user: userId, text, createdAt: new Date() });
    logActivity(task, userId, 'commented', 'comments', null, text);
    await task.save();

    return await getTaskById(taskId);
};

const deleteComment = async (taskId, commentId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.comments = task.comments.filter(c => c._id.toString() !== commentId);
    await task.save();

    return await getTaskById(taskId);
};

// --- Subtask Operations ---

const addSubtask = async (taskId, title, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.subtasks.push({ title, completed: false });
    logActivity(task, userId, 'subtask_added', 'subtasks', null, title);
    await task.save();

    return task;
};

const toggleSubtask = async (taskId, subtaskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) throw new Error('Subtask not found');

    subtask.completed = !subtask.completed;
    logActivity(task, userId, 'subtask_toggled', 'subtasks', !subtask.completed, subtask.completed);
    await task.save();

    return task;
};

// --- Attachment Operations ---

const addAttachment = async (taskId, attachment, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.attachments.push({
        filename: attachment.filename,
        url: attachment.url,
        size: attachment.size,
        uploadedAt: new Date()
    });
    logActivity(task, userId, 'attached', 'attachments', null, attachment.filename);
    await task.save();

    return task;
};

// --- Activity Log ---

const getActivityLog = async (taskId) => {
    const task = await Task.findById(taskId)
        .populate('activityLog.user', 'name email avatar')
        .select('activityLog');

    if (!task) throw new Error('Task not found');
    return task.activityLog.sort((a, b) => b.timestamp - a.timestamp);
};

module.exports = {
    createTask,
    getTasksByProject,
    getMyTasks,
    getTaskById,
    updateTask,
    moveTask,
    deleteTask,
    addComment,
    deleteComment,
    addSubtask,
    toggleSubtask,
    addAttachment,
    getActivityLog
};
