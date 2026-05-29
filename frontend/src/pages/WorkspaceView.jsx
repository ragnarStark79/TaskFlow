import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Folder, ArrowLeft, MoreVertical, Layout } from 'lucide-react';
import { workspaceApi } from '../services/workspaceApi';
import { projectApi } from '../services/projectApi';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Project accent colors
───────────────────────────────────────────── */
const ACCENTS = [
    { from: '#0EA5E9', to: '#1B6FE8', glow: 'rgba(14,165,233,0.25)', text: '#38B6FF' },
    { from: '#8B5CF6', to: '#6366F1', glow: 'rgba(139,92,246,0.22)', text: '#A78BFA' },
    { from: '#10B981', to: '#059669', glow: 'rgba(16,185,129,0.22)', text: '#34D399' },
    { from: '#F59E0B', to: '#D97706', glow: 'rgba(245,158,11,0.20)', text: '#FCD34D' },
    { from: '#EC4899', to: '#BE185D', glow: 'rgba(236,72,153,0.22)', text: '#F472B6' },
];
const accent = (i) => ACCENTS[i % ACCENTS.length];

const S = {
    page: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '0 0 80px',
        transition: 'background-color 0.3s ease',
    },
    grid: {
        position: 'fixed', inset: 0,
        backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        pointerEvents: 'none', zIndex: 0,
    },
    orb: {
        position: 'fixed', top: '10%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--orb-blue) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
    },
    inner: {
        position: 'relative', zIndex: 1,
        maxWidth: 1120, margin: '0 auto', padding: '48px 32px 0',
    },
    backBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: '10px',
        background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s ease',
    },
    header: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20, paddingBottom: 32,
        borderBottom: '1px solid var(--border-primary)', marginBottom: 40,
    },
    eyebrow: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 12px', borderRadius: 99,
        background: 'rgba(14,165,233,0.09)', border: '1px solid rgba(14,165,233,0.20)',
        marginBottom: 14,
    },
    eyebrowDot: {
        width: 6, height: 6, borderRadius: '50%', background: '#0EA5E9',
        boxShadow: '0 0 7px rgba(14,165,233,0.8)',
    },
    eyebrowText: {
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        color: '#0EA5E9', textTransform: 'uppercase',
    },
    h1: {
        fontSize: 36, fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', margin: 0,
        fontFamily: "'Syne', sans-serif",
    },
    subtext: {
        fontSize: 14, color: 'var(--text-secondary)', marginTop: 8,
    },
    newBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 22px', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #1B6FE8 100%)',
        color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(14,165,233,0.35)',
        fontFamily: 'inherit', whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: 4,
    },
    cardsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20,
    },
    card: {
        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
        borderRadius: 22, padding: '24px', cursor: 'pointer',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow-card)', height: '100%',
    },
    cardAccentBar: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '22px 22px 0 0',
    },
    cardTop: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16,
    },
    iconWrap: {
        width: 42, height: 42, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardName: {
        fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px',
        fontFamily: "'Syne', sans-serif",
    },
    cardDesc: {
        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    cardFooter: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-secondary)',
        fontSize: 13, color: 'var(--text-muted)',
    },
    empty: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', borderRadius: 28, background: 'var(--bg-card)',
        border: '1px dashed var(--border-primary)', textAlign: 'center',
    },
    emptyIcon: {
        width: 64, height: 64, borderRadius: 20, background: 'rgba(14,165,233,0.08)',
        border: '1px solid rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, color: '#0EA5E9',
    },
    emptyTitle: {
        fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px',
        fontFamily: "'Syne', sans-serif",
    },
    emptyText: {
        fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px',
    },
    skeletonGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20,
    },
    skeleton: {
        height: 180, borderRadius: 22, background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)', overflow: 'hidden', position: 'relative',
    },
    skeletonShimmer: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
    }
};

const SkeletonCard = ({ i }) => {
    const ref = useRef(null);
    useEffect(() => {
        gsap.fromTo(ref.current, { backgroundPositionX: '200%' }, { backgroundPositionX: '-200%', duration: 1.5, repeat: -1, ease: 'none', delay: i * 0.2 });
    }, [i]);
    return <div style={S.skeleton}><div ref={ref} style={S.skeletonShimmer} /></div>;
};

