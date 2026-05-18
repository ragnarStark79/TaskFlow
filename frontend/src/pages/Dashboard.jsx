import React, { useState, useEffect, useRef } from 'react';
import { Plus, Briefcase, Users, ChevronRight } from 'lucide-react';
import { workspaceApi } from '../services/workspaceApi';
import CreateWorkspaceModal from '../components/modals/CreateWorkspaceModal';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Workspace accent colors
───────────────────────────────────────────── */
const ACCENTS = [
    { from: '#1B6FE8', to: '#7B3FE4', glow: 'rgba(27,111,232,0.25)', text: '#38B6FF' },
    { from: '#00B37E', to: '#1B6FE8', glow: 'rgba(0,179,126,0.22)', text: '#00D296' },
    { from: '#7B3FE4', to: '#E84393', glow: 'rgba(123,63,228,0.22)', text: '#A97BFF' },
    { from: '#E84393', to: '#E8811B', glow: 'rgba(232,67,147,0.20)', text: '#FF6EB4' },
    { from: '#E8811B', to: '#E8D21B', glow: 'rgba(232,129,27,0.22)', text: '#FFB347' },
];
const accent = (i) => ACCENTS[i % ACCENTS.length];

/* ─────────────────────────────────────────────
   Styles (Main UI kept intact)
───────────────────────────────────────────── */
const S = {
    page: {
        minHeight: '100vh',
        background: '#060810',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '0 0 80px',
    },
    grid: {
        position: 'fixed', inset: 0,
        backgroundImage: `
      linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
    `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        zIndex: 0,
    },
    orb1: {
        position: 'fixed', top: '-10%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,182,255,0.12) 0%, transparent 70%)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
    },
    orb2: {
        position: 'fixed', bottom: '-15%', right: '-8%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,80,255,0.10) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
    },
    inner: {
        position: 'relative', zIndex: 1,
        maxWidth: 1120,
        margin: '0 auto',
        padding: '48px 32px 0',
    },

    /* ── Header ── */
    header: {
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
        paddingBottom: 32,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 40,
    },
    headerLeft: { flex: 1 },
    eyebrow: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 12px',
        borderRadius: 99,
        background: 'rgba(56,182,255,0.09)',
        border: '1px solid rgba(56,182,255,0.20)',
        marginBottom: 14,
        opacity: 0,
    },
    eyebrowDot: {
        width: 6, height: 6, borderRadius: '50%',
        background: '#38B6FF',
        boxShadow: '0 0 7px rgba(56,182,255,0.8)',
    },
    eyebrowText: {
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        color: '#38B6FF', textTransform: 'uppercase',
    },
    h1: {
        fontSize: 36, fontWeight: 700, lineHeight: 1.1,
        color: '#F0F4FF', margin: 0,
        fontFamily: "'Syne', sans-serif",
        opacity: 0,
    },
    subtext: {
        fontSize: 14, color: 'rgba(160,170,200,0.65)',
        marginTop: 8, opacity: 0,
    },
    newBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 22px',
        borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)',
        color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(27,111,232,0.35)',
        fontFamily: 'inherit',
        opacity: 0,
        whiteSpace: 'nowrap',
        alignSelf: 'flex-start',
        marginTop: 4,
    },

    /* ── Stats bar ── */
    statsBar: {
        display: 'flex', gap: 16,
        marginBottom: 36,
        flexWrap: 'wrap',
        opacity: 0,
    },
    statChip: {
        padding: '8px 18px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, color: 'rgba(180,190,220,0.7)',
    },
    statNum: {
        fontWeight: 700, fontSize: 15,
        color: '#F0F4FF',
    },

    /* ── Grid ── */
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
    },

    /* ── Workspace card ── */
    card: {
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 22,
        padding: '24px 24px 20px',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        transition: 'border-color 0.2s',
        height: '100%'
    },
    cardAccentBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2, borderRadius: '22px 22px 0 0',
    },
    cardTop: {
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 18,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: '#fff',
        fontFamily: "'Syne', sans-serif",
        flexShrink: 0,
    },
    memberBadge: {
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 12, fontWeight: 500,
        color: 'rgba(180,190,220,0.7)',
    },
    cardName: {
        fontSize: 18, fontWeight: 700,
        color: '#F0F4FF', margin: '0 0 4px',
        fontFamily: "'Syne', sans-serif",
    },
    cardSlug: {
        fontSize: 12, color: 'rgba(160,170,200,0.45)',
        fontFamily: 'monospace',
    },
    cardFooter: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto', paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.055)',
        fontSize: 13,
        color: 'rgba(160,170,200,0.55)',
    },
    openLink: {
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 600,
        textDecoration: 'none',
    },

    /* ── Skeleton ── */
    skeletonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
    },
    skeleton: {
        height: 180,
        borderRadius: 22,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden', position: 'relative',
    },
    skeletonShimmer: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
    },

    /* ── Empty state ── */
    empty: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
        borderRadius: 28,
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(255,255,255,0.08)',
        textAlign: 'center',
    },
    emptyIcon: {
        width: 64, height: 64, borderRadius: 20,
        background: 'rgba(56,182,255,0.08)',
        border: '1px solid rgba(56,182,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        color: '#38B6FF',
    },
    emptyTitle: {
        fontSize: 20, fontWeight: 700,
        color: '#F0F4FF', margin: '0 0 8px',
        fontFamily: "'Syne', sans-serif",
    },
    emptyText: {
        fontSize: 14, color: 'rgba(160,170,200,0.55)',
        margin: '0 0 24px',
    },
    emptyBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '11px 22px',
        borderRadius: 12, border: 'none',
        background: 'linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)',
        color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 8px 24px rgba(27,111,232,0.30)',
    },
};

