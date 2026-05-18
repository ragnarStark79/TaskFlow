const taskService = require('../services/taskService');
const { emitTaskCreated, emitTaskUpdated, emitTaskMoved, emitTaskDeleted, emitCommentAdded } = require('../services/socketService');

const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const task = await taskService.createTask(req.user._id, projectId, req.body);

        // Emit real-time event
        emitTaskCreated(projectId, task);

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getTasks = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const tasks = await taskService.getTasksByProject(projectId);
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

const getMyTasks = async (req, res, next) => {
    try {
        const tasks = await taskService.getMyTasks(req.user._id);
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

const getTask = async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(404);
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user._id);

        // Emit real-time event
        emitTaskUpdated(task.project.toString(), task);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

const moveTask = async (req, res, next) => {
    try {
        const { status, position } = req.body;
        const task = await taskService.moveTask(req.params.id, status, position, req.user._id);

        // Emit real-time event
        emitTaskMoved(task.project.toString(), task);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        // Get task before deleting to know which project room to notify
        const task = await taskService.getTaskById(req.params.id);
        const projectId = task.project._id || task.project;

        await taskService.deleteTask(req.params.id);

        // Emit real-time event
        emitTaskDeleted(projectId.toString(), req.params.id);

        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};

// --- Comment Handlers ---

const addComment = async (req, res, next) => {
    try {
        const task = await taskService.addComment(req.params.id, req.user._id, req.body.text);

        // Emit real-time event
        const projectId = task.project._id || task.project;
        emitCommentAdded(projectId.toString(), task);

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const task = await taskService.deleteComment(req.params.id, req.params.commentId);
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// --- Subtask Handlers ---

const addSubtask = async (req, res, next) => {
    try {
        const task = await taskService.addSubtask(req.params.id, req.body.title, req.user._id);
        emitTaskUpdated(task.project.toString(), task);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

const toggleSubtask = async (req, res, next) => {
    try {
        const task = await taskService.toggleSubtask(req.params.id, req.params.subtaskId, req.user._id);
        emitTaskUpdated(task.project.toString(), task);
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// --- Attachment Handler (uses Multer) ---

const uploadAttachment = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const attachment = {
            filename: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            size: req.file.size,
        };

        const task = await taskService.addAttachment(req.params.id, attachment, req.user._id);
        emitTaskUpdated(task.project.toString(), task);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// --- Activity Log ---

const getActivityLog = async (req, res, next) => {
    try {
        const log = await taskService.getActivityLog(req.params.id);
        res.status(200).json({ success: true, data: log });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask, getTasks, getMyTasks, getTask, updateTask, moveTask, deleteTask,
    addComment, deleteComment,
    addSubtask, toggleSubtask,
    uploadAttachment, getActivityLog
};
