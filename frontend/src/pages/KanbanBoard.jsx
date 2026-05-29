import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ArrowLeft, Loader2, Plus, Settings, Grid3x3 } from "lucide-react";
import { projectApi } from "../services/projectApi";
import { taskApi } from "../services/taskApi";
import { useSocket } from "../context/SocketContext";
import TaskCard from "../components/board/TaskCard";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import TaskDetailModal from "../components/modals/TaskDetailModal";
import OnlineUsers from "../components/board/OnlineUsers";
import toast from "react-hot-toast";
import gsap from "gsap";

/* ── Color tokens ── */
const COLUMN_ACCENTS = {
  backlog: {
    bar: "#64748B",
    glow: "rgba(100, 116, 139, 0.5)",
    label: "#CBD5E1",
    bg: "rgba(100, 116, 139, 0.08)",
    dot: "#94A3B8",
  },
  todo: {
    bar: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.5)",
    label: "#93C5FD",
    bg: "rgba(59, 130, 246, 0.08)",
    dot: "#60A5FA",
  },
  "in-progress": {
    bar: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.5)",
    label: "#D8B4FE",
    bg: "rgba(139, 92, 246, 0.08)",
    dot: "#A78BFA",
  },
  in_progress: {
    bar: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.5)",
    label: "#D8B4FE",
    bg: "rgba(139, 92, 246, 0.08)",
    dot: "#A78BFA",
  },
  review: {
    bar: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.5)",
    label: "#FCD34D",
    bg: "rgba(245, 158, 11, 0.08)",
    dot: "#FBBF24",
  },
  done: {
    bar: "#10B981",
    glow: "rgba(16, 185, 129, 0.5)",
    label: "#6EE7B7",
    bg: "rgba(16, 185, 129, 0.08)",
    dot: "#34D399",
  },
};

const getAccent = (id) =>
  COLUMN_ACCENTS[id?.toLowerCase()] || COLUMN_ACCENTS.todo;

/* ────────────────────────────────────────────
   DroppableColumn
──────────────────────────────────────────── */
const DroppableColumn = ({ colId, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: colId });
  const accent = getAccent(colId);

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: "100px",
        borderRadius: "12px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: isOver ? accent.bg : "transparent",
        border: isOver
          ? `1.5px dashed ${accent.bar}40`
          : "1.5px dashed transparent",
      }}
      className="kb-col-scroll"
    >
      {children}
    </div>
  );
};