/* ─────────────────────────────────────────────
   Skeleton card (Updated Logic)
───────────────────────────────────────────── */
const SkeletonCard = ({ i }) => {
    const ref = useRef(null);
    useEffect(() => {
        gsap.fromTo(ref.current,
            { backgroundPositionX: '200%' },
            { backgroundPositionX: '-200%', duration: 1.5, repeat: -1, ease: 'none', delay: i * 0.2 }
        );
    }, [i]);
    return (
        <div style={S.skeleton}>
            <div ref={ref} style={S.skeletonShimmer} />
        </div>
    );
};

/* ─────────────────────────────────────────────
   Workspace Card (Main UI Interactions)
───────────────────────────────────────────── */
const WorkspaceCard = ({ workspace, index, onClick }) => {
    const cardRef = useRef(null);
    const ac = accent(index);

    const onEnter = () => {
        gsap.to(cardRef.current, {
            y: -5,
            background: 'rgba(255,255,255,0.055)',
            borderColor: 'rgba(255,255,255,0.12)',
            boxShadow: `0 12px 40px ${ac.glow}`,
            duration: 0.25,
        });
    };
    const onLeave = () => {
        gsap.to(cardRef.current, {
            y: 0,
            background: 'rgba(255,255,255,0.035)',
            borderColor: 'rgba(255,255,255,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            duration: 0.25,
        });
    };
    const onDown = () => gsap.to(cardRef.current, { scale: 0.985, duration: 0.1 });
    const onUp = () => gsap.to(cardRef.current, { scale: 1, duration: 0.15 });

    return (
        <div
            ref={cardRef}
            style={S.card}
            onClick={onClick}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onMouseDown={onDown}
            onMouseUp={onUp}
        >
            {/* Top accent line */}
            <div style={{
                ...S.cardAccentBar,
                background: `linear-gradient(90deg, ${ac.from}, ${ac.to})`,
            }} />

            <div style={S.cardTop}>
                <div style={{
                    ...S.avatar,
                    background: `linear-gradient(135deg, ${ac.from}33, ${ac.to}33)`,
                    border: `1px solid ${ac.from}44`,
                    color: ac.text,
                }}>
                    {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div style={S.memberBadge}>
                    <Users size={12} />
                    <span>{workspace.members?.length ?? 0}</span>
                </div>
            </div>

            <h3 style={S.cardName}>{workspace.name}</h3>
            <p style={S.cardSlug}>/{workspace.slug}</p>
            <p style={S.cardSlug}>ID: {workspace._id}</p>

            <div style={S.cardFooter}>
                <span>Owner: {workspace.owner?.name ?? 'You'}</span>
                <span style={{ ...S.openLink, color: ac.text }}>
                    Open <ChevronRight size={14} />
                </span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────── */
const Dashboard = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    /* refs */
    const pageRef = useRef(null);
    const orb1Ref = useRef(null);
    const orb2Ref = useRef(null);
    const eyebrowRef = useRef(null);
    const h1Ref = useRef(null);
    const subRef = useRef(null);
    const btnRef = useRef(null);
    const statsRef = useRef(null);
    const contentRef = useRef(null); // Combined Ref for updating logic

    /* ── Fetch (Updated Logic) ── */
    useEffect(() => {
        (async () => {
            try {
                const res = await workspaceApi.getAll();
                setWorkspaces(res?.data ?? []);
            } catch (err) {
                console.error('Failed to fetch workspaces:', err);
                setWorkspaces([]);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleCreated = (newWorkspace) => {
        setWorkspaces(prev => [...prev, newWorkspace]);

        /* animate new card in (Updated DOM Query Logic) */
        setTimeout(() => {
            if (!contentRef.current) return;
            const cards = contentRef.current.querySelectorAll('[data-card]');
            const last = cards[cards.length - 1];

            if (last) {
                gsap.fromTo(last,
                    { opacity: 0, scale: 0.9, y: 20 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }
                );
            }
        }, 50);
    };

    /* ── Load Google Fonts (Updated Logic to prevent duplicates) + ambient orbs ── */
    useEffect(() => {
        if (!document.querySelector('[data-tf-fonts]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap';
            link.dataset.tfFonts = '1';
            document.head.appendChild(link);
        }

        const ctx = gsap.context(() => {
            gsap.to(orb1Ref.current, {
                x: 30, y: 20, duration: 9,
                repeat: -1, yoyo: true, ease: 'sine.inOut',
            });
            gsap.to(orb2Ref.current, {
                x: -25, y: -30, duration: 11,
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2,
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    /* ── Header entry animation (Main UI staggered stagger) ── */
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl
            .fromTo(eyebrowRef.current,
                { opacity: 0, y: -10, scale: 0.85 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4 })
            .fromTo(h1Ref.current,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.42 }, '-=0.15')
            .fromTo(subRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.35 }, '-=0.15')
            .fromTo(btnRef.current,
                { opacity: 0, scale: 0.88 },
                { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.2');
    }, []);

    /* ── Cards / empty animate in after load (Updated query selector Logic) ── */
    useEffect(() => {
        if (isLoading) return;

        if (statsRef.current) {
            gsap.fromTo(statsRef.current,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 0.4, delay: 0.1 });
        }

        if (!contentRef.current) return;

        if (workspaces.length === 0) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 });
            return;
        }

        /* stagger cards based on data-attributes safely */
        const cards = contentRef.current.querySelectorAll('[data-card]');
        if (cards.length) {
            gsap.fromTo(cards,
                { opacity: 0, y: 28 },
                { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out', delay: 0.15 }
            );
        }
    }, [isLoading, workspaces]);

    /* ── Button hover ── */
    const onBtnEnter = () => gsap.to(btnRef.current, {
        scale: 1.04, boxShadow: '0 12px 36px rgba(27,111,232,0.50)', duration: 0.2,
    });
    const onBtnLeave = () => gsap.to(btnRef.current, {
        scale: 1, boxShadow: '0 8px 28px rgba(27,111,232,0.35)', duration: 0.2,
    });

    const totalMembers = workspaces.reduce((s, w) => s + (w.members?.length ?? 0), 0);

    return (
        <div ref={pageRef} style={S.page}>
            {/* Ambient */}
            <div ref={orb1Ref} style={S.orb1} />
            <div ref={orb2Ref} style={S.orb2} />
            <div style={S.grid} />

            <div style={S.inner}>

                {/* ── Header ── */}
                <header style={S.header}>
                    <div style={S.headerLeft}>
                        <div ref={eyebrowRef} style={S.eyebrow}>
                            <div style={S.eyebrowDot} />
                            <span style={S.eyebrowText}>TaskFlow</span>
                        </div>
                        <h1 ref={h1Ref} style={S.h1}>Your Workspaces</h1>
                        <p ref={subRef} style={S.subtext}>Manage your teams and centralize your projects.</p>
                    </div>

                    <button
                        ref={btnRef}
                        style={S.newBtn}
                        onClick={() => setIsModalOpen(true)}
                        onMouseEnter={onBtnEnter}
                        onMouseLeave={onBtnLeave}
                    >
                        <Plus size={16} />
                        New Workspace
                    </button>
                </header>

                {/* ── Stats bar ── */}
                {!isLoading && workspaces.length > 0 && (
                    <div ref={statsRef} style={S.statsBar}>
                        <div style={S.statChip}>
                            <span style={S.statNum}>{workspaces.length}</span>
                            Workspace{workspaces.length !== 1 ? 's' : ''}
                        </div>
                        <div style={S.statChip}>
                            <Users size={14} />
                            <span style={S.statNum}>{totalMembers}</span>
                            Total Member{totalMembers !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                {/* ── States ── */}
                {isLoading ? (
                    <div style={S.skeletonGrid}>
                        {[0, 1, 2].map(i => <SkeletonCard key={i} i={i} />)}
                    </div>

                ) : workspaces.length === 0 ? (
                    <div ref={contentRef} style={{ ...S.empty, opacity: 0 }}>
                        <div style={S.emptyIcon}><Briefcase size={28} /></div>
                        <h2 style={S.emptyTitle}>No workspaces yet</h2>
                        <p style={S.emptyText}>Create your first workspace to start collaborating.</p>
                        <button
                            style={S.emptyBtn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={15} /> Create Workspace
                        </button>
                    </div>

                ) : (
                    <div ref={contentRef} style={S.cardsGrid}>
                        {workspaces.map((workspace, index) => (
                            <div key={workspace._id} data-card style={{ opacity: 0 }}>
                                <WorkspaceCard
                                    workspace={workspace}
                                    index={index}
                                    onClick={() => navigate(`/workspace/${workspace._id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Analytics (Feature 3.6) ── */}
                {!isLoading && <AnalyticsDashboard />}
            </div>

            {/* Modal */}
            <CreateWorkspaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={handleCreated}
            />
        </div>
    );
};

export default Dashboard;