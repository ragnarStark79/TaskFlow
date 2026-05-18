import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
    const { on } = useSocket();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Listen for real-time notifications
    useEffect(() => {
        const unsub = on('notification', ({ userId, notification }) => {
            if (userId === user?._id) {
                setNotifications(prev => [{ ...notification, id: Date.now(), read: false }, ...prev].slice(0, 50));
            }
        });
        return unsub;
    }, [on, user]);

    // Also listen for task events that are relevant to the user
    useEffect(() => {
        const unsubComment = on('commentAdded', ({ task }) => {
            // Notify if user is assigned to this task and didn't write the comment
            const latestComment = task.comments?.[task.comments.length - 1];
            if (
                latestComment &&
                latestComment.user?._id !== user?._id &&
                task.assignees?.some(a => (a._id || a) === user?._id)
            ) {
                setNotifications(prev => [{
                    id: Date.now(),
                    read: false,
                    type: 'comment',
                    message: `${latestComment.user?.name || 'Someone'} commented on "${task.title}"`,
                    timestamp: new Date(),
                }, ...prev].slice(0, 50));
            }
        });

        return () => { unsubComment(); };
    }, [on, user]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); }}
                className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 bg-[#131825] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-200">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[11px] text-blue-400 hover:text-blue-300">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-gray-600">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <p className="text-sm text-gray-300">{n.message}</p>
                                        <p className="text-[10px] text-gray-600 mt-1">
                                            {new Date(n.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
