const { Server } = require('socket.io');

let io;

// Track online users per project room: { projectId: Set<{ socketId, userId, name, avatar }> }
const onlineUsers = new Map();

/**
 * Initialize Socket.io and attach to the HTTP server.
 * Called once from server.js during startup.
 */
const initSocket = (server, corsOrigin) => {
    io = new Server(server, {
        cors: {
            origin: corsOrigin || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // --- Room Management ---
        socket.on('joinProject', ({ projectId, user }) => {
            socket.join(projectId);
            
            // Track online presence
            if (!onlineUsers.has(projectId)) {
                onlineUsers.set(projectId, new Map());
            }
            onlineUsers.get(projectId).set(socket.id, {
                userId: user?._id || user?.id,
                name: user?.name || 'Anonymous',
                avatar: user?.avatar || null,
                socketId: socket.id,
            });

            // Broadcast updated presence to the room
            io.to(projectId).emit('presenceUpdate', {
                users: Array.from(onlineUsers.get(projectId).values()),
            });

            console.log(`[Socket] ${user?.name || socket.id} joined project ${projectId}`);
        });

        socket.on('leaveProject', ({ projectId }) => {
            socket.leave(projectId);
            removeFromPresence(socket.id, projectId);
        });

        // --- Disconnect cleanup ---
        socket.on('disconnect', () => {
            // Remove from all project rooms
            for (const [projectId, users] of onlineUsers.entries()) {
                if (users.has(socket.id)) {
                    removeFromPresence(socket.id, projectId);
                }
            }
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Remove a socket from a project's presence map and broadcast update.
 */
const removeFromPresence = (socketId, projectId) => {
    const users = onlineUsers.get(projectId);
    if (users) {
        users.delete(socketId);
        if (users.size === 0) {
            onlineUsers.delete(projectId);
        } else {
            io.to(projectId).emit('presenceUpdate', {
                users: Array.from(users.values()),
            });
        }
    }
};

/**
 * Get the Socket.io instance. Must be called after initSocket().
 */
const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized. Call initSocket() first.');
    return io;
};

// --- Emit helpers (called from controllers after mutations) ---

const emitTaskCreated = (projectId, task) => {
    if (io) io.to(projectId).emit('taskCreated', { task });
};

const emitTaskUpdated = (projectId, task) => {
    if (io) io.to(projectId).emit('taskUpdated', { task });
};

const emitTaskMoved = (projectId, task) => {
    if (io) io.to(projectId).emit('taskMoved', { task });
};

const emitTaskDeleted = (projectId, taskId) => {
    if (io) io.to(projectId).emit('taskDeleted', { taskId });
};

const emitCommentAdded = (projectId, task) => {
    if (io) io.to(projectId).emit('commentAdded', { task });
};

const emitNotification = (userId, notification) => {
    if (io) io.emit('notification', { userId, notification });
};

module.exports = {
    initSocket,
    getIO,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskMoved,
    emitTaskDeleted,
    emitCommentAdded,
    emitNotification,
};
