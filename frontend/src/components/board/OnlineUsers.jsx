import React from 'react';
import { useSocket } from '../../context/SocketContext';

const OnlineUsers = () => {
    const { onlineUsers, isConnected } = useSocket();

    // Deduplicate by userId (one user might have multiple tabs)
    const uniqueUsers = [];
    const seen = new Set();
    for (const u of onlineUsers) {
        if (!seen.has(u.userId)) {
            seen.add(u.userId);
            uniqueUsers.push(u);
        }
    }

    if (uniqueUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />

            {/* Avatar stack */}
            <div className="flex -space-x-2">
                {uniqueUsers.slice(0, 5).map((u) => (
                    <div
                        key={u.userId}
                        title={u.name}
                        className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 border-2 border-[#0A0D14] flex items-center justify-center text-[10px] font-bold text-white"
                    >
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                ))}
                {uniqueUsers.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#0A0D14] flex items-center justify-center text-[10px] text-gray-400">
                        +{uniqueUsers.length - 5}
                    </div>
                )}
            </div>

            <span className="text-xs text-gray-500 ml-1">
                {uniqueUsers.length} online
            </span>
        </div>
    );
};

export default OnlineUsers;
