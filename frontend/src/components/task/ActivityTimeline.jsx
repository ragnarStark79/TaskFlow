import React from 'react';
import { motion } from 'framer-motion';
import {
    GitCommitHorizontal, MessageSquare, Paperclip, ArrowRightLeft,
    Plus, CheckCircle2, Pencil, Trash2
} from 'lucide-react';

const ACTION_CONFIG = {
    created:          { icon: Plus,               color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'created this task' },
    updated:          { icon: Pencil,             color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'updated' },
    moved:            { icon: ArrowRightLeft,     color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  label: 'moved' },
    commented:        { icon: MessageSquare,      color: 'text-purple-400',  bg: 'bg-purple-500/10',  label: 'commented' },
    attached:         { icon: Paperclip,          color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    label: 'attached a file' },
    subtask_added:    { icon: CheckCircle2,       color: 'text-green-400',   bg: 'bg-green-500/10',   label: 'added a subtask' },
    subtask_toggled:  { icon: CheckCircle2,       color: 'text-green-400',   bg: 'bg-green-500/10',   label: 'toggled a subtask' },
    deleted:          { icon: Trash2,             color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'deleted' },
};

const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

const ActivityTimeline = ({ activities = [] }) => {
    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600 text-sm">
                No activity yet.
            </div>
        );
    }

    return (
        <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5" />

            {activities.map((entry, index) => {
                const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.updated;
                const Icon = config.icon;

                return (
                    <motion.div
                        key={entry._id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-start gap-3 py-2.5 pl-0 relative"
                    >
                        {/* Icon dot */}
                        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center z-10 shrink-0`}>
                            <Icon size={14} className={config.color} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300">
                                <span className="font-medium text-gray-200">
                                    {entry.user?.name || 'System'}
                                </span>
                                {' '}
                                <span className="text-gray-500">{config.label}</span>
                                {entry.field && entry.action === 'updated' && (
                                    <>
                                        {' '}
                                        <span className="text-gray-400 font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
                                            {entry.field}
                                        </span>
                                    </>
                                )}
                                {entry.field === 'status' && entry.oldValue && entry.newValue && (
                                    <span className="text-gray-500">
                                        {' '}from <span className="text-gray-400">{formatValue(entry.oldValue)}</span>
                                        {' '}to <span className="text-gray-400">{formatValue(entry.newValue)}</span>
                                    </span>
                                )}
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                                {new Date(entry.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ActivityTimeline;
