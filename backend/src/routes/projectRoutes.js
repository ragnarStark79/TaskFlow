const express = require('express');
const router = express.Router();
const { createProject, createProjectStandalone, getProjects, getMyProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Workspace-scoped project listing and creation
router.route('/workspace/:workspaceId')
    .get(getProjects)
    .post(createProject);

// Standalone project creation (optional workspace attachment)
router.route('/')
    .post(createProjectStandalone);

// User-scoped projects
router.route('/me')
    .get(getMyProjects);

// Single project operations
router.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

module.exports = router;
