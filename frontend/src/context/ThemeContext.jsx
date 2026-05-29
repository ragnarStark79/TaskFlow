import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    
    // Initialize from: user preference > localStorage > default 'dark'
    const [theme, setThemeState] = useState(() => {
        const stored = localStorage.getItem('taskflow-theme');
        return stored || 'dark';
    });

    // Sync theme from user object when it loads
    useEffect(() => {
        if (user?.theme) {
            setThemeState(user.theme);
            localStorage.setItem('taskflow-theme', user.theme);
        }
    }, [user?.theme]);

    // Apply theme to <html> element
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskflow-theme', theme);
    }, [theme]);

    const setTheme = useCallback(async (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('taskflow-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        // Persist to backend if logged in
        try {
            await api.put('/settings/theme', { theme: newTheme });
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
