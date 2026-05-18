import api from './api';

export const workspaceApi = {
    getAll: async () => {
        const { data } = await api.get('/workspaces');
        return data;
    },

    create: async (name) => {
        const { data } = await api.post('/workspaces', { name });
        return data;
    },

    update: async (id, payload) => {
        const { data } = await api.put(`/workspaces/${id}`, payload);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/workspaces/${id}`);
        return data;
    },

    requestJoin: async (workspaceId) => {
        const { data } = await api.post(`/workspaces/${workspaceId}/join-requests`);
        return data;
    },

    getJoinRequests: async (workspaceId) => {
        const { data } = await api.get(`/workspaces/${workspaceId}/join-requests`);
        return data;
    },

    approveJoinRequest: async (workspaceId, requestId) => {
        const { data } = await api.post(`/workspaces/${workspaceId}/join-requests/${requestId}/approve`);
        return data;
    },

    denyJoinRequest: async (workspaceId, requestId) => {
        const { data } = await api.delete(`/workspaces/${workspaceId}/join-requests/${requestId}/deny`);
        return data;
    },

    updateMemberRole: async (workspaceId, memberId, role) => {
        const { data } = await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role });
        return data;
    },

    removeMember: async (workspaceId, memberId) => {
        const { data } = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
        return data;
    }
};
