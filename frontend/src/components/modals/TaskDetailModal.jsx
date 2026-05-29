import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X,
  Calendar,
  Flag,
  Send,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  MessageSquare,
  Paperclip,
  Clock,
  Loader2,
  Eye,
  Pencil,
  Tag,
  History,
} from "lucide-react";
import { taskApi } from "../../services/taskApi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ActivityTimeline from "../task/ActivityTimeline";
import FileUploadZone from "../task/FileUploadZone";
import toast from "react-hot-toast";
import gsap from "gsap";

/* ── Design tokens (theme-aware) ── */
const getTokens = (isLight) => ({
  bg:      isLight ? '#FFFFFF'                    : '#0C0F1C',
  bgTop:   isLight ? 'rgba(255,255,255,0.96)'     : 'rgba(12,15,28,0.96)',
  surface: isLight ? '#F7F8FA'                    : '#111520',
  border:  isLight ? 'rgba(0,0,0,0.08)'           : 'rgba(255,255,255,0.07)',
  borderMd:isLight ? 'rgba(0,0,0,0.12)'           : 'rgba(255,255,255,0.10)',
  text:    isLight ? '#111827'                    : '#E2E8F0',
  muted:   isLight ? '#6B7280'                    : '#64748B',
  subtle:  isLight ? '#F3F4F6'                    : '#1E2436',
  input:   isLight ? '#F3F4F6'                    : 'rgba(255,255,255,0.04)',
  inputBdr:isLight ? 'rgba(0,0,0,0.10)'           : 'rgba(255,255,255,0.07)',
  label:   isLight ? '#374151'                    : '#94A3B8',
  shadow:  isLight
    ? '0 20px 60px rgba(0,0,0,0.12), -4px 0 20px rgba(0,0,0,0.04)'
    : '-20px 0 80px rgba(0,0,0,0.6)',
});

const STATUS_CONFIG = {
  backlog: { color: "#475569", label: "Backlog" },
  todo: { color: "#3B82F6", label: "Todo" },
  in_progress: { color: "#8B5CF6", label: "In Progress" },
  "in-progress": { color: "#8B5CF6", label: "In Progress" },
  review: { color: "#F59E0B", label: "Review" },
  done: { color: "#10B981", label: "Done" },
};

const PRIORITY_CONFIG = {
  urgent: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    label: "Urgent",
  },
  high: {
    color: "#F97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.25)",
    label: "High",
  },
  medium: {
    color: "#EAB308",
    bg: "rgba(234,179,8,0.12)",
    border: "rgba(234,179,8,0.25)",
    label: "Medium",
  },
  low: {
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    label: "Low",
  },
};

const LABEL_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#06B6D4",
  "#F97316",
];

