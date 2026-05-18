import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Filter,
  Calendar,
  ArrowUpRight,
  Search,
  ListTodo,
  Clock,
  AlertTriangle,
  ChevronDown,
  Plus,
  Link2Off,
} from "lucide-react";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import gsap from "gsap";
import toast from "react-hot-toast";
import { taskApi } from "../services/taskApi";
import { projectApi } from "../services/projectApi";
import { workspaceApi } from "../services/workspaceApi";
import TaskDetailModal from "../components/modals/TaskDetailModal";
import CreateProjectModal from "../components/modals/CreateProjectModal";

const STATUS_LABELS = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const S = {
  page: {
    minHeight: "100vh",
    background: "#060810",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "0 0 80px",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb1: {
    position: "fixed",
    top: "-10%",
    left: "-8%",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(56,182,255,0.12) 0%, transparent 70%)",
    filter: "blur(70px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    bottom: "-15%",
    right: "-8%",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(120,80,255,0.12) 0%, transparent 70%)",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "48px 32px 0",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    paddingBottom: 28,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 28,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #1B6FE8 0%, #7B3FE4 100%)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(27,111,232,0.35)",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "4px 12px",
    borderRadius: 99,
    background: "rgba(56,182,255,0.09)",
    border: "1px solid rgba(56,182,255,0.20)",
    marginBottom: 12,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#38B6FF",
    boxShadow: "0 0 7px rgba(56,182,255,0.8)",
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#38B6FF",
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#F0F4FF",
    margin: 0,
    fontFamily: "'Syne', sans-serif",
  },
  subtext: {
    fontSize: 14,
    color: "rgba(160,170,200,0.65)",
    marginTop: 8,
  },
  workspaceChip: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(14,165,233,0.15)",
    border: "1px solid rgba(14,165,233,0.3)",
    color: "#7DD3FC",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E2E8F0",
    margin: "0 0 12px",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 18,
    marginBottom: 24,
  },
  statsBar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  statChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    fontSize: 13,
    color: "rgba(180,190,220,0.7)",
  },
  statNum: {
    fontWeight: 700,
    fontSize: 15,
    color: "#F0F4FF",
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#E2E8F0",
    flex: "1 1 260px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "inherit",
    fontSize: 13,
    width: "100%",
    fontFamily: "inherit",
  },
  modalSelect: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#E2E8F0",
    fontSize: 13,
    fontFamily: "inherit",
  },
  select: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(200,210,230,0.75)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  selectNative: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "inherit",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  tab: {
    padding: "7px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(160,170,200,0.65)",
    background: "transparent",
    cursor: "pointer",
  },
  tabActive: {
    color: "#E2E8F0",
    borderColor: "rgba(59,130,246,0.5)",
    background: "rgba(59,130,246,0.15)",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 18,
  },
  card: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 8px 26px rgba(0,0,0,0.25)",
    transition: "transform 0.2s, border-color 0.2s",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#F0F4FF",
    margin: 0,
    fontFamily: "'Syne', sans-serif",
  },
  desc: {
    fontSize: 13,
    color: "rgba(160,170,200,0.65)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 38,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(200,210,230,0.75)",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    color: "rgba(160,170,200,0.65)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "rgba(200,210,230,0.7)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    borderRadius: 28,
    background: "rgba(255,255,255,0.03)",
    border: "1px dashed rgba(255,255,255,0.08)",
    textAlign: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: "rgba(56,182,255,0.08)",
    border: "1px solid rgba(56,182,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    color: "#38B6FF",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#F0F4FF",
    margin: "0 0 8px",
    fontFamily: "'Syne', sans-serif",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(160,170,200,0.55)",
    margin: "0 0 24px",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 18,
  },
  skeleton: {
    height: 180,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  skeletonShimmer: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)",
    backgroundSize: "200% 100%",
  },
};

