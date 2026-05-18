import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex bg-[#0A0D14] items-center justify-center text-blue-500">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Pass rendering control down to the attached child elements
    return <Outlet />;
};

export default ProtectedRoute;