/* ── Modal CSS (theme-aware via data-theme) ── */
const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  .tdm * { box-sizing: border-box; }
  .tdm-scroll::-webkit-scrollbar { width: 4px; }
  .tdm-scroll::-webkit-scrollbar-track { background: transparent; }
  .tdm-scroll::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 4px; }

  .tdm-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-primary);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
  }
  .tdm-input::placeholder { color: var(--text-muted); }
  .tdm-input:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.10);
  }

  .tdm-tab-btn {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 8px 12px; border-radius: 9px; border: none;
    font-size: 12px; font-weight: 600; cursor: pointer;
    background: transparent; transition: all 0.15s;
    font-family: 'Outfit', sans-serif;
    color: var(--text-secondary);
  }
  .tdm-tab-btn.active { background: rgba(59,130,246,0.12); color: #3B82F6; }
  .tdm-tab-btn:not(.active):hover { background: var(--bg-input); color: var(--text-primary); }

  .tdm-status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 999px;
    font-size: 11px; font-weight: 600; cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s; white-space: nowrap;
    font-family: 'Outfit', sans-serif;
  }

  .tdm-priority-btn {
    padding: 5px 14px; border-radius: 8px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1px solid; transition: all 0.15s;
    font-family: 'Outfit', sans-serif;
  }

  .tdm-section-label {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.10em;
    color: var(--text-muted); font-family: 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }

  .tdm-row-btn {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px; border: none;
    background: transparent; cursor: pointer; text-align: left;
    transition: background 0.15s; color: var(--text-secondary);
    font-family: 'Outfit', sans-serif; font-size: 13px;
  }
  .tdm-row-btn:hover { background: var(--bg-input); }

  .tdm-divider {
    height: 1px;
    background: var(--border-primary);
    margin: 8px 0;
  }

  .tdm-send-btn {
    padding: 0 18px; height: 38px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #2563EB, #4F46E5);
    color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: opacity 0.15s, transform 0.1s;
    font-family: 'Outfit', sans-serif; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(37,99,235,0.25);
  }
  .tdm-send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.02); }
  .tdm-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .tdm-delete-btn {
    width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border-primary);
    background: transparent; color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .tdm-delete-btn:hover { background: rgba(239,68,68,0.10); color: #EF4444; border-color: rgba(239,68,68,0.2); }

  .tdm-close-btn {
    width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border-primary);
    background: var(--bg-input); color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .tdm-close-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }

  .tdm-attachment {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-primary);
    text-decoration: none; transition: background 0.15s;
  }
  .tdm-attachment:hover { background: var(--bg-card-hover); }

  .tdm-comment-avatar {
    width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg, #2563EB, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #fff;
    font-family: 'Outfit', sans-serif;
  }

  .tdm-progress-bar {
    height: 4px; border-radius: 999px;
    background: var(--bg-input);
    overflow: hidden; margin: 4px 0 8px;
    border: 1px solid var(--border-primary);
  }
  .tdm-progress-fill {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #10B981, #34D399);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ── TaskDetailModal ── */
const TaskDetailModal = ({ isOpen, onClose, taskId, onUpdated }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const T = getTokens(isLight);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [activities, setActivities] = useState([]);

  const panelRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    if (isOpen && taskId) fetchTask();
  }, [isOpen, taskId]);

  useEffect(() => {
    if (isOpen && taskId && activeTab === "activity") fetchActivity();
  }, [activeTab, isOpen, taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const d = await taskApi.getById(taskId);
      setTask(d.data);
      setTitle(d.data.title);
      setDescription(d.data.description || "");
      setStatus(d.data.status);
      setPriority(d.data.priority);
      setDueDate(d.data.dueDate ? d.data.dueDate.split("T")[0] : "");
    } catch {
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const d = await taskApi.getActivityLog(taskId);
      setActivities(d.data);
    } catch {
      /* silent */
    }
  };

  const handleSave = useCallback(
    async (overrides = {}) => {
      try {
        const payload = { title, description, status, priority, ...overrides };
        if (dueDate) payload.dueDate = dueDate;
        const u = await taskApi.update(taskId, payload);
        setTask(u.data);
        onUpdated?.(u.data);
      } catch {
        toast.error("Failed to update task");
      }
    },
    [title, description, status, priority, dueDate, taskId, onUpdated],
  );

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const d = await taskApi.addComment(taskId, commentText);
      setTask(d.data);
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      const d = await taskApi.deleteComment(taskId, id);
      setTask(d.data);
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      const d = await taskApi.addSubtask(taskId, newSubtask);
      setTask(d.data);
      setNewSubtask("");
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const handleToggleSubtask = async (id) => {
    try {
      const d = await taskApi.toggleSubtask(taskId, id);
      setTask(d.data);
    } catch {
      toast.error("Failed to toggle subtask");
    }
  };

  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const labels = [
      ...(task?.labels || []),
      { name: newLabelName, color: newLabelColor },
    ];
    try {
      const u = await taskApi.update(taskId, { labels });
      setTask(u.data);
      onUpdated?.(u.data);
      setNewLabelName("");
      setShowLabelInput(false);
    } catch {
      toast.error("Failed to add label");
    }
  };

  const handleRemoveLabel = async (i) => {
    const labels = task.labels.filter((_, idx) => idx !== i);
    try {
      const u = await taskApi.update(taskId, { labels });
      setTask(u.data);
      onUpdated?.(u.data);
    } catch {
      toast.error("Failed to remove label");
    }
  };

  const handleFileUploaded = (t) => {
    setTask(t);
    onUpdated?.(t);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task permanently?")) return;
    try {
      await taskApi.delete(taskId);
      toast.success("Task deleted");
      onUpdated?.(null);
      onClose();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const completedSubs = task?.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubs = task?.subtasks?.length ?? 0;
  const isOverdue =
    task?.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task?.status !== "done";
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;

  return (
    <>
      <style>{MODAL_CSS}</style>
      <AnimatePresence>
        {isOpen && (
          <div
            className="tdm"
            style={{
              position: "fixed",
              top: 76,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 200,
              display: "flex",
              justifyContent: "flex-end",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {/* Backdrop — extends above container to cover full viewport */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.50)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: -1,
              }}
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ x: "100%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 260,
                mass: 0.8,
              }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 560,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: T.bg,
                borderLeft: `1px solid ${T.border}`,
                borderTop: `1px solid ${T.border}`,
                borderRadius: "24px 0 0 0",
                boxShadow: T.shadow,
                overflow: "hidden",
              }}
            >
              {loading ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Loader2
                    size={28}
                    color="#3B82F6"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span style={{ color: T.muted, fontSize: 13 }}>
                    Loading task…
                  </span>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : (
                <>
                  {/* ── Sticky top bar ── */}
                  <div
                    style={{
                      flexShrink: 0,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: T.bgTop,
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      borderBottom: `1px solid ${T.border}`,
                      borderTopLeftRadius: "24px",
                      padding: "16px 22px 14px",
                    }}
                  >
                    {/* Row 1: status pills + actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Status pills */}
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          flex: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {Object.entries(STATUS_CONFIG)
                          .filter(([k]) => !k.includes("-"))
                          .map(([val, cfg]) => {
                            const active =
                              status === val ||
                              (val === "in_progress" &&
                                status === "in-progress");
                            return (
                              <button
                                key={val}
                                className="tdm-status-pill"
                                onClick={() => {
                                  setStatus(val);
                                  handleSave({ status: val });
                                }}
                                style={{
                                  background: active
                                    ? `${cfg.color}20`
                                    : "transparent",
                                  borderColor: active
                                    ? `${cfg.color}45`
                                    : "transparent",
                                  color: active ? cfg.color : T.muted,
                                }}
                              >
                                <div
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: cfg.color,
                                    boxShadow: active
                                      ? `0 0 8px ${cfg.color}`
                                      : "none",
                                  }}
                                />
                                {cfg.label}
                              </button>
                            );
                          })}
                      </div>

                      {/* Actions */}
                      <button className="tdm-delete-btn" onClick={handleDelete}>
                        <Trash2 size={15} />
                      </button>
                      <button className="tdm-close-btn" onClick={onClose}>
                        <X size={16} />
                      </button>
                    </div>

                    {/* Row 2: tabs */}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        padding: 4,
                        background: T.subtle,
                        borderRadius: 12,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      {[
                        { key: "details", label: "Details", icon: Pencil },
                        { key: "activity", label: "Activity", icon: History },
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          className={`tdm-tab-btn ${activeTab === key ? "active" : ""}`}
                          onClick={() => setActiveTab(key)}
                        >
                          <Icon size={12} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Scrollable body ── */}
                  <div
                    className="tdm-scroll"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "24px 22px 48px",
                    }}
                  >
                    {activeTab === "details" ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 20,
                        }}
                      >
                        {/* Title */}
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Task title…"
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: T.text,
                            background: "transparent",
                            border: `1px solid transparent`,
                            borderRadius: 10,
                            outline: "none",
                            padding: "4px 8px",
                            margin: "0 -8px",
                            width: "calc(100% + 16px)",
                            fontFamily: "'Syne', sans-serif",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                          onFocus={e => {
                            e.target.style.borderColor = T.borderMd;
                            e.target.style.background = T.input;
                          }}
                          onBlur={e => {
                            handleSave();
                            e.target.style.borderColor = 'transparent';
                            e.target.style.background = 'transparent';
                          }}
                        />

                        {/* Description */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <span className="tdm-section-label">
                              Description
                            </span>
                            <button
                              onClick={() => {
                                if (editingDesc) handleSave();
                                setEditingDesc((p) => !p);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: T.muted,
                                fontSize: 11,
                                fontFamily: "inherit",
                              }}
                            >
                              {editingDesc ? (
                                <>
                                  <Eye size={10} /> Preview
                                </>
                              ) : (
                                <>
                                  <Pencil size={10} /> Edit
                                </>
                              )}
                            </button>
                          </div>
                          {editingDesc ? (
                            <textarea
                              className="tdm-input"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              onBlur={() => handleSave()}
                              rows={4}
                              placeholder="Write markdown here…"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 12,
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => setEditingDesc(true)}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.03)",
                                border: `1px solid ${T.border}`,
                                minHeight: 64,
                                cursor: "text",
                                color: description ? T.text : "#2D3748",
                                fontSize: 13,
                                lineHeight: 1.6,
                                transition: "border-color 0.15s",
                              }}
                            >
                              {description ? (
                                <div style={{ color: "#94A3B8" }}>
                                  <ReactMarkdown>{description}</ReactMarkdown>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    color: "#2D3748",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Click to add a description…
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Meta card */}
                        <div
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 14,
                            padding: "4px 0",
                          }}
                        >
                          {/* Priority */}
                          <div
                            style={{
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              borderBottom: `1px solid ${T.border}`,
                            }}
                          >
                            <Flag
                              size={13}
                              color={T.muted}
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              className="tdm-section-label"
                              style={{ width: 72 }}
                            >
                              Priority
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              {Object.entries(PRIORITY_CONFIG).map(
                                ([k, cfg]) => (
                                  <button
                                    key={k}
                                    className="tdm-priority-btn"
                                    onClick={() => {
                                      setPriority(k);
                                      handleSave({ priority: k });
                                    }}
                                    style={{
                                      color:
                                        priority === k ? cfg.color : T.muted,
                                      background:
                                        priority === k ? cfg.bg : "transparent",
                                      borderColor:
                                        priority === k
                                          ? cfg.border
                                          : "rgba(255,255,255,0.07)",
                                    }}
                                  >
                                    {cfg.label}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Due date */}
                          <div
                            style={{
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              borderBottom: `1px solid ${T.border}`,
                            }}
                          >
                            <Calendar
                              size={13}
                              color={isOverdue ? "#EF4444" : T.muted}
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              className="tdm-section-label"
                              style={{ width: 72 }}
                            >
                              Due Date
                            </span>
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => {
                                setDueDate(e.target.value);
                                setTimeout(
                                  () => handleSave({ dueDate: e.target.value }),
                                  100,
                                );
                              }}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                padding: "4px 10px",
                                fontSize: 12,
                                color: isOverdue ? "#EF4444" : T.text,
                                outline: "none",
                                fontFamily: "inherit",
                                cursor: "pointer",
                              }}
                            />
                            {isOverdue && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#EF4444",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                OVERDUE
                              </span>
                            )}
                          </div>

                          {/* Created */}
                          <div
                            style={{
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Clock
                              size={13}
                              color={T.muted}
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              className="tdm-section-label"
                              style={{ width: 72 }}
                            >
                              Created
                            </span>
                            <span style={{ fontSize: 12, color: T.muted }}>
                              {new Date(task?.createdAt).toLocaleDateString()}
                              {task?.createdBy?.name &&
                                ` · ${task.createdBy.name}`}
                            </span>
                          </div>
                        </div>

                        {/* Labels */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <Tag size={13} color={T.muted} />
                              <span className="tdm-section-label">Labels</span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              marginBottom: showLabelInput ? 10 : 0,
                            }}
                          >
                            {task?.labels?.map((lbl, i) => (
                              <span
                                key={i}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: `${lbl.color}18`,
                                  color: lbl.color,
                                  border: `1px solid ${lbl.color}35`,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {lbl.name}
                                <button
                                  onClick={() => handleRemoveLabel(i)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "inherit",
                                    padding: 0,
                                    display: "flex",
                                    lineHeight: 1,
                                  }}
                                >
                                  <X size={9} />
                                </button>
                              </span>
                            ))}
                            <button
                              onClick={() => setShowLabelInput((p) => !p)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: "transparent",
                                border: `1px dashed ${T.border}`,
                                fontSize: 11,
                                fontWeight: 600,
                                color: T.muted,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                fontFamily: "inherit",
                              }}
                            >
                              <Plus size={10} /> Add label
                            </button>
                          </div>
                          {showLabelInput && (
                            <form
                              onSubmit={handleAddLabel}
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="text"
                                value={newLabelName}
                                onChange={(e) =>
                                  setNewLabelName(e.target.value)
                                }
                                placeholder="Label name"
                                className="tdm-input"
                                style={{ flex: 1 }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: 5,
                                  flexShrink: 0,
                                }}
                              >
                                {LABEL_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setNewLabelColor(c)}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: "50%",
                                      background: c,
                                      border:
                                        newLabelColor === c
                                          ? "2px solid #fff"
                                          : "2px solid transparent",
                                      cursor: "pointer",
                                      transform:
                                        newLabelColor === c
                                          ? "scale(1.2)"
                                          : "scale(1)",
                                      transition: "transform 0.1s",
                                    }}
                                  />
                                ))}
                              </div>
                              <button
                                type="submit"
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "rgba(59,130,246,0.2)",
                                  color: "#60A5FA",
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                Add
                              </button>
                            </form>
                          )}
                        </div>

                        {/* Subtasks */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <CheckCircle2 size={13} color={T.muted} />
                              <span className="tdm-section-label">
                                Subtasks
                              </span>
                              {totalSubs > 0 && (
                                <span style={{ fontSize: 11, color: T.muted }}>
                                  {completedSubs}/{totalSubs}
                                </span>
                              )}
                            </div>
                          </div>
                          {totalSubs > 0 && (
                            <div className="tdm-progress-bar">
                              <div
                                className="tdm-progress-fill"
                                style={{
                                  width: `${(completedSubs / totalSubs) * 100}%`,
                                }}
                              />
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {task?.subtasks?.map((sub) => (
                              <button
                                key={sub._id}
                                className="tdm-row-btn"
                                onClick={() => handleToggleSubtask(sub._id)}
                              >
                                {sub.completed ? (
                                  <CheckCircle2
                                    size={15}
                                    color="#10B981"
                                    style={{ flexShrink: 0 }}
                                  />
                                ) : (
                                  <Circle
                                    size={15}
                                    color="#334155"
                                    style={{ flexShrink: 0 }}
                                  />
                                )}
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: sub.completed ? T.muted : T.text,
                                    textDecoration: sub.completed
                                      ? "line-through"
                                      : "none",
                                  }}
                                >
                                  {sub.title}
                                </span>
                              </button>
                            ))}
                          </div>
                          <form
                            onSubmit={handleAddSubtask}
                            style={{ display: "flex", gap: 8, marginTop: 6 }}
                          >
                            <input
                              type="text"
                              value={newSubtask}
                              onChange={(e) => setNewSubtask(e.target.value)}
                              placeholder="Add a subtask…"
                              className="tdm-input"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="submit"
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: "rgba(255,255,255,0.06)",
                                color: T.muted,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Plus size={15} />
                            </button>
                          </form>
                        </div>

                        {/* Attachments */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 10,
                            }}
                          >
                            <Paperclip size={13} color={T.muted} />
                            <span className="tdm-section-label">
                              Attachments
                            </span>
                            {task?.attachments?.length > 0 && (
                              <span style={{ fontSize: 11, color: T.muted }}>
                                {task.attachments.length}
                              </span>
                            )}
                          </div>
                          {task?.attachments?.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                marginBottom: 10,
                              }}
                            >
                              {task.attachments.map((att, i) => (
                                <a
                                  key={i}
                                  href={`${import.meta.env.VITE_API_URL?.replace("/api", "")}${att.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tdm-attachment"
                                >
                                  <Paperclip
                                    size={13}
                                    color={T.muted}
                                    style={{ flexShrink: 0 }}
                                  />
                                  <span
                                    style={{
                                      flex: 1,
                                      fontSize: 13,
                                      color: T.text,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {att.filename}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: T.muted,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {(att.size / 1024).toFixed(1)} KB
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                          <FileUploadZone
                            taskId={taskId}
                            onUploaded={handleFileUploaded}
                          />
                        </div>

                        {/* Comments */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 12,
                            }}
                          >
                            <MessageSquare size={13} color={T.muted} />
                            <span className="tdm-section-label">Comments</span>
                            {task?.comments?.length > 0 && (
                              <span style={{ fontSize: 11, color: T.muted }}>
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {/* Comment list */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                              marginBottom: 14,
                            }}
                          >
                            {task?.comments?.map((comment) => (
                              <div
                                key={comment._id}
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  position: "relative",
                                }}
                                className="comment-item"
                              >
                                <div className="tdm-comment-avatar">
                                  {comment.user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ?? "?"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: T.text,
                                      }}
                                    >
                                      {comment.user?.name ?? "Unknown"}
                                    </span>
                                    <span
                                      style={{ fontSize: 11, color: "#1E293B" }}
                                    >
                                      {new Date(
                                        comment.createdAt,
                                      ).toLocaleString()}
                                    </span>
                                    {comment.user?._id === user?._id && (
                                      <button
                                        onClick={() =>
                                          handleDeleteComment(comment._id)
                                        }
                                        style={{
                                          marginLeft: "auto",
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          color: "#334155",
                                          display: "flex",
                                          padding: 0,
                                          transition: "color 0.15s",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.color =
                                            "#EF4444")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.color =
                                            "#334155")
                                        }
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      color: "#94A3B8",
                                      lineHeight: 1.55,
                                    }}
                                  >
                                    <ReactMarkdown>
                                      {comment.text}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment form */}
                          <form
                            onSubmit={handleAddComment}
                            style={{ display: "flex", gap: 8 }}
                          >
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment…"
                              className="tdm-input"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="submit"
                              className="tdm-send-btn"
                              disabled={
                                !commentText.trim() || submittingComment
                              }
                            >
                              {submittingComment ? (
                                <Loader2
                                  size={13}
                                  style={{
                                    animation: "spin 0.9s linear infinite",
                                  }}
                                />
                              ) : (
                                <Send size={13} />
                              )}
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <ActivityTimeline activities={activities} />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskDetailModal;