const StatusPill = ({ status }) => {
  const label = STATUS_LABELS[status] || "Todo";
  const colorMap = {
    backlog: "rgba(100,116,139,0.25)",
    todo: "rgba(59,130,246,0.25)",
    in_progress: "rgba(139,92,246,0.25)",
    review: "rgba(245,158,11,0.25)",
    done: "rgba(16,185,129,0.25)",
  };
  return (
    <span
      style={{
        ...S.chip,
        background: colorMap[status] || "rgba(59,130,246,0.2)",
        borderColor: "transparent",
        color: "#E2E8F0",
      }}
    >
      {label}
    </span>
  );
};

const PriorityPill = ({ priority }) => {
  const label = PRIORITY_LABELS[priority] || "Medium";
  const colorMap = {
    urgent: "rgba(239,68,68,0.2)",
    high: "rgba(249,115,22,0.2)",
    medium: "rgba(234,179,8,0.2)",
    low: "rgba(34,197,94,0.2)",
  };
  return (
    <span
      style={{
        ...S.chip,
        background: colorMap[priority] || "rgba(234,179,8,0.2)",
        borderColor: "transparent",
        color: "#E2E8F0",
      }}
    >
      {label}
    </span>
  );
};

const TaskCardItem = ({ task, onOpen, onGoProject, onManageWorkspace }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
    );
  }, []);

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const overdue =
    dueDate && isBefore(dueDate, startOfDay(new Date())) && task.status !== "done";

  return (
    <div
      ref={ref}
      style={S.card}
      onMouseEnter={(e) =>
        gsap.to(e.currentTarget, {
          y: -4,
          borderColor: "rgba(59,130,246,0.35)",
          duration: 0.2,
        })
      }
      onMouseLeave={(e) =>
        gsap.to(e.currentTarget, {
          y: 0,
          borderColor: "rgba(255,255,255,0.07)",
          duration: 0.2,
        })
      }
    >
      <div style={S.cardTop}>
        <div>
          <h3 style={S.title}>{task.title}</h3>
          <p style={S.desc}>{task.description || "No description added."}</p>
        </div>
        <button style={S.actionBtn} onClick={() => onOpen(task._id)}>
          View
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div style={S.chips}>
        <StatusPill status={task.status} />
        <PriorityPill priority={task.priority} />
        {task.project?.name && (
          <span style={S.chip}>{task.project.name}</span>
        )}
      </div>

      <div style={S.cardFooter}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={13} />
          {dueDate ? (
            <span style={{ color: overdue ? "#F87171" : "inherit" }}>
              {isToday(dueDate) ? "Due today" : format(dueDate, "MMM d, yyyy")}
            </span>
          ) : (
            <span>No due date</span>
          )}
          {overdue && (
            <span style={{ color: "#F87171", fontWeight: 600 }}>
              Overdue
            </span>
          )}
        </div>
        {task.project?._id && (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.ghostBtn} onClick={() => onManageWorkspace(task.project)}>
              {task.project.workspace ? 'Change workspace' : 'Attach workspace'}
            </button>
            <button style={S.actionBtn} onClick={() => onGoProject(task.project._id)}>
              Open board
              <ArrowUpRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCardItem = ({ project, onOpenBoard, onManageWorkspace }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
    );
  }, []);

  return (
    <div
      ref={ref}
      style={S.card}
      onMouseEnter={(e) =>
        gsap.to(e.currentTarget, {
          y: -4,
          borderColor: "rgba(59,130,246,0.35)",
          duration: 0.2,
        })
      }
      onMouseLeave={(e) =>
        gsap.to(e.currentTarget, {
          y: 0,
          borderColor: "rgba(255,255,255,0.07)",
          duration: 0.2,
        })
      }
    >
      <div style={S.cardTop}>
        <div>
          <h3 style={S.title}>{project.name}</h3>
          <p style={S.desc}>{project.description || "No description added."}</p>
        </div>
        <button style={S.actionBtn} onClick={() => onOpenBoard(project._id)}>
          Open board
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div style={S.chips}>
        <span style={S.chip}>Project</span>
        {project.workspace?.name && (
          <span style={S.workspaceChip}>{project.workspace.name}</span>
        )}
      </div>

      <div style={S.cardFooter}>
        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        <button style={S.ghostBtn} onClick={() => onManageWorkspace(project)}>
          {project.workspace ? "Change workspace" : "Attach workspace"}
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = ({ index }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { backgroundPositionX: "200%" },
      {
        backgroundPositionX: "-200%",
        duration: 1.5,
        repeat: -1,
        ease: "none",
        delay: index * 0.15,
      },
    );
  }, [index]);

  return (
    <div style={S.skeleton}>
      <div ref={ref} style={S.skeletonShimmer} />
    </div>
  );
};

