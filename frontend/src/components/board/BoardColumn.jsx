import React, { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import gsap from 'gsap';

const COLUMN_COLORS = {
    backlog:     { from: '#9CA3AF', to: '#6B7280', shadow: 'rgba(156,163,175,0.2)' },
    todo:        { from: '#38B6FF', to: '#1B6FE8', shadow: 'rgba(56,182,255,0.25)' },
    in_progress: { from: '#FCD34D', to: '#F59E0B', shadow: 'rgba(252,211,77,0.25)' },
    review:      { from: '#A78BFA', to: '#7B3FE4', shadow: 'rgba(167,139,250,0.25)' },
    done:        { from: '#34D399', to: '#10B981', shadow: 'rgba(52,211,153,0.25)' },
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
            className="flex flex-col w-80 flex-shrink-0 relative overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '24px',
                boxShadow: `0 12px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
        >
            {/* Top gradient accent line */}
            <div 
                className="absolute top-0 left-0 right-0 h-1" 
                style={{ background: `linear-gradient(90deg, ${colorConfig.from}, ${colorConfig.to})` }} 
            />

            {/* Subtle ambient glow behind the header */}
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colorConfig.shadow} 0%, transparent 70%)`, filter: 'blur(20px)' }}
            />

            {/* Column Header */}
            <div className="px-5 py-4 flex items-center justify-between relative z-10 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ background: colorConfig.from, boxShadow: `0 0 8px ${colorConfig.from}` }} 
                    />
                    <h3 className="text-sm font-bold text-gray-100 tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {column.name}
                    </h3>
                    <span className="text-[11px] bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full font-bold">
                        {tasks.length}
                    </span>
                </div>
                <button 
                    onClick={() => onAddTask(column.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Task List (Droppable + Sortable Zone) */}
            <div
                ref={setNodeRef}
                className="flex-1 px-3 pt-4 pb-4 space-y-3 overflow-y-auto min-h-[250px] transition-colors relative z-10"
                style={{
                    backgroundColor: isOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                    boxShadow: isOver ? `inset 0 0 0 1px ${colorConfig.shadow}` : 'none'
                }}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 border border-dashed border-white/10 rounded-xl text-gray-600 text-sm font-medium">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardColumn;
