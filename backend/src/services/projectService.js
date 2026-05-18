const Project = require('../models/Project');

const createProject = async (userId, workspaceId, data, origin = 'tasks') => {
    const project = await Project.create({
        name: data.name,
        description: data.description || '',
        workspace: workspaceId || null,
        origin: origin || (workspaceId ? 'workspace' : 'tasks'),
        color: data.color || '#1D4ED8',
        dueDate: data.dueDate || null,
        members: [{ user: userId, role: 'owner' }],
        // columns auto-injected via pre-save hook
    });

    return project;
};

const getProjectsByWorkspace = async (workspaceId) => {
    return await Project.find({ workspace: workspaceId })
        .populate('members.user', 'name email avatar')
        .sort({ createdAt: -1 });
};

const getProjectsForUser = async (userId) => {
    return await Project.find({ 'members.user': userId })
        .populate('workspace', 'name')
        .sort({ updatedAt: -1 });
};

const getProjectById = async (projectId) => {
    const project = await Project.findById(projectId)
        .populate('members.user', 'name email avatar')
        .populate('workspace', 'name');

    if (!project) {
        throw new Error('Project not found');
    }

    return project;
};

const updateProject = async (projectId, updates) => {
    const project = await Project.findByIdAndUpdate(projectId, updates, { new: true })
        .populate('workspace', 'name');
    if (!project) throw new Error('Project not found');
    return project;
};

const deleteProject = async (projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');
    await project.deleteOne();
    return true;
};

module.exports = {
    createProject,
    getProjectsByWorkspace,
    getProjectsForUser,
    getProjectById,
    updateProject,
    deleteProject
};
