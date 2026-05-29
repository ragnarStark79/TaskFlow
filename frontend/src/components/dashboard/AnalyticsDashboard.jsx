import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, Activity, Inbox } from 'lucide-react';
import { taskApi } from '../../services/taskApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const STATUS_COLORS = {
  todo: '#0EA5E9',
  in_progress: '#F59E0B',
  review: '#8B5CF6',
  done: '#10B981',
  backlog: '#6B7280',
};
const STATUS_LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  backlog: 'Backlog',
};
const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  urgent: '#EF4444',
};

const EmptyChart = ({ label, isLight }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    color: isLight ? '#9CA3AF' : 'rgba(160,170,200,0.45)',
  }}>
    <Inbox size={28} strokeWidth={1.5} />
    <span style={{ fontSize: 13 }}>No {label} data yet</span>
  </div>
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskApi.getMyTasks();
        setTasks(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load user tasks', err);
        setError('Could not load tasks.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  /* Theme-aware chart colors */
  const axisColor = isLight ? '#9CA3AF' : 'rgba(160,170,200,0.4)';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const tooltipBg = isLight ? '#FFFFFF' : '#0F172A';
  const tooltipBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const tooltipText = isLight ? '#1A1A2E' : '#F0F4FF';
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-primary)',
    borderRadius: 20,
    padding: 24,
    boxShadow: 'var(--shadow-card)',
  };

  if (loading) return (
    <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ ...cardStyle, height: 100, opacity: 0.5 }} />
        ))}
      </div>
    </div>
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  let dueToday = 0, dueThisWeek = 0, overdue = 0;
  const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0, backlog: 0 };
  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };

  tasks.forEach(t => {
    if (statusMap[t.status] !== undefined) statusMap[t.status]++;
    if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
    if (t.dueDate && t.status !== 'done') {
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      if (d < today) overdue++;
      else if (d.getTime() === today.getTime()) dueToday++;
      else if (d < nextWeek) dueThisWeek++;
    }
  });

  const statusData = Object.entries(statusMap)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] || k, key: k, value: v }));

  const priorityData = Object.entries(priorityMap)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), key: k, value: v }));

  const upcomingTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const remaining = tasks.filter(t => t.status !== 'done').length;

  const stats = [
    { label: 'Tasks Remaining', value: remaining, icon: <CheckCircle2 size={18} color="#0EA5E9" /> },
    { label: 'Due Today', value: dueToday, icon: <Clock size={18} color="#F59E0B" /> },
    { label: 'Due This Week', value: dueThisWeek, icon: <Clock size={18} color="#8B5CF6" /> },
    { label: 'Overdue', value: overdue, icon: <AlertTriangle size={18} color="#EF4444" /> },
  ];

  return (
    <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Activity size={22} color="#0EA5E9" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: "'Syne', sans-serif" }}>
          Your Overview
        </h2>
        {error && <span style={{ fontSize: 12, color: 'var(--text-danger)', marginLeft: 8 }}>{error}</span>}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </span>
              {s.icon}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Tasks by Status */}
        <div style={{ ...cardStyle, height: 300, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Tasks by Status</h4>
          {statusData.length === 0 ? (
            <EmptyChart label="status" isLight={isLight} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: tooltipText, fontSize: 13 }}
                  labelStyle={{ color: tooltipText }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: axisColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tasks by Priority */}
        <div style={{ ...cardStyle, height: 300, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Tasks by Priority</h4>
          {priorityData.length === 0 ? (
            <EmptyChart label="priority" isLight={isLight} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12 }}
                  itemStyle={{ color: tooltipText, fontSize: 13 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Upcoming tasks list */}
      {upcomingTasks.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Upcoming Tasks</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingTasks.map(t => (
              <div key={t._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6,
                    background: t.project?.color ? `${t.project.color}22` : 'var(--bg-input)',
                    color: t.project?.color || 'var(--text-muted)',
                    fontWeight: 600, border: `1px solid ${t.project?.color ? `${t.project.color}44` : 'var(--border-primary)'}`,
                  }}>
                    {t.project?.name || 'No project'}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                </div>
                {t.dueDate && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
