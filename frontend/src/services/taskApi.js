import api from './api';

export const taskApi = {
    getByProject: async (projectId) => {
        const { data } = await api.get(`/tasks/project/${projectId}`);
        return data;
    },

    getMyTasks: async () => {
        const { data } = await api.get(`/tasks/me`);
        return data;
    },

    getById: async (taskId) => {
        const { data } = await api.get(`/tasks/${taskId}`);
        return data;
    },

    create: async (projectId, payload) => {
        const { data } = await api.post(`/tasks/project/${projectId}`, payload);
        return data;
    },

    update: async (taskId, payload) => {
        const { data } = await api.put(`/tasks/${taskId}`, payload);
        return data;
    },

    move: async (taskId, status, position) => {
        const { data } = await api.patch(`/tasks/${taskId}/move`, { status, position });
        return data;
    },

    delete: async (taskId) => {
        const { data } = await api.delete(`/tasks/${taskId}`);
        return data;
    },

    // --- Comments ---
    addComment: async (taskId, text) => {
        const { data } = await api.post(`/tasks/${taskId}/comments`, { text });
        return data;
    },

    deleteComment: async (taskId, commentId) => {
        const { data } = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
        return data;
    },

    // --- Subtasks ---
    addSubtask: async (taskId, title) => {
        const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
        return data;
    },

    toggleSubtask: async (taskId, subtaskId) => {
        const { data } = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
        return data;
    },

    // --- Attachments (multipart upload) ---
    uploadAttachment: async (taskId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    // --- Activity Log ---
    getActivityLog: async (taskId) => {
        const { data } = await api.get(`/tasks/${taskId}/activity`);
        return data;
    },
};
