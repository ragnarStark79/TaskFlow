const workspaceService = require('../services/workspaceService');

const createWorkspace = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400);
            throw new Error('Workspace name is required');
        }

        const workspace = await workspaceService.createWorkspace(req.user._id, name);
        res.status(201).json({ success: true, data: workspace });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await workspaceService.getUserWorkspaces(req.user._id);
        res.status(200).json({ success: true, count: workspaces.length, data: workspaces });
    } catch (error) {
        next(error);
    }
};

const updateWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workspace = await workspaceService.updateWorkspace(req.user._id, id, req.body);
        res.status(200).json({ success: true, data: workspace });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const deleteWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        await workspaceService.deleteWorkspace(req.user._id, id);
        res.status(200).json({ success: true, message: 'Workspace effectively destroyed' });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const requestJoinWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        await workspaceService.requestJoin(id, req.user._id);
        res.status(201).json({ success: true, message: 'Join request sent' });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const getJoinRequests = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requests = await workspaceService.getJoinRequests(id, req.user._id);
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const approveJoinRequest = async (req, res, next) => {
    try {
        const { id, requestId } = req.params;
        await workspaceService.approveJoinRequest(id, requestId, req.user._id);
        res.status(200).json({ success: true, message: 'Member approved' });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const denyJoinRequest = async (req, res, next) => {
    try {
        const { id, requestId } = req.params;
        await workspaceService.denyJoinRequest(id, requestId, req.user._id);
        res.status(200).json({ success: true, message: 'Request denied' });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const updateMemberRole = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const { role } = req.body;
        const workspace = await workspaceService.updateMemberRole(id, req.user._id, memberId, role);
        res.status(200).json({ success: true, data: workspace });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const removeMember = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const workspace = await workspaceService.removeMember(id, req.user._id, memberId);
        res.status(200).json({ success: true, data: workspace });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

module.exports = {
    createWorkspace,
    getWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    requestJoinWorkspace,
    getJoinRequests,
    approveJoinRequest,
    denyJoinRequest,
    updateMemberRole,
    removeMember
};
