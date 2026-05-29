import React, { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import gsap from 'gsap';

const COLUMN_COLORS = {
    backlog:     { from: '#9CA3AF', to: '#6B7280', shadow: 'rgba(156,163,175,0.15)' },
    todo:        { from: '#38B6FF', to: '#1B6FE8', shadow: 'rgba(56,182,255,0.18)' },
    in_progress: { from: '#FCD34D', to: '#F59E0B', shadow: 'rgba(252,211,77,0.18)' },
    review:      { from: '#A78BFA', to: '#7B3FE4', shadow: 'rgba(167,139,250,0.18)' },
    done:        { from: '#34D399', to: '#10B981', shadow: 'rgba(52,211,153,0.18)' },
};

const BoardColumn = ({ column, tasks, onAddTask, onTaskClick, index }) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    const taskIds = tasks.map(t => t._id);
    const colRef = useRef(null);

    const colorConfig = COLUMN_COLORS[column.id] || COLUMN_COLORS.backlog;

    useEffect(() => {
        if (colRef.current) {
            gsap.fromTo(colRef.current,
                { opacity: 0, y: 30, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)', delay: (index || 0) * 0.1 }
            );
        }
    }, [index]);

    return (
        <div
            ref={colRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: 300,
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 20,
                boxShadow: 'var(--shadow-card)',
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}
        >
            {/* Subtle ambient glow behind header */}
            <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 160, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${colorConfig.shadow} 0%, transparent 70%)`,
                filter: 'blur(16px)',
                pointerEvents: 'none',
            }} />

            {/* Column Header */}
            <div style={{
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', zIndex: 10,
                borderBottom: '1px solid var(--border-secondary)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                        background: colorConfig.from,
                        boxShadow: `0 0 6px ${colorConfig.from}`,
                    }} />
                    <h3 style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--text-primary)',
                        fontFamily: "'Syne', sans-serif",
                        margin: 0,
                    }}>
                        {column.name}
                    </h3>
                    <span style={{
                        fontSize: 11, fontWeight: 700,
                        padding: '1px 8px', borderRadius: 999,
                        background: 'var(--bg-input)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-primary)',
                    }}>
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => onAddTask(column.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    style={{
                        width: 28, height: 28, borderRadius: 8,
                        border: '1px solid var(--border-primary)',
                        background: 'transparent',
                        color: 'var(--text-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Task List — Droppable + Sortable */}
            <div
                ref={setNodeRef}
                style={{
                    flex: 1,
                    padding: '12px 10px 14px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                    overflowY: 'auto',
                    minHeight: 200,
                    position: 'relative', zIndex: 10,
                    backgroundColor: isOver ? 'var(--bg-input)' : 'transparent',
                    boxShadow: isOver ? `inset 0 0 0 2px ${colorConfig.from}40` : 'none',
                    transition: 'background 0.15s, box-shadow 0.15s',
                }}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: 80,
                        border: '1px dashed var(--border-primary)',
                        borderRadius: 14,
                        color: 'var(--text-tertiary)',
                        fontSize: 12,
                        fontWeight: 500,
                    }}>
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardColumn;
