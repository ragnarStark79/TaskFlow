const Workspace = require('../models/Workspace');

// Generate unique URL-friendly slug
const generateSlug = async (name) => {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const exists = await Workspace.findOne({ slug });
    if (exists) {
        slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }
    return slug;
};

const createWorkspace = async (userId, name) => {
    const slug = await generateSlug(name);

    const workspace = await Workspace.create({
        name,
        slug,
        owner: userId,
        members: [{ user: userId, role: 'owner' }] // Creator is automatically 'owner'
    });

    return workspace;
};

const getUserWorkspaces = async (userId) => {
    // Find any workspace where the user's ID exists inside the members array
    return await Workspace.find({ 'members.user': userId })
        .select('-pendingRequests')
        .populate('members.user', 'name email avatar');
};

const updateWorkspace = async (userId, workspaceId, updates) => {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    // Role-Based Access Check: Is the requesting user an owner?
    const userRole = workspace.members.find(m => m.user.toString() === userId.toString())?.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can update the workspace');
    }

    // Apply allowed updates
    if (updates.name) {
        workspace.name = updates.name;
    }

    await workspace.save();
    return workspace;
};

const deleteWorkspace = async (userId, workspaceId) => {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    // Strict RBAC: ONLY the owner can explicitly nuke a workspace
    const userRole = workspace.members.find(m => m.user.toString() === userId.toString())?.role;
    if (userRole !== 'owner') {
        throw new Error('Unauthorized: Only the workspace owner can delete it');
    }

    await workspace.deleteOne();
    return true;
};

const requestJoin = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const isMember = workspace.members.some(m => m.user.toString() === userId.toString());
    if (isMember) throw new Error('Already a member of this workspace');

    const alreadyRequested = workspace.pendingRequests.some(r => r.user.toString() === userId.toString());
    if (alreadyRequested) throw new Error('Join request already sent');

    workspace.pendingRequests.push({ user: userId });
    await workspace.save();

    return true;
};

const getJoinRequests = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId)
        .populate('pendingRequests.user', 'name email avatar');
    if (!workspace) throw new Error('Workspace not found');

    const userRole = workspace.members.find(m => m.user.toString() === userId.toString())?.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can view join requests');
    }

    return workspace.pendingRequests;
};

const approveJoinRequest = async (workspaceId, requestId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const userRole = workspace.members.find(m => m.user.toString() === userId.toString())?.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can approve join requests');
    }

    const request = workspace.pendingRequests.id(requestId);
    if (!request) throw new Error('Join request not found');

    const requesterId = request.user.toString();
    const alreadyMember = workspace.members.some(m => m.user.toString() === requesterId);
    if (!alreadyMember) {
        workspace.members.push({ user: requesterId, role: 'read_write' });
    }

    workspace.pendingRequests = workspace.pendingRequests.filter(
        r => r._id.toString() !== requestId.toString()
    );
    await workspace.save();

    return true;
};

const denyJoinRequest = async (workspaceId, requestId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const userRole = workspace.members.find(m => m.user.toString() === userId.toString())?.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can deny join requests');
    }

    const request = workspace.pendingRequests.id(requestId);
    if (!request) throw new Error('Join request not found');

    workspace.pendingRequests = workspace.pendingRequests.filter(
        r => r._id.toString() !== requestId.toString()
    );
    await workspace.save();

    return true;
};

const updateMemberRole = async (workspaceId, actorId, memberId, role) => {
    const workspace = await Workspace.findById(workspaceId)
        .populate('members.user', 'name email avatar');
    if (!workspace) throw new Error('Workspace not found');

    const actorRole = workspace.members.find(m => m.user._id.toString() === actorId.toString())?.role;
    if (actorRole !== 'owner' && actorRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can update members');
    }

    const allowedRoles = ['admin', 'read_write', 'read_only', 'member', 'guest'];
    if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    const member = workspace.members.find(m => m.user._id.toString() === memberId.toString());
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Cannot change owner role');

    member.role = role;
    await workspace.save();
    return workspace;
};

const removeMember = async (workspaceId, actorId, memberId) => {
    const workspace = await Workspace.findById(workspaceId)
        .populate('members.user', 'name email avatar');
    if (!workspace) throw new Error('Workspace not found');

    const actorRole = workspace.members.find(m => m.user._id.toString() === actorId.toString())?.role;
    if (actorRole !== 'owner' && actorRole !== 'admin') {
        throw new Error('Unauthorized: Only an owner or admin can remove members');
    }

    const member = workspace.members.find(m => m.user._id.toString() === memberId.toString());
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Cannot remove workspace owner');

    workspace.members = workspace.members.filter(m => m.user._id.toString() !== memberId.toString());
    await workspace.save();
    return workspace;
};

module.exports = {
    createWorkspace,
    getUserWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    requestJoin,
    getJoinRequests,
    approveJoinRequest,
    denyJoinRequest,
    updateMemberRole,
    removeMember
};
