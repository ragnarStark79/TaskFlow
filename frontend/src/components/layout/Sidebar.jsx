import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/tasks', name: 'Tasks', icon: CheckSquare },
        { path: '/team', name: 'Team', icon: Users },
        { path: '/settings', name: 'Settings', icon: Settings },
    ];

    return (
        <motion.aside 
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            className="w-64 h-full hidden md:flex flex-col bg-white/10 dark:bg-gray-900/40 backdrop-blur-md border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">Nexus</h1>
                
                {/* Active Workspace Selector Skeleton */}
                <button className="w-full mt-4 flex items-center justify-between bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-3 transition-colors text-left group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex flex-shrink-0 items-center justify-center font-bold text-white shadow-sm">
                            N
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Workspace</span>
                            <span className="text-sm text-gray-200 font-semibold truncate group-hover:text-blue-400 transition-colors">NexusHQ</span>
                        </div>
                    </div>
                </button>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out font-medium ${
                                isActive 
                                ? 'bg-blue-500/20 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
