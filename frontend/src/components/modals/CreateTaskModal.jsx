import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { taskApi } from '../../services/taskApi';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
    { value: 'low',    label: 'Low',    color: '#22C55E', bg: 'rgba(34,197,94,0.10)',    border: 'rgba(34,197,94,0.30)' },
    { value: 'medium', label: 'Medium', color: '#EAB308', bg: 'rgba(234,179,8,0.10)',    border: 'rgba(234,179,8,0.30)' },
    { value: 'high',   label: 'High',   color: '#F97316', bg: 'rgba(249,115,22,0.10)',   border: 'rgba(249,115,22,0.30)' },
    { value: 'urgent', label: 'Urgent', color: '#EF4444', bg: 'rgba(239,68,68,0.10)',    border: 'rgba(239,68,68,0.30)' },
];

const CreateTaskModal = ({ isOpen, onClose, projectId, defaultStatus, onCreated }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form on open
    useEffect(() => {
        if (isOpen) { setTitle(''); setDescription(''); setPriority('medium'); }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            const data = await taskApi.create(projectId, { title, description, priority, status: defaultStatus });
            toast.success('Task created!');
            onCreated(data.data);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Theme tokens
    const overlay   = isLight ? 'rgba(15,23,42,0.35)' : 'rgba(0,0,0,0.65)';
    const panelBg   = isLight ? '#FFFFFF' : '#111827';
    const panelBdr  = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const panelShad = isLight
        ? '0 24px 64px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)'
        : '0 32px 80px rgba(0,0,0,0.60)';
    const headBdr   = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
    const titleClr  = isLight ? '#111827' : '#F1F5F9';
    const labelClr  = isLight ? '#374151' : '#94A3B8';
    const inputBg   = isLight ? '#F9FAFB' : 'rgba(255,255,255,0.04)';
    const inputBdr  = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)';
    const inputClr  = isLight ? '#111827' : '#E2E8F0';
    const phClr     = isLight ? '#9CA3AF' : '#4B5563';
    const cancelBg  = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const cancelClr = isLight ? '#374151' : '#94A3B8';
    const footerBg  = isLight ? '#F9FAFB' : 'rgba(255,255,255,0.02)';

    const selectedOpt = PRIORITY_OPTIONS.find(p => p.value === priority);

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px',
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute', inset: 0,
                            background: overlay,
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ scale: 0.94, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.94, opacity: 0, y: 16 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            position: 'relative', width: '100%', maxWidth: 480,
                            background: panelBg,
                            border: `1px solid ${panelBdr}`,
                            borderRadius: 24,
                            boxShadow: panelShad,
                            overflow: 'hidden',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px 18px',
                            borderBottom: `1px solid ${headBdr}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #1B6FE8, #7B3FE4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(27,111,232,0.30)',
                                }}>
                                    <Sparkles size={16} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 17, fontWeight: 700, color: titleClr, margin: 0, fontFamily: "'Syne', sans-serif" }}>
                                        New Task
                                    </h2>
                                    <p style={{ fontSize: 12, color: labelClr, margin: 0, marginTop: 1 }}>
                                        {defaultStatus ? `Adding to ${defaultStatus.replace('_', ' ')}` : 'Create a new task'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                style={{
                                    width: 32, height: 32, borderRadius: 9,
                                    border: `1px solid ${panelBdr}`,
                                    background: 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: labelClr,
                                    transition: 'background 0.15s',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form body */}
                        <form onSubmit={handleSubmit}>
                            <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Title */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: labelClr, letterSpacing: '0.01em' }}>
                                        Task Title <span style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        autoFocus
                                        placeholder="e.g. Design landing page…"
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: inputBg,
                                            border: `1.5px solid ${inputBdr}`,
                                            borderRadius: 12,
                                            padding: '12px 14px',
                                            fontSize: 14, fontWeight: 500,
                                            color: inputClr,
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = '#1B6FE8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(27,111,232,0.12)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = inputBdr;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Description */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: labelClr, letterSpacing: '0.01em' }}>
                                        Description <span style={{ fontSize: 11, fontWeight: 400, color: phClr }}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Add more context, steps, or details…"
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: inputBg,
                                            border: `1.5px solid ${inputBdr}`,
                                            borderRadius: 12,
                                            padding: '12px 14px',
                                            fontSize: 14, fontWeight: 500,
                                            color: inputClr,
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            resize: 'none',
                                            lineHeight: 1.55,
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = '#1B6FE8';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(27,111,232,0.12)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = inputBdr;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Priority */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: labelClr, letterSpacing: '0.01em' }}>
                                        Priority
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                        {PRIORITY_OPTIONS.map(opt => {
                                            const isSelected = priority === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setPriority(opt.value)}
                                                    style={{
                                                        padding: '10px 8px',
                                                        borderRadius: 12,
                                                        border: `1.5px solid ${isSelected ? opt.border : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)')}`,
                                                        background: isSelected ? opt.bg : (isLight ? '#F9FAFB' : 'rgba(255,255,255,0.03)'),
                                                        color: isSelected ? opt.color : labelClr,
                                                        fontSize: 13,
                                                        fontWeight: isSelected ? 700 : 500,
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.15s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 5,
                                                        boxShadow: isSelected ? `0 0 0 1px ${opt.border}` : 'none',
                                                    }}
                                                >
                                                    <span style={{
                                                        width: 8, height: 8, borderRadius: '50%',
                                                        background: opt.color,
                                                        display: 'block',
                                                        boxShadow: isSelected ? `0 0 8px ${opt.color}` : 'none',
                                                    }} />
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 24px 20px',
                                borderTop: `1px solid ${headBdr}`,
                                background: footerBg,
                            }}>
                                {/* Selected priority preview */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    fontSize: 12, color: selectedOpt?.color,
                                    background: selectedOpt?.bg,
                                    border: `1px solid ${selectedOpt?.border}`,
                                    padding: '5px 10px', borderRadius: 8,
                                    fontWeight: 600,
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: selectedOpt?.color, display: 'block' }} />
                                    {selectedOpt?.label} priority
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: 12,
                                            border: `1px solid ${panelBdr}`,
                                            background: cancelBg,
                                            color: cancelClr,
                                            fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = cancelBg}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!title.trim() || isSubmitting}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: 12,
                                            border: 'none',
                                            background: !title.trim() || isSubmitting
                                                ? (isLight ? '#D1D5DB' : 'rgba(255,255,255,0.1)')
                                                : 'linear-gradient(135deg, #1B6FE8, #7B3FE4)',
                                            color: !title.trim() || isSubmitting
                                                ? (isLight ? '#9CA3AF' : '#4B5563')
                                                : '#fff',
                                            fontSize: 13, fontWeight: 700,
                                            cursor: !title.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit',
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            boxShadow: title.trim() && !isSubmitting ? '0 4px 14px rgba(27,111,232,0.30)' : 'none',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {isSubmitting ? <Loader2 size={15} style={{ animation: 'ctmSpin 1s linear infinite' }} /> : null}
                                        {isSubmitting ? 'Creating…' : 'Create Task'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                    <style>{`@keyframes ctmSpin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateTaskModal;