const ProjectWorkspaceModal = ({
  isOpen,
  onClose,
  project,
  workspaces,
  onSaved,
}) => {
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(project?.workspace?._id || '');
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { workspace: selectedId || null };
      const data = await projectApi.update(project._id, payload);
      toast.success('Workspace updated');
      onSaved(data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(6,8,16,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(15,20,32,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: '#F0F4FF', fontSize: 18, fontWeight: 700 }}>
              Workspace for {project.name}
            </h3>
            <p style={{ margin: '6px 0 0', color: 'rgba(160,170,200,0.6)', fontSize: 12 }}>
              Attach to a workspace or set as standalone.
            </p>
          </div>
          <button style={S.ghostBtn} onClick={onClose}>
            Close
          </button>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ ...S.modalSelect, marginBottom: 16 }}
        >
          <option value="">No workspace (standalone)</option>
          {workspaces.map((ws) => (
            <option key={ws._id} value={ws._id}>
              {ws.name}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <button
            style={S.ghostBtn}
            onClick={() => setSelectedId('')}
            disabled={!selectedId}
          >
            <Link2Off size={14} />
            Detach
          </button>
          <button style={S.primaryBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortBy, setSortBy] = useState("due");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [manageProject, setManageProject] = useState(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const headerRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector("[data-tf-fonts]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
      link.dataset.tfFonts = "1";
      document.head.appendChild(link);
    }

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await taskApi.getMyTasks();
        setTasks(res?.data ?? []);
        const projRes = await projectApi.getMyProjects();
        setProjects(projRes?.data ?? []);
        const wsRes = await workspaceApi.getAll();
        setWorkspaces(wsRes?.data ?? []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const normalizeStatus = (value) => value?.replace("-", "_") || "todo";

    return tasks
      .filter((task) => task.project?.origin === 'tasks')
      .filter((task) => {
        const matchesStatus =
          status === "all" || normalizeStatus(task.status) === status;
        const matchesPriority =
          priority === "all" || task.priority === priority;
        const matchesSearch =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.project?.name?.toLowerCase().includes(query);

        return matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
        }
        if (sortBy === "updated") {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        const aDue = a.dueDate ? new Date(a.dueDate) : null;
        const bDue = b.dueDate ? new Date(b.dueDate) : null;
        if (!aDue && !bDue) return 0;
        if (!aDue) return 1;
        if (!bDue) return -1;
        return aDue - bDue;
      });
  }, [tasks, search, status, priority, sortBy]);

  const stats = useMemo(() => {
    const standaloneTasks = tasks.filter((task) => task.project?.origin === 'tasks');
    const today = startOfDay(new Date());
    const overdue = standaloneTasks.filter(
      (task) =>
        task.dueDate &&
        isBefore(new Date(task.dueDate), today) &&
        task.status !== "done",
    ).length;
    const dueToday = standaloneTasks.filter(
      (task) => task.dueDate && isToday(new Date(task.dueDate)),
    ).length;
    const highPriority = standaloneTasks.filter(
      (task) => task.priority === "high" || task.priority === "urgent",
    ).length;

    return {
      total: standaloneTasks.length,
      overdue,
      dueToday,
      highPriority,
    };
  }, [tasks]);

  return (
    <div style={S.page}>
      <div style={S.grid} />
      <div style={S.orb1} />
      <div style={S.orb2} />

      <div style={S.inner}>
        <header ref={headerRef} style={S.header}>
          <div>
            <div style={S.eyebrow}>
              <div style={S.eyebrowDot} />
              <span style={S.eyebrowText}>Tasks</span>
            </div>
            <h1 style={S.h1}>My Tasks</h1>
            <p style={S.subtext}>
              Track everything assigned to you across every workspace.
            </p>
          </div>
          <div style={S.headerActions}>
            <button style={S.primaryBtn} onClick={() => setIsProjectModalOpen(true)}>
              <Plus size={16} />
              New Project
            </button>
          </div>
        </header>

        <div style={S.statsBar}>
          <div style={S.statChip}>
            <ListTodo size={14} />
            <span style={S.statNum}>{stats.total}</span>
            <span>Total</span>
          </div>
          <div style={S.statChip}>
            <Clock size={14} />
            <span style={S.statNum}>{stats.dueToday}</span>
            <span>Due Today</span>
          </div>
          <div style={S.statChip}>
            <AlertTriangle size={14} />
            <span style={S.statNum}>{stats.overdue}</span>
            <span>Overdue</span>
          </div>
          <div style={S.statChip}>
            <CheckSquare size={14} />
            <span style={S.statNum}>{stats.highPriority}</span>
            <span>High Priority</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={S.sectionTitle}>Standalone Projects</h2>
          {projects.filter((project) => project.origin === 'tasks').length === 0 ? (
            <div style={{ color: "rgba(160,170,200,0.6)", fontSize: 13 }}>
              No standalone projects yet. Create one to start building tasks.
            </div>
          ) : (
            <div style={S.projectGrid}>
              {projects.filter((project) => project.origin === 'tasks').map((project) => (
                <ProjectCardItem
                  key={project._id}
                  project={project}
                  onOpenBoard={(projectId) => navigate(`/projects/${projectId}`)}
                  onManageWorkspace={(proj) => {
                    setManageProject(proj);
                    setIsWorkspaceModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <h2 style={{ ...S.sectionTitle, marginBottom: 10 }}>Standalone Tasks</h2>

        <div style={S.filters}>
          <div style={S.search}>
            <Search size={14} />
            <input
              style={S.searchInput}
              placeholder="Search tasks, project names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={S.select}>
            <Filter size={14} />
            <select
              style={S.selectNative}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={S.select}>
            <ChevronDown size={14} />
            <select
              style={S.selectNative}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="due">Sort by due date</option>
              <option value="priority">Sort by priority</option>
              <option value="updated">Sort by last update</option>
            </select>
          </div>
        </div>

        <div style={S.tabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              style={{
                ...S.tab,
                ...(status === tab.value ? S.tabActive : {}),
              }}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={S.skeletonGrid}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>
              <CheckSquare size={28} />
            </div>
            <h2 style={S.emptyTitle}>No tasks found</h2>
            <p style={S.emptyText}>
              Create tasks inside a standalone project board to see them here.
            </p>
          </div>
        ) : (
          <div style={S.list}>
            {filteredTasks.map((task) => (
              <TaskCardItem
                key={task._id}
                task={task}
                onOpen={setSelectedTaskId}
                onGoProject={(projectId) => navigate(`/projects/${projectId}`)}
                onManageWorkspace={(project) => {
                  setManageProject(project);
                  setIsWorkspaceModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        onUpdated={(updated) => {
          if (!updated) {
            setTasks((prev) => prev.filter((t) => t._id !== selectedTaskId));
            setSelectedTaskId(null);
            toast.success("Task deleted");
          } else {
            setTasks((prev) =>
              prev.map((t) => (t._id === updated._id ? updated : t)),
            );
            toast.success("Task updated");
          }
        }}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={(project) => {
          toast.success('Project created');
          setIsProjectModalOpen(false);
          projectApi.getMyProjects().then((res) => {
            setProjects(res?.data ?? []);
          });
        }}
        workspaces={workspaces}
        allowWorkspaceSelect={true}
      />

      <ProjectWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => {
          setIsWorkspaceModalOpen(false);
          setManageProject(null);
        }}
        project={manageProject}
        workspaces={workspaces}
        onSaved={(updatedProject) => {
          setTasks((prev) =>
            prev.map((task) =>
              task.project?._id === updatedProject._id
                ? { ...task, project: updatedProject }
                : task,
            ),
          );
          setProjects((prev) =>
            prev.map((proj) =>
              proj._id === updatedProject._id ? updatedProject : proj,
            ),
          );
          setManageProject(updatedProject);
        }}
      />
    </div>
  );
};

export default Tasks;
