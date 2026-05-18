import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Connect on mount when user is authenticated
    useEffect(() => {
        if (!user) return;

        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        // Presence updates
        socket.on('presenceUpdate', ({ users }) => {
            setOnlineUsers(users);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [user]);

    // Join a project room
    const joinProject = useCallback((projectId) => {
        if (socketRef.current && user) {
            socketRef.current.emit('joinProject', {
                projectId,
                user: { _id: user._id, name: user.name, avatar: user.avatar },
            });
        }
    }, [user]);

    // Leave a project room
    const leaveProject = useCallback((projectId) => {
        if (socketRef.current) {
            socketRef.current.emit('leaveProject', { projectId });
            setOnlineUsers([]);
        }
    }, []);

    // Subscribe to a specific event — returns unsubscribe function
    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
            return () => socketRef.current?.off(event, callback);
        }
        return () => {};
    }, []);

    return (
        <SocketContext.Provider value={{ isConnected, onlineUsers, joinProject, leaveProject, on }}>
            {children}
        </SocketContext.Provider>
    );
};
