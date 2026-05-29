import api from './api';

export const settingsApi = {
    updateProfile: (data) => api.put('/settings/profile', data),
    changePassword: (data) => api.put('/settings/password', data),
    updateTheme: (theme) => api.put('/settings/theme', { theme }),
};
