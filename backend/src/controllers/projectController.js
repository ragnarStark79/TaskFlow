const projectService = require('../services/projectService');

const createProject = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const project = await projectService.createProject(req.user._id, workspaceId, req.body, 'workspace');
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const createProjectStandalone = async (req, res, next) => {
    try {
        const workspaceId = req.body.workspaceId || null;
        const project = await projectService.createProject(req.user._id, workspaceId, req.body, 'tasks');
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getProjects = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const projects = await projectService.getProjectsByWorkspace(workspaceId);
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        next(error);
    }
};

const getMyProjects = async (req, res, next) => {
    try {
        const projects = await projectService.getProjectsForUser(req.user._id);
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        next(error);
    }
};

const getProject = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(404);
        next(error);
    }
};

const updateProject = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

const deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.status(200).json({ success: true, message: 'Project deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createProject, createProjectStandalone, getProjects, getMyProjects, getProject, updateProject, deleteProject };
