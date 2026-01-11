import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, clearAuth } from '../utils/auth';

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            clearAuth();
            navigate('/login');
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200 px-8 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                    <span className="text-xl font-bold text-slate-900">Dhukuti</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-600">Hi, {user.name}</span>
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
