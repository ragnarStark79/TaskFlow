import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, FolderPlus } from 'lucide-react';
import { projectApi } from '../../services/projectApi';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(6, 8, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    },
    modal: {
        position: 'relative',
        width: '100%', maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.035)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden',
    },
    accentGlow: {
        position: 'absolute', top: '-20%', left: '-20%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
    },
    content: { position: 'relative', zIndex: 1 },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
    },
    titleWrapper: {
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    iconBox: {
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(14,165,233,0.15)',
        border: '1px solid rgba(14,165,233,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#0EA5E9',
    },
    title: {
        fontSize: '20px', fontWeight: 700,
        color: '#F0F4FF', margin: 0,
        fontFamily: "'Syne', sans-serif",
    },
    closeBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(160,170,200,0.7)',
        cursor: 'pointer', transition: 'all 0.2s ease',
    },
    formGroup: { marginBottom: '20px' },
    label: {
        display: 'block', fontSize: '13px', fontWeight: 600,
        color: 'rgba(180,190,220,0.85)', marginBottom: '8px',
        fontFamily: "'DM Sans', sans-serif",
    },
    input: {
        width: '100%',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '14px 16px',
        color: '#F0F4FF', fontSize: '15px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none', transition: 'all 0.3s ease',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
    },
    textarea: {
        width: '100%',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '14px 16px',
        color: '#F0F4FF', fontSize: '15px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none', transition: 'all 0.3s ease',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
        minHeight: '80px',
        resize: 'none',
    },
    hint: {
        fontSize: '12px',
        color: 'rgba(160,170,200,0.55)',
        marginTop: '8px',
        fontFamily: "'DM Sans', sans-serif",
    },
    actions: {
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
        marginTop: '28px',
    },
    cancelBtn: {
        padding: '12px 20px', borderRadius: '12px',
        background: 'transparent', border: '1px solid transparent',
        color: 'rgba(180,190,220,0.8)', fontSize: '14px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
    },
    submitBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #1B6FE8 100%)',
        border: 'none',
        color: '#fff', fontSize: '14px', fontWeight: 600,
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
        transition: 'all 0.2s ease',
    }
};

const CreateProjectModal = ({ isOpen, onClose, onCreated, workspaceId, workspaces = [], allowWorkspaceSelect = false }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for GSAP
    const overlayRef = React.useRef(null);
    const modalRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const submitBtnRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen) {
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(modalRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
            );
            setTimeout(() => inputRef.current?.focus(), 100);
            setSelectedWorkspaceId(workspaceId || '');
        }
    }, [isOpen, workspaceId]);

    const handleClose = () => {
        gsap.to(modalRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: 'power2.in' });
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onClose });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        gsap.to(submitBtnRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        try {
            const payload = { name, description };
            if (allowWorkspaceSelect) {
                payload.workspaceId = selectedWorkspaceId || null;
            }

            const data = allowWorkspaceSelect
                ? await projectApi.createStandalone(payload)
                : await projectApi.create(workspaceId, payload);

            toast.success('Project created successfully!');
            onCreated(data.data);
            setName('');
            setDescription('');
            setSelectedWorkspaceId(workspaceId || '');
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
            gsap.fromTo(modalRef.current,
                { x: -5 },
                { x: 5, duration: 0.05, yoyo: true, repeat: 5, clearProps: 'x' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInputFocus = (e) => {
        gsap.to(e.target, { borderColor: 'rgba(56,182,255,0.5)', boxShadow: '0 0 0 2px rgba(56,182,255,0.1)', duration: 0.2 });
    };
    const onInputBlur = (e) => {
        gsap.to(e.target, { borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', duration: 0.2 });
    };

    const onCancelEnter = (e) => gsap.to(e.target, { background: 'rgba(255,255,255,0.06)', duration: 0.2 });
    const onCancelLeave = (e) => gsap.to(e.target, { background: 'transparent', duration: 0.2 });

    const onSubmitEnter = (e) => {
        if (!isSubmitting && name.trim()) {
            gsap.to(e.target, { scale: 1.02, boxShadow: '0 12px 28px rgba(14,165,233,0.4)', duration: 0.2 });
        }
    };
    const onSubmitLeave = (e) => {
        if (!isSubmitting) {
            gsap.to(e.target, { scale: 1, boxShadow: '0 8px 24px rgba(14,165,233,0.3)', duration: 0.2 });
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div ref={overlayRef} style={S.overlay} onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}>
            <div ref={modalRef} style={S.modal}>
                <div style={S.accentGlow} />

                <div style={S.content}>
                    <div style={S.header}>
                        <div style={S.titleWrapper}>
                            <div style={S.iconBox}><FolderPlus size={18} /></div>
                            <h2 style={S.title}>New Project</h2>
                        </div>
                        <button
                            style={S.closeBtn}
                            onClick={handleClose}
                            onMouseEnter={(e) => gsap.to(e.target, { background: 'rgba(255,255,255,0.1)', color: '#fff', duration: 0.2 })}
                            onMouseLeave={(e) => gsap.to(e.target, { background: 'rgba(255,255,255,0.04)', color: 'rgba(160,170,200,0.7)', duration: 0.2 })}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={S.formGroup}>
                            <label style={S.label}>Project Name</label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Website Redesign"
                                style={S.input}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                        </div>

                        {allowWorkspaceSelect && (
                            <div style={S.formGroup}>
                                <label style={S.label}>Attach to Workspace (Optional)</label>
                                <select
                                    value={selectedWorkspaceId}
                                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                                    style={S.input}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                >
                                    <option value="">No workspace (standalone)</option>
                                    {workspaces.map((ws) => (
                                        <option key={ws._id} value={ws._id}>
                                            {ws.name}
                                        </option>
                                    ))}
                                </select>
                                <p style={S.hint}>You can attach or detach this project later.</p>
                            </div>
                        )}

                        <div style={S.formGroup}>
                            <label style={S.label}>Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief summary of the project goals..."
                                style={S.textarea}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                        </div>

                        <div style={S.actions}>
                            <button
                                type="button"
                                onClick={handleClose}
                                style={S.cancelBtn}
                                onMouseEnter={onCancelEnter}
                                onMouseLeave={onCancelLeave}
                            >
                                Cancel
                            </button>
                            <button
                                ref={submitBtnRef}
                                type="submit"
                                disabled={!name.trim() || isSubmitting}
                                style={{
                                    ...S.submitBtn,
                                    opacity: (!name.trim() || isSubmitting) ? 0.6 : 1,
                                    cursor: (!name.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={onSubmitEnter}
                                onMouseLeave={onSubmitLeave}
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateProjectModal;
