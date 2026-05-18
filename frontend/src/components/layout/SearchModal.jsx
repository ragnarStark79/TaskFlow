import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, FolderKanban, CheckSquare } from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
import { projectApi } from '../../services/projectApi';
import { taskApi } from '../../services/taskApi';

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(6,8,16,0.7)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '80px 16px 16px',
    backdropFilter: 'blur(10px)'
  },
  panel: {
    width: '100%',
    maxWidth: 720,
    background: 'rgba(12,16,28,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#F0F4FF',
    fontSize: 14,
    fontFamily: 'inherit'
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: 'rgba(200,210,230,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  body: {
    maxHeight: '60vh',
    overflowY: 'auto',
    padding: '12px 10px 16px'
  },
  section: {
    padding: '10px 8px'
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(160,170,200,0.6)',
    margin: '6px 8px 8px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    cursor: 'pointer',
    color: '#E2E8F0',
    border: '1px solid transparent'
  },
  itemMeta: {
    fontSize: 12,
    color: 'rgba(160,170,200,0.6)'
  },
  empty: {
    padding: '20px 10px',
    color: 'rgba(160,170,200,0.6)',
    fontSize: 13,
    textAlign: 'center'
  }
};

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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
        setTasks(taskRes?.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        workspaces: workspaces.slice(0, 5),
        projects: projects.slice(0, 5),
        tasks: tasks.slice(0, 5),
      };
    }
    return {
      workspaces: workspaces.filter((w) => w.name?.toLowerCase().includes(q)).slice(0, 8),
      projects: projects.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8),
      tasks: tasks.filter((t) => t.title?.toLowerCase().includes(q)).slice(0, 8),
    };
  }, [query, workspaces, projects, tasks]);

  if (!isOpen) return null;

  return (
    <div style={S.overlay} onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div style={S.panel}>
        <div style={S.header}>
          <Search size={16} color="rgba(200,210,230,0.8)" />
          <input
            ref={inputRef}
            style={S.input}
            placeholder="Search workspaces, projects, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button style={S.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div style={S.body}>
          {loading ? (
            <div style={S.empty}>Loading results...</div>
          ) : (
            <>
              <div style={S.section}>
                <div style={S.sectionTitle}>Workspaces</div>
                {filtered.workspaces.length === 0 ? (
                  <div style={S.empty}>No workspaces found</div>
                ) : (
                  filtered.workspaces.map((w) => (
                    <div
                      key={w._id}
                      style={S.item}
                      onClick={() => {
                        onClose();
                        navigate(`/workspace/${w._id}`);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Folder size={16} />
                      <div>
                        <div>{w.name}</div>
                        <div style={S.itemMeta}>Workspace</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={S.section}>
                <div style={S.sectionTitle}>Projects</div>
                {filtered.projects.length === 0 ? (
                  <div style={S.empty}>No projects found</div>
                ) : (
                  filtered.projects.map((p) => (
                    <div
                      key={p._id}
                      style={S.item}
                      onClick={() => {
                        onClose();
                        navigate(`/projects/${p._id}`);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FolderKanban size={16} />
                      <div>
                        <div>{p.name}</div>
                        <div style={S.itemMeta}>
                          {p.workspace?.name ? `Workspace: ${p.workspace.name}` : 'Standalone project'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={S.section}>
                <div style={S.sectionTitle}>Tasks</div>
                {filtered.tasks.length === 0 ? (
                  <div style={S.empty}>No tasks found</div>
                ) : (
                  filtered.tasks.map((t) => (
                    <div
                      key={t._id}
                      style={S.item}
                      onClick={() => {
                        onClose();
                        const projectId = t.project?._id || t.project;
                        if (projectId) navigate(`/projects/${projectId}`);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <CheckSquare size={16} />
                      <div>
                        <div>{t.title}</div>
                        <div style={S.itemMeta}>{t.project?.name ? `Project: ${t.project.name}` : 'Task'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