/* ────────────────────────────────────────────
   Column Component
──────────────────────────────────────────── */
const Column = ({ column, tasks, onAddTask, onTaskClick }) => {
  const colRef = useRef(null);
  const barRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const accent = getAccent(column.id);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.05 },
    );
  }, []);

  /* Hover animations */
  const handleColEnter = () => {
    if (!colRef.current) return;
    gsap.to(colRef.current, {
      boxShadow: isLight
        ? `0 8px 28px ${accent.bar}35, 0 2px 8px ${accent.bar}20`
        : `0 8px 32px rgba(0,0,0,0.5), 0 0 28px ${accent.bar}30`,
      y: -3,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleColLeave = () => {
    if (!colRef.current) return;
    gsap.to(colRef.current, {
      boxShadow: isLight
        ? `0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px ${accent.bar}18`
        : `0 4px 24px rgba(0,0,0,0.35), 0 0 20px ${accent.bar}15`,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleAddBtnEnter = (e) => {
    gsap.to(e.currentTarget, {
      background: accent.bg.replace("0.08", "0.15"),
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleAddBtnLeave = (e) => {
    gsap.to(e.currentTarget, {
      background: 'var(--bg-input)',
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={colRef}
      onMouseEnter={handleColEnter}
      onMouseLeave={handleColLeave}
      style={{
        flex: '1 1 0',
        minWidth: '0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        // Gradient border trick: padding-box uses solid bg, border-box uses accent gradient
        background: isLight
          ? `linear-gradient(#FFFFFF, #FFFFFF) padding-box,
             linear-gradient(135deg, ${accent.bar}, ${accent.bar}55) border-box`
          : `linear-gradient(#0D1120, #0D1120) padding-box,
             linear-gradient(135deg, ${accent.bar}AA, ${accent.bar}33) border-box`,
        border: '2px solid transparent',
        boxShadow: isLight
          ? `0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px ${accent.bar}18`
          : `0 4px 24px rgba(0,0,0,0.35), 0 0 20px ${accent.bar}15`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Accent bar removed — gradient border replaces it in both themes */}
      <div
        ref={barRef}
        style={{ height: 0, overflow: 'hidden' }}
      />

      {/* Column Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 14px 12px",
          borderBottom: '1px solid var(--border-primary)',
          background: isLight ? `${accent.bar}08` : 'var(--bg-input)',
        }}
      >
        {/* Status dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            flexShrink: 0,
            background: accent.dot,
            boxShadow: `0 0 10px ${accent.glow}`,
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: 'var(--text-primary)',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {column.name}
        </span>

        {/* Task count badge */}
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            padding: "3px 10px",
            borderRadius: "999px",
            background: `${accent.bar}18`,
            border: `1px solid ${accent.bar}30`,
            color: accent.label,
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {tasks.length}
        </span>

        {/* Add task button */}
        <button
          onClick={() => onAddTask(column.id)}
          onMouseEnter={handleAddBtnEnter}
          onMouseLeave={handleAddBtnLeave}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: 'var(--bg-input)',
            border: '1px solid var(--border-primary)',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: 'var(--text-secondary)',
            flexShrink: 0,
            padding: "0",
            transition: "all 0.2s ease",
          }}
          title="Add new task"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Droppable Task List */}
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <DroppableColumn colId={column.id}>
          {tasks.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                color: `${accent.label}50`,
                fontSize: "12px",
                fontWeight: "500",
                minHeight: "120px",
                userSelect: "none",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <Grid3x3 size={32} strokeWidth={1} opacity={0.3} />
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => !false && onTaskClick(task)}
                style={{ cursor: "pointer" }}
              >
                <TaskCard task={task} onClick={onTaskClick} />
              </div>
            ))
          )}
        </DroppableColumn>
      </SortableContext>
    </div>
  );
};

/* ── Global Styles ── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .kb-root {
    font-family: 'Outfit', sans-serif;
  }

  .kb-board {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  .kb-board::-webkit-scrollbar {
    height: 6px;
  }

  .kb-board::-webkit-scrollbar-track {
    background: transparent;
  }

  .kb-board::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .kb-board::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .kb-col-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
  }

  .kb-col-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .kb-col-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .kb-col-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }

  .kb-col-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @keyframes kb-spin {
    to { transform: rotate(360deg); }
  }
`;

/* ────────────────────────────────────────────
   KanbanBoard Main Component
──────────────────────────────────────────── */
const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { joinProject, leaveProject, on } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState("todo");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const rootRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const headerRef = useRef(null);
  const boardRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ── Fetch project and tasks ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [projectRes, tasksRes] = await Promise.all([
          projectApi.getById(projectId),
          taskApi.getByProject(projectId),
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Failed to load board:", error);
        toast.error("Failed to load board");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  /* ── GSAP: Animated background orbs ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, {
        x: 60,
        y: -40,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        x: -50,
        y: 45,
        duration: 28,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  /* ── GSAP: Entry animations ── */
  useEffect(() => {
    if (loading) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 },
        0,
      );
    }

    if (boardRef.current) {
      tl.fromTo(
        boardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3",
      );

      setTimeout(() => {
        const columns = boardRef.current?.querySelectorAll("[data-column]");
        if (columns?.length) {
          gsap.fromTo(
            columns,
            { opacity: 0, y: 30, scale: 0.92 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              stagger: 0.08,
              ease: "back.out(1.4)",
            },
          );
        }
      }, 100);
    }
  }, [loading]);

  /* ── Socket events ── */
  useEffect(() => {
    if (!projectId) return;
    joinProject(projectId);
    return () => leaveProject(projectId);
  }, [projectId, joinProject, leaveProject]);

  useEffect(() => {
    const unsubscribers = [
      on("taskCreated", ({ task }) => {
        setTasks((prev) =>
          prev.some((t) => t._id === task._id) ? prev : [...prev, task],
        );
      }),
      on("taskUpdated", ({ task }) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      }),
      on("taskMoved", ({ task }) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      }),
      on("taskDeleted", ({ taskId }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }),
    ];
    return () => unsubscribers.forEach((fn) => fn());
  }, [on]);

  /* ── DnD handlers ── */
  const getTasksByColumn = useCallback(
    (columnId) =>
      tasks
        .filter((t) => t.status === columnId)
        .sort((a, b) => a.position - b.position),
    [tasks],
  );

  const findTaskColumn = (taskId) => {
    return tasks.find((t) => t._id === taskId)?.status || null;
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const fromColumn = findTaskColumn(active.id);
    const toColumn = findTaskColumn(over.id) || over.id;

    if (fromColumn && toColumn && fromColumn !== toColumn) {
      setTasks((prev) =>
        prev.map((t) => (t._id === active.id ? { ...t, status: toColumn } : t)),
      );
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);

    if (!over) return;

    try {
      const toColumn = findTaskColumn(over.id) || over.id;
      const columnTasks = getTasksByColumn(toColumn);
      const targetIndex = columnTasks.findIndex((t) => t._id === over.id);
      const newPosition = targetIndex >= 0 ? targetIndex : columnTasks.length;

      setTasks((prev) =>
        prev.map((t) =>
          t._id === active.id
            ? { ...t, status: toColumn, position: newPosition }
            : t,
        ),
      );

      // Call backend API
      await taskApi.move(active.id, toColumn, newPosition);
    } catch (error) {
      console.error("Failed to move task:", error);
      toast.error("Failed to move task");
      // Reload tasks on error
      try {
        const res = await taskApi.getByProject(projectId);
        setTasks(res.data);
      } catch {
        toast.error("Failed to reload tasks");
      }
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg-primary)",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <Loader2
          size={32}
          color="#3B82F6"
          style={{ animation: "kb-spin 1s linear infinite" }}
        />
        <span style={{ color: "#64748B", fontSize: "14px", fontWeight: "500" }}>
          Loading board…
        </span>
        <style>{GLOBAL_STYLES}</style>
      </div>
    );
  }

  const columns = (project?.columns || []).sort(
    (a, b) => a.position - b.position,
  );

  return (
    <div
      ref={rootRef}
      className="kb-root"
      style={{
        height: 'calc(100vh - 76px)',
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{GLOBAL_STYLES}</style>

      {/* Animated background orbs */}
      <div
        ref={orb1Ref}
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--orb-blue) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        ref={orb2Ref}
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-8%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--orb-purple) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
                        linear-gradient(var(--grid-line) 1px, transparent 1px),
                        linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
                    `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <header
        ref={headerRef}
        style={{
          position: "relative",
          zIndex: 20,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px 22px",
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: 0,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              background: 'var(--bg-card-hover)',
              scale: 1.08,
              duration: 0.2,
              ease: 'power2.out',
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              background: 'var(--bg-input)',
              scale: 1,
              duration: 0.2,
              ease: 'power2.out',
            });
          }}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            flexShrink: 0,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-primary)',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: 'var(--text-secondary)',
            padding: "0",
            transition: "all 0.2s ease",
          }}
          title="Go back"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </button>

        {/* Project indicator */}
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            flexShrink: 0,
            background: project?.color || "#3B82F6",
            boxShadow: `0 0 12px ${project?.color || "#3B82F6"}`,
          }}
        />

        {/* Project name */}
        <h1
          style={{
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
            color: 'var(--text-primary)',
            letterSpacing: "-0.02em",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {project?.name || "Project"}
        </h1>

        {/* Total task count */}
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "999px",
            flexShrink: 0,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-primary)',
            fontSize: "12px",
            fontWeight: "600",
            color: 'var(--text-secondary)',
          }}
        >
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>

        {/* Column indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "auto",
            marginRight: "14px",
            paddingRight: "14px",
            borderRight: '1px solid var(--border-primary)',
          }}
        >
          {columns.map((col) => {
            const accent = getAccent(col.id);
            const count = tasks.filter((t) => t.status === col.id).length;
            return (
              <div
                key={col.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: accent.bg,
                }}
                title={col.name}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: accent.dot,
                    boxShadow: `0 0 6px ${accent.glow}`,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: accent.label,
                    fontWeight: "700",
                    minWidth: "16px",
                    textAlign: "center",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Online users */}
        <OnlineUsers />
      </header>

      {/* Board */}
      <div
        ref={boardRef}
        className="kb-board"
        style={{
          flex: 1,
          minHeight: "0",
          position: "relative",
          zIndex: 10,
          display: "flex",
          padding: "16px 18px",
          gap: "12px",
          overflowX: "auto",
          overflowY: "hidden",
          opacity: 0,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Columns container */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              height: "100%",
              width: "100%",
              minWidth: `${Math.max(columns.length * 280, 900)}px`,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.id}
                data-column
                style={{
                  flex: "1 1 0",
                  minWidth: "0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Column
                  column={column}
                  tasks={getTasksByColumn(column.id)}
                  onAddTask={(columnId) => {
                    setNewTaskColumn(columnId);
                    setIsTaskModalOpen(true);
                  }}
                  onTaskClick={(task) => setSelectedTaskId(task._id)}
                />
              </div>
            ))}
          </div>

          {/* Drag overlay */}
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeTask && (
              <div
                style={{
                  transform: "rotate(2deg) scale(1.05)",
                  filter: "drop-shadow(0 24px 48px rgba(0, 0, 0, 0.7))",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              >
                <TaskCard task={activeTask} isDragging={true} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId}
        defaultStatus={newTaskColumn}
        onCreated={(task) => {
          // Do NOT add to state here — the socket 'taskCreated' event
          // already handles adding it with deduplication.
          // Just close is handled inside CreateTaskModal itself.
        }}
      />
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
    </div>
  );
};

export default KanbanBoard;
