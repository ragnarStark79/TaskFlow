import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, FolderKanban, CheckSquare, Loader2 } from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
import { projectApi } from '../../services/projectApi';
import { taskApi } from '../../services/taskApi';
import { useTheme } from '../../context/ThemeContext';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setLoading(true);
    (async () => {
      try {
        const [wsRes, projRes, taskRes] = await Promise.all([
          workspaceApi.getAll(),
          projectApi.getMyProjects(),
          taskApi.getMyTasks(),
        ]);
        setWorkspaces(wsRes?.data ?? []);
        setProjects(projRes?.data ?? []);
        // Handle both response shapes: { data: [...] } or plain array
        const taskData = taskRes?.data ?? taskRes ?? [];
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch (e) {
        console.error('Search load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return {
      workspaces: workspaces.slice(0, 5),
      projects: projects.slice(0, 5),
      tasks: tasks.slice(0, 5),
    };
    return {
      workspaces: workspaces.filter(w => w.name?.toLowerCase().includes(q)).slice(0, 8),
      projects: projects.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 8),
      tasks: tasks.filter(t => t.title?.toLowerCase().includes(q)).slice(0, 8),
    };
  }, [query, workspaces, projects, tasks]);

  if (!isOpen) return null;

  // Theme values
  const overlayBg = isLight ? 'rgba(100,116,139,0.25)' : 'rgba(6,8,16,0.75)';
  const panelBg = isLight ? '#FFFFFF' : 'rgba(12,16,28,0.97)';
  const panelBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)';
  const panelShadow = isLight
    ? '0 24px 64px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)'
    : '0 24px 64px rgba(0,0,0,0.55)';
  const headerBorder = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
  const inputColor = isLight ? '#1A1A2E' : '#F0F4FF';
  const placeholderColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)';
  const iconColor = isLight ? '#9CA3AF' : 'rgba(200,210,230,0.6)';
  const closeBtnBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const closeBtnBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const sectionTitleColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.55)';
  const itemColor = isLight ? '#1A1A2E' : '#E2E8F0';
  const metaColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.55)';
  const emptyColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.5)';
  const sectionBorder = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)';

  const Item = ({ icon: Icon, name, meta, onClick }) => (
    <div
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 12,
        cursor: 'pointer', color: itemColor,
        transition: 'background 0.12s',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor,
      }}>
        <Icon size={15} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: itemColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 11, color: metaColor, marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  );

  const Section = ({ title, children, count }) => (
    <div style={{ padding: '4px 4px 2px' }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: sectionTitleColor, padding: '8px 12px 6px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {title}
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 999,
          background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
          color: metaColor,
        }}>{count}</span>
      </div>
      {children}
      <div style={{ height: 1, background: sectionBorder, margin: '6px 4px 4px' }} />
    </div>
  );

  const hasResults = filtered.workspaces.length + filtered.projects.length + filtered.tasks.length > 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: overlayBg,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '72px 16px 16px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={e => e.currentTarget === e.target && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 640,
        background: panelBg,
        border: `1px solid ${panelBorder}`,
        borderRadius: 20,
        boxShadow: panelShadow,
        overflow: 'hidden',
        animation: 'searchFadeIn 0.18s ease',
      }}>
        {/* Search input header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${headerBorder}`,
        }}>
          {loading
            ? <Loader2 size={16} color={iconColor} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            : <Search size={16} color={iconColor} style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            placeholder="Search workspaces, projects, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: inputColor, fontSize: 14, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: 6, width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: iconColor, flexShrink: 0,
              }}
            >
              <X size={11} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              border: `1px solid ${closeBtnBorder}`,
              background: closeBtnBg,
              color: iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '56vh', overflowY: 'auto', padding: '8px 8px 12px' }}>
          {loading ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: emptyColor, fontSize: 13 }}>
              Loading…
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: emptyColor, fontSize: 13 }}>
              {query ? `No results for "${query}"` : 'Start typing to search…'}
            </div>
          ) : (
            <>
              {filtered.workspaces.length > 0 && (
                <Section title="Workspaces" count={filtered.workspaces.length}>
                  {filtered.workspaces.map(w => (
                    <Item key={w._id} icon={Folder} name={w.name} meta="Workspace"
                      onClick={() => { onClose(); navigate(`/workspace/${w._id}`); }} />
                  ))}
                </Section>
              )}
              {filtered.projects.length > 0 && (
                <Section title="Projects" count={filtered.projects.length}>
                  {filtered.projects.map(p => (
                    <Item key={p._id} icon={FolderKanban} name={p.name}
                      meta={p.workspace?.name ? `Workspace: ${p.workspace.name}` : 'Standalone project'}
                      onClick={() => { onClose(); navigate(`/projects/${p._id}`); }} />
                  ))}
                </Section>
              )}
              {filtered.tasks.length > 0 && (
                <Section title="Tasks" count={filtered.tasks.length}>
                  {filtered.tasks.map(t => (
                    <Item key={t._id} icon={CheckSquare} name={t.title}
                      meta={t.project?.name ? `Project: ${t.project.name}` : 'Task'}
                      onClick={() => {
                        onClose();
                        const pid = t.project?._id || t.project;
                        if (pid) navigate(`/projects/${pid}`);
                      }} />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes searchFadeIn { from { opacity: 0; transform: scale(0.97) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SearchModal;