const ProjectCard = ({ project, index, onClick }) => {
    const cardRef = useRef(null);
    const ac = accent(index);

    const onEnter = () => {
        gsap.to(cardRef.current, { y: -5, background: 'var(--bg-card-hover)', borderColor: 'var(--hover-card-border)', boxShadow: `0 12px 40px ${ac.glow}`, duration: 0.25 });
    };
    const onLeave = () => {
        gsap.to(cardRef.current, { y: 0, background: 'var(--bg-card)', borderColor: 'var(--border-primary)', boxShadow: 'var(--shadow-card)', duration: 0.25 });
    };
    const onDown = () => gsap.to(cardRef.current, { scale: 0.985, duration: 0.1 });
    const onUp = () => gsap.to(cardRef.current, { scale: 1, duration: 0.15 });

    return (
        <div ref={cardRef} style={S.card} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave} onMouseDown={onDown} onMouseUp={onUp}>
            <div style={{ ...S.cardAccentBar, background: `linear-gradient(90deg, ${ac.from}, ${ac.to})` }} />
            <div style={S.cardTop}>
                <div style={{ ...S.iconWrap, background: `linear-gradient(135deg, ${ac.from}33, ${ac.to}33)`, border: `1px solid ${ac.from}44`, color: ac.text }}>
                    <Layout size={20} />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); /* TODO: project settings */ }}>
                    <MoreVertical size={18} />
                </button>
            </div>
            <h3 style={S.cardName}>{project.name}</h3>
            {project.description && <p style={S.cardDesc}>{project.description}</p>}
            <div style={S.cardFooter}>
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                <span style={{ color: ac.text, fontWeight: 600 }}>Open Board →</span>
            </div>
        </div>
    );
};

const WorkspaceView = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    
    const [workspace, setWorkspace] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pageRef = useRef(null);
    const contentRef = useRef(null);
    const btnRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Since there's no getWorkspaceById, we fetch all and find it
                const wsRes = await workspaceApi.getAll();
                const ws = wsRes.data.find(w => w._id === workspaceId);
                setWorkspace(ws);
                
                const projRes = await projectApi.getByWorkspace(workspaceId);
                setProjects(projRes.data || []);
            } catch (err) {
                console.error('Failed to load workspace data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [workspaceId]);

    useEffect(() => {
        if (!isLoading && contentRef.current) {
            const elements = contentRef.current.children;
            if (elements.length) {
                gsap.fromTo(elements, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }
                );
            }
        }
    }, [isLoading, projects.length]);

    const handleCreated = (newProject) => {
        setProjects(prev => [...prev, newProject]);
    };

    return (
        <div ref={pageRef} style={S.page}>
            <div style={S.grid} />
            <div style={S.orb} />

            <div style={S.inner}>
                <button 
                    style={S.backBtn} 
                    onClick={() => navigate('/dashboard')}
                    onMouseEnter={(e) => gsap.to(e.target, { background: 'var(--bg-input-hover)', duration: 0.2 })}
                    onMouseLeave={(e) => gsap.to(e.target, { background: 'var(--bg-input)', duration: 0.2 })}
                >
                    <ArrowLeft size={14} /> Back to Workspaces
                </button>

                <header style={S.header}>
                    <div>
                        <div style={S.eyebrow}>
                            <div style={S.eyebrowDot} />
                            <span style={S.eyebrowText}>Workspace</span>
                        </div>
                        <h1 style={S.h1}>{isLoading ? 'Loading...' : workspace?.name || 'Workspace'}</h1>
                        <p style={S.subtext}>Manage projects and boards within this workspace.</p>
                    </div>

                    <button
                        ref={btnRef}
                        style={S.newBtn}
                        onClick={() => setIsModalOpen(true)}
                        onMouseEnter={() => gsap.to(btnRef.current, { scale: 1.04, boxShadow: '0 12px 36px rgba(14,165,233,0.50)', duration: 0.2 })}
                        onMouseLeave={() => gsap.to(btnRef.current, { scale: 1, boxShadow: '0 8px 28px rgba(14,165,233,0.35)', duration: 0.2 })}
                    >
                        <Plus size={16} /> New Project
                    </button>
                </header>

                {isLoading ? (
                    <div style={S.skeletonGrid}>
                        {[0, 1, 2].map(i => <SkeletonCard key={i} i={i} />)}
                    </div>
                ) : projects.length === 0 ? (
                    <div ref={contentRef} style={S.empty}>
                        <div style={S.emptyIcon}><Folder size={28} /></div>
                        <h2 style={S.emptyTitle}>No projects yet</h2>
                        <p style={S.emptyText}>Create your first project board to start tracking tasks.</p>
                        <button style={S.newBtn} onClick={() => setIsModalOpen(true)}>
                            <Plus size={15} /> Create Project
                        </button>
                    </div>
                ) : (
                    <div ref={contentRef} style={S.cardsGrid}>
                        {projects.map((project, index) => (
                            <div key={project._id} style={{ opacity: 0 }}>
                                <ProjectCard 
                                    project={project} 
                                    index={index} 
                                    onClick={() => navigate(`/projects/${project._id}`)} 
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreated={handleCreated}
                workspaceId={workspaceId}
            />
        </div>
    );
};

export default WorkspaceView;
