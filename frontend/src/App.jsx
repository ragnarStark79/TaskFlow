import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import KanbanBoard from './pages/KanbanBoard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Approvals from './pages/Approvals';
import WorkspaceManage from './pages/WorkspaceManage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SocketProvider>
                    <Router>
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)'
                                }
                            }}
                        />

                        <Routes>
                            {/* Public Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Dashboard Core wrapped in Security Layer */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<MainLayout />}>
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="workspace/:workspaceId" element={<WorkspaceView />} />
                                    <Route path="projects/:projectId" element={<KanbanBoard />} />
                                    <Route path="tasks" element={<Tasks />} />
                                    <Route path="team" element={<Team />} />
                                    <Route path="team/workspaces/:workspaceId" element={<WorkspaceManage />} />
                                    <Route path="approvals" element={<Approvals />} />
                                    <Route path="settings" element={<SettingsPage />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Router>
                </SocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
