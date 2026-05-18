import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react';
import { taskApi } from '../../services/taskApi';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

const S = {
    container: {
        marginTop: '64px',
        paddingTop: '32px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: '32px'
    },
    headerRow: {
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '16px'
    },
    title: {
        fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: 0,
        fontFamily: "'Syne', sans-serif",
    },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'
    },
    statCard: {
        background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
    },
    statTop: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    statTitle: {
        fontSize: '13px', color: 'rgba(160,170,200,0.65)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    statNum: {
        fontSize: '32px', fontWeight: 700, color: '#F0F4FF', margin: 0,
        fontFamily: "'Syne', sans-serif", lineHeight: 1
    },
    chartsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px',
        marginTop: '16px'
    },
    chartCard: {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px', padding: '24px', height: '320px',
        display: 'flex', flexDirection: 'column'
    },
    chartTitle: {
        fontSize: '16px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 20px'
    },
    taskList: {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px', padding: '24px', marginTop: '16px'
    },
    taskItem: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
        marginBottom: '12px'
    },
    taskLeft: {
        display: 'flex', alignItems: 'center', gap: '16px'
    },
    taskProject: {
        fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.1)', color: '#F0F4FF', fontWeight: 600
    },
    taskName: {
        fontSize: '15px', fontWeight: 500, color: '#F0F4FF'
    },
    taskRight: {
        display: 'flex', alignItems: 'center', gap: '16px'
    },
    taskDate: {
        fontSize: '13px', color: 'rgba(160,170,200,0.6)'
    }
};

const STATUS_COLORS = {
    'todo': '#0EA5E9',
    'in_progress': '#F59E0B',
    'review': '#8B5CF6',
    'done': '#10B981',
    'backlog': '#6B7280'
};

const PRIORITY_COLORS = {
    'low': '#10B981',
    'medium': '#F59E0B',
    'high': '#F97316',
    'urgent': '#EF4444'
};

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await taskApi.getMyTasks();
                setTasks(res.data || []);
            } catch (err) {
                console.error("Failed to load user tasks");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Compute stats
    let dueToday = 0, dueThisWeek = 0, overdue = 0;
    
    const statusDataMap = { 'todo':0, 'in_progress':0, 'review':0, 'done':0, 'backlog':0 };
    const priorityDataMap = { 'low':0, 'medium':0, 'high':0, 'urgent':0 };

    tasks.forEach(t => {
        statusDataMap[t.status] = (statusDataMap[t.status] || 0) + 1;
        priorityDataMap[t.priority] = (priorityDataMap[t.priority] || 0) + 1;

        if (t.dueDate && t.status !== 'done') {
            const date = new Date(t.dueDate);
            date.setHours(0,0,0,0);
            if (date < today) overdue++;
            else if (date.getTime() === today.getTime()) dueToday++;
            else if (date < nextWeek) dueThisWeek++;
        }
    });

    const statusData = Object.entries(statusDataMap).filter(([_,v])=>v>0).map(([k,v]) => ({ name: k, value: v }));
    const priorityData = Object.entries(priorityDataMap).filter(([_,v])=>v>0).map(([k,v]) => ({ name: k, value: v }));

    const upcomingTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);

    return (
        <div style={S.container}>
            <div style={S.headerRow}>
                <Activity size={24} color="#0EA5E9" />
                <h2 style={S.title}>Your Overview</h2>
            </div>

            <div style={S.statsGrid}>
                <div style={S.statCard}>
                    <div style={S.statTop}>
                        <span style={S.statTitle}>Tasks Remaining</span>
                        <CheckCircle2 size={18} color="#0EA5E9" />
                    </div>
                    <h3 style={S.statNum}>{tasks.filter(t=>t.status!=='done').length}</h3>
                </div>
                <div style={S.statCard}>
                    <div style={S.statTop}>
                        <span style={S.statTitle}>Due Today</span>
                        <Clock size={18} color="#F59E0B" />
                    </div>
                    <h3 style={S.statNum}>{dueToday}</h3>
                </div>
                <div style={S.statCard}>
                    <div style={S.statTop}>
                        <span style={S.statTitle}>Due This Week</span>
                        <Clock size={18} color="#8B5CF6" />
                    </div>
                    <h3 style={S.statNum}>{dueThisWeek}</h3>
                </div>
                <div style={S.statCard}>
                    <div style={S.statTop}>
                        <span style={S.statTitle}>Overdue</span>
                        <AlertTriangle size={18} color="#EF4444" />
                    </div>
                    <h3 style={S.statNum}>{overdue}</h3>
                </div>
            </div>

            <div style={S.chartsGrid}>
                <div style={S.chartCard}>
                    <h4 style={S.chartTitle}>Tasks by Status</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#F0F4FF' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={S.chartCard}>
                    <h4 style={S.chartTitle}>Tasks by Priority</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {upcomingTasks.length > 0 && (
                <div style={S.taskList}>
                    <h4 style={S.chartTitle}>Upcoming Tasks</h4>
                    <div>
                        {upcomingTasks.map(t => (
                            <div key={t._id} style={S.taskItem}>
                                <div style={S.taskLeft}>
                                    <span style={{ ...S.taskProject, background: t.project?.color ? `${t.project.color}33` : 'rgba(255,255,255,0.1)', color: t.project?.color || '#F0F4FF' }}>
                                        {t.project?.name || 'Unknown'}
                                    </span>
                                    <span style={S.taskName}>{t.title}</span>
                                </div>
                                <div style={S.taskRight}>
                                    {t.dueDate && <span style={S.taskDate}>{new Date(t.dueDate).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
