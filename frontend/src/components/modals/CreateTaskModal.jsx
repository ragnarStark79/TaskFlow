import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ListTodo } from 'lucide-react';
import { taskApi } from '../../services/taskApi';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
    { value: 'low',    label: 'Low',    color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high',   label: 'High',   color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

const CreateTaskModal = ({ isOpen, onClose, projectId, defaultStatus, onCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            const data = await taskApi.create(projectId, {
                title,
                description,
                priority,
                status: defaultStatus,
            });
            toast.success('Task created!');
            onCreated(data.data);
            setTitle('');
            setDescription('');
            setPriority('medium');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#131825] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                                <ListTodo size={20} className="text-blue-400" />
                                New Task
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                    placeholder="e.g. Design landing page..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Optional details..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                                />
                            </div>

                            {/* Priority Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Priority</label>
                                <div className="flex gap-2">
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPriority(opt.value)}
                                            className={`flex-1 text-xs py-2.5 rounded-xl border font-semibold transition-all ${
                                                priority === opt.value
                                                    ? `${opt.color} border-current bg-white/5`
                                                    : 'text-gray-500 border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!title.trim() || isSubmitting}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateTaskModal;
