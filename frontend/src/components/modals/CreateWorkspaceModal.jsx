import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Briefcase } from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
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
        background: 'radial-gradient(circle, rgba(27,111,232,0.25) 0%, transparent 70%)',
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
        background: 'rgba(27,111,232,0.15)',
        border: '1px solid rgba(27,111,232,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#38B6FF',
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
    tabRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '999px',
        padding: '6px',
    },
    tabBtn: {
        flex: 1,
        padding: '8px 12px',
        borderRadius: '999px',
        border: 'none',
        background: 'transparent',
        color: 'rgba(160,170,200,0.7)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: "'DM Sans', sans-serif",
    },
    tabActive: {
        background: 'rgba(27,111,232,0.18)',
        color: '#F0F4FF',
        boxShadow: '0 8px 24px rgba(27,111,232,0.18)',
    },
    formGroup: { marginBottom: '28px' },
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
    hint: {
        fontSize: '12px', color: 'rgba(160,170,200,0.55)',
        marginTop: '8px', fontFamily: "'DM Sans', sans-serif",
    },
    actions: {
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
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
        background: 'linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)',
        border: 'none',
        color: '#fff', fontSize: '14px', fontWeight: 600,
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 8px 24px rgba(27,111,232,0.3)',
        transition: 'all 0.2s ease',
    }
};

const CreateWorkspaceModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [mode, setMode] = useState('create');
    const [joinId, setJoinId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for GSAP
    const overlayRef = useRef(null);
    const modalRef = useRef(null);
    const inputRef = useRef(null);
    const submitBtnRef = useRef(null);

    // Entry / Exit Animations
    useEffect(() => {
        if (isOpen) {
            // Animate in
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(modalRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
            );

            // Focus input slightly after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleClose = () => {
        // Animate out
        gsap.to(modalRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: 'power2.in' });
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onClose });
        setMode('create');
        setJoinId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'create' && !name.trim()) return;
        if (mode === 'join' && !joinId.trim()) return;

        setIsSubmitting(true);
        // Button press animation
        gsap.to(submitBtnRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        try {
            if (mode === 'create') {
                const data = await workspaceApi.create(name);
                toast.success('Workspace created successfully!');
                onCreated(data.data);
                setName('');
                handleClose();
                return;
            }

            await workspaceApi.requestJoin(joinId.trim());
            toast.success('Join request sent to workspace owner');
            setJoinId('');
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
            // Shake modal on error
            gsap.fromTo(modalRef.current,
                { x: -5 },
                { x: 5, duration: 0.05, yoyo: true, repeat: 5, clearProps: 'x' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hover effects
    const onInputFocus = (e) => {
        gsap.to(e.target, { borderColor: 'rgba(56,182,255,0.5)', boxShadow: '0 0 0 2px rgba(56,182,255,0.1)', duration: 0.2 });
    };
    const onInputBlur = (e) => {
        gsap.to(e.target, { borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', duration: 0.2 });
    };

    const onCancelEnter = (e) => gsap.to(e.target, { background: 'rgba(255,255,255,0.06)', duration: 0.2 });
    const onCancelLeave = (e) => gsap.to(e.target, { background: 'transparent', duration: 0.2 });

    const onSubmitEnter = (e) => {
        const canSubmit = mode === 'create' ? name.trim() : joinId.trim();
        if (!isSubmitting && canSubmit) {
            gsap.to(e.target, { scale: 1.02, boxShadow: '0 12px 28px rgba(27,111,232,0.4)', duration: 0.2 });
        }
    };
    const onSubmitLeave = (e) => {
        if (!isSubmitting) {
            gsap.to(e.target, { scale: 1, boxShadow: '0 8px 24px rgba(27,111,232,0.3)', duration: 0.2 });
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div ref={overlayRef} style={S.overlay} onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}>
            <div ref={modalRef} style={S.modal}>
                {/* Ambient Glow */}
                <div style={S.accentGlow} />

                <div style={S.content}>
                    <div style={S.header}>
                        <div style={S.titleWrapper}>
                            <div style={S.iconBox}><Briefcase size={18} /></div>
                            <h2 style={S.title}>New Workspace</h2>
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

                    <div style={S.tabRow}>
                        <button
                            type="button"
                            style={{ ...S.tabBtn, ...(mode === 'create' ? S.tabActive : {}) }}
                            onClick={() => setMode('create')}
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            style={{ ...S.tabBtn, ...(mode === 'join' ? S.tabActive : {}) }}
                            onClick={() => setMode('join')}
                        >
                            Join by ID
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {mode === 'create' ? (
                            <div style={S.formGroup}>
                                <label style={S.label}>Workspace Name</label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Design Team, Q3 Sprint..."
                                    style={S.input}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                                <p style={S.hint}>This is the top-level container for your projects and tasks.</p>
                            </div>
                        ) : (
                            <div style={S.formGroup}>
                                <label style={S.label}>Workspace ID</label>
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    placeholder="Paste workspace ID"
                                    style={S.input}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                                <p style={S.hint}>Send a join request using the workspace ID shared by the owner.</p>
                            </div>
                        )}

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
                                disabled={(mode === 'create' ? !name.trim() : !joinId.trim()) || isSubmitting}
                                style={{
                                    ...S.submitBtn,
                                    opacity: ((mode === 'create' ? !name.trim() : !joinId.trim()) || isSubmitting) ? 0.6 : 1,
                                    cursor: ((mode === 'create' ? !name.trim() : !joinId.trim()) || isSubmitting) ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={onSubmitEnter}
                                onMouseLeave={onSubmitLeave}
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (mode === 'create' ? 'Create Workspace' : 'Send Request')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateWorkspaceModal;
