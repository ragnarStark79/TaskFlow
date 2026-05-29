import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
    const { on } = useSocket();
    const { user } = useAuth();
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const unsub = on('notification', ({ userId, notification }) => {
            if (userId === user?._id) {
                setNotifications(prev => [{ ...notification, id: Date.now(), read: false }, ...prev].slice(0, 50));
            }
        });
        return unsub;
    }, [on, user]);

    useEffect(() => {
        const unsubComment = on('commentAdded', ({ task }) => {
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

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

    // Dynamic colors based on theme
    const panelBg = isLight ? '#FFFFFF' : '#111827';
    const panelBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const panelShadow = isLight
        ? '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
        : '0 16px 48px rgba(0,0,0,0.55)';
    const headerBorder = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    const titleColor = isLight ? '#111827' : '#F0F4FF';
    const emptyColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)';
    const itemBg = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
    const itemBgUnread = isLight ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)';
    const msgColor = isLight ? '#374151' : '#CBD5E1';
    const timeColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.45)';
    const btnColor = isLight ? '#6B7280' : 'rgba(160,170,200,0.6)';
    const bellColor = isLight ? '#6B7280' : '#9CA3AF';

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    width: 34, height: 34,
                    borderRadius: '50%',
                    border: `1px solid ${panelBorder}`,
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: bellColor,
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'; }}
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 16, height: 16,
                        background: '#EF4444', color: '#fff',
                        fontSize: 9, fontWeight: 700,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${isLight ? '#F5F5F7' : '#060810'}`,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 12px)',
                            right: -8,
                            width: 340,
                            background: panelBg,
                            border: `1px solid ${panelBorder}`,
                            borderRadius: 18,
                            boxShadow: panelShadow,
                            overflow: 'hidden',
                            zIndex: 300,
                            transformOrigin: 'top right',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '14px 16px 12px',
                            borderBottom: `1px solid ${headerBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bell size={15} color={isLight ? '#374151' : '#CBD5E1'} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: titleColor, fontFamily: "'Syne', sans-serif" }}>
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        padding: '1px 7px', borderRadius: 999,
                                        background: 'rgba(59,130,246,0.12)',
                                        color: '#3B82F6',
                                    }}>{unreadCount}</span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 12, color: '#3B82F6', cursor: 'pointer',
                                        background: 'none', border: 'none', padding: '3px 6px',
                                        borderRadius: 8, fontFamily: 'inherit',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px' }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                                }}>
                                    <Bell size={28} strokeWidth={1.2} color={emptyColor} />
                                    <p style={{ fontSize: 13, color: emptyColor, margin: 0 }}>No notifications yet</p>
                                    <p style={{ fontSize: 11, color: timeColor, margin: 0 }}>You'll be notified about task updates</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '10px 12px',
                                            borderRadius: 12,
                                            marginBottom: 4,
                                            background: !n.read ? itemBgUnread : 'transparent',
                                            border: !n.read ? '1px solid rgba(59,130,246,0.12)' : '1px solid transparent',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => { if (n.read) e.currentTarget.style.background = itemBg; }}
                                        onMouseLeave={e => { if (n.read) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {/* Indicator dot */}
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                                            background: !n.read ? '#3B82F6' : (isLight ? '#D1D5DB' : 'rgba(255,255,255,0.15)'),
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, color: msgColor, margin: '0 0 4px', lineHeight: 1.45 }}>
                                                {n.message}
                                            </p>
                                            <p style={{ fontSize: 11, color: timeColor, margin: 0 }}>
                                                {new Date(n.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => dismiss(n.id)}
                                            style={{
                                                flexShrink: 0, width: 20, height: 20,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '50%', border: 'none',
                                                background: 'transparent', color: btnColor,
                                                cursor: 'pointer', transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <X size={11} />
                                        </button>
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
