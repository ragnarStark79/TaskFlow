import api from './api';

export const projectApi = {
    getByWorkspace: async (workspaceId) => {
        const { data } = await api.get(`/projects/workspace/${workspaceId}`);
        return data;
    },

    getById: async (projectId) => {
        const { data } = await api.get(`/projects/${projectId}`);
        return data;
    },

    getMyProjects: async () => {
        const { data } = await api.get('/projects/me');
        return data;
    },

    create: async (workspaceId, payload) => {
        const { data } = await api.post(`/projects/workspace/${workspaceId}`, payload);
        return data;
    },

    createStandalone: async (payload) => {
        const { data } = await api.post('/projects', payload);
        return data;
    },

    update: async (projectId, payload) => {
        const { data } = await api.put(`/projects/${projectId}`, payload);
        return data;
    },

    delete: async (projectId) => {
        const { data } = await api.delete(`/projects/${projectId}`);
        return data;
    }
};
