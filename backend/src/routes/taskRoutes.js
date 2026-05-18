const express = require('express');
const router = express.Router();
const {
    createTask, getTasks, getTask, updateTask, moveTask, deleteTask,
    addComment, deleteComment,
    addSubtask, toggleSubtask,
    uploadAttachment, getActivityLog
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createTaskSchema, updateTaskSchema, moveTaskSchema, commentSchema, subtaskSchema } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(protect);

// Get all tasks assigned to the current user across all projects
router.get('/me', require('../controllers/taskController').getMyTasks);

// Project-scoped task listing and creation
router.route('/project/:projectId')
    .get(getTasks)
    .post(validate(createTaskSchema), createTask);

// Single task operations
router.route('/:id')
    .get(getTask)
    .put(validate(updateTaskSchema), updateTask)
    .delete(deleteTask);

// Drag-and-drop endpoint
router.patch('/:id/move', validate(moveTaskSchema), moveTask);

// Comment endpoints
router.post('/:id/comments', validate(commentSchema), addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// Subtask endpoints
router.post('/:id/subtasks', validate(subtaskSchema), addSubtask);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

// Attachment endpoint (Multer single file upload)
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

// Activity log
router.get('/:id/activity', getActivityLog);

module.exports = router;
