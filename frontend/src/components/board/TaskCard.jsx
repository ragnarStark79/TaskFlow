import React, { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Zap, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import gsap from "gsap";

const PRIORITY_CONFIG = {
  urgent: {
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.2)",
    glow: "rgba(239, 68, 68, 0.3)",
    label: "Urgent",
    icon: "🔴",
  },
  high: {
    color: "#F97316",
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.2)",
    glow: "rgba(249, 115, 22, 0.3)",
    label: "High",
    icon: "🟠",
  },
  medium: {
    color: "#EAB308",
    bg: "rgba(234, 179, 8, 0.08)",
    border: "rgba(234, 179, 8, 0.2)",
    glow: "rgba(234, 179, 8, 0.3)",
    label: "Medium",
    icon: "🟡",
  },
  low: {
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.08)",
    border: "rgba(34, 197, 94, 0.2)",
    glow: "rgba(34, 197, 94, 0.3)",
    label: "Low",
    icon: "🟢",
  },
};

const TaskCard = ({ task, onClick, isDragging: parentIsDragging }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const priorityConfig =
    PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isCardDragging = isDragging || parentIsDragging;

  // GSAP entry animation
  useEffect(() => {
    if (!cardRef.current || isCardDragging) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
    );
  }, [isCardDragging]);

  const handleClick = (e) => {
    if (!isDragging && onClick) {
      onClick(task);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -4,
        boxShadow: `0 16px 48px ${priorityConfig.glow}, 0 0 0 1px ${priorityConfig.color}15`,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: 'var(--shadow-card)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200`}
        style={{
          background: 'var(--bg-card)',
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "14px",
          border: '1px solid var(--border-primary)',
          padding: "16px",
          boxShadow: 'var(--shadow-card)',
          opacity: isCardDragging ? 0.5 : 1,
          scale: isCardDragging ? 1.05 : 1,
          zIndex: isCardDragging ? 50 : "auto",
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${priorityConfig.color}00, ${priorityConfig.color}, ${priorityConfig.color}00)`,
            opacity: isHovered ? 1 : 0.4,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Animated gradient overlay on hover */}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${priorityConfig.color}05 0%, transparent 50%)`,
              borderRadius: "14px",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Content */}
        <div ref={contentRef} style={{ position: "relative", zIndex: 2 }}>
          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {task.labels.map((label, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    backgroundColor: label.color + "20",
                    color: label.color,
                    border: `1px solid ${label.color}40`,
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = label.color + "30";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = label.color + "20";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: 'var(--text-primary)',
              margin: "0 0 8px 0",
              lineHeight: "1.4",
              transition: "color 0.3s ease",
            }}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p
              style={{
                fontSize: "12px",
                color: 'var(--text-secondary)',
                margin: "0 0 12px 0",
                lineHeight: "1.5",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                transition: "color 0.3s ease",
              }}
            >
              {task.description}
            </p>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: `linear-gradient(90deg, var(--border-secondary), ${priorityConfig.color}30, var(--border-secondary))`,
              margin: "12px 0",
              transition: "all 0.3s ease",
              opacity: isHovered ? 1 : 0.5,
            }}
          />

          {/* Footer section */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Priority badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "600",
                backgroundColor: priorityConfig.bg,
                color: priorityConfig.color,
                border: `1px solid ${priorityConfig.border}`,
                backdropFilter: "blur(4px)",
                width: "fit-content",
                transition: "all 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  priorityConfig.bg.replace("0.08", "0.12");
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = priorityConfig.bg;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Zap size={11} strokeWidth={2.5} />
              {priorityConfig.label}
            </div>

            {/* Metadata row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: 'var(--text-tertiary)',
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {/* Due date */}
                {task.dueDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#60A5FA")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6B7280")
                    }
                  >
                    <Calendar size={12} strokeWidth={1.8} />
                    {format(new Date(task.dueDate), "MMM d")}
                  </div>
                )}

                {/* Comments count */}
                {task.comments && task.comments.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#60A5FA")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6B7280")
                    }
                  >
                    <MessageSquare size={12} strokeWidth={1.8} />
                    {task.comments.length}
                  </div>
                )}
              </div>

              {/* Assignees */}
              {task.assignees && task.assignees.length > 0 && (
                <div style={{ display: "flex", marginRight: "-6px" }}>
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <div
                      key={assignee._id}
                      title={assignee.name}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${priorityConfig.color}, ${priorityConfig.color}dd)`,
                        border: "1.5px solid rgba(15, 23, 42, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        fontWeight: "700",
                        color: "#FFF",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        marginRight: "-6px",
                      }}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.2,
                          zIndex: 10,
                          duration: 0.2,
                          ease: "power2.out",
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          zIndex: "auto",
                          duration: 0.2,
                          ease: "power2.out",
                        });
                      }}
                    >
                      {assignee.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div
                      title={`+${task.assignees.length - 3} more`}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1.5px solid rgba(255, 255, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        fontWeight: "700",
                        color: "#9CA3AF",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.2,
                          zIndex: 10,
                          duration: 0.2,
                          ease: "power2.out",
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          zIndex: "auto",
                          duration: 0.2,
                          ease: "power2.out",
                        });
                      }}
                    >
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
