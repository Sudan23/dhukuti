import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CreateCircleModal from '../components/CreateCircleModal';
import { Plus, Users, Wallet } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [circles, setCircles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.id) {
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchCircles();
    }, [navigate]);

    const fetchCircles = async () => {
        try {
            const response = await api.get('/circles');
            setCircles(response.data || []);
        } catch (err) {
            console.error('Failed to fetch circles', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
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

            <main className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Your Circles</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Circle
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : circles.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No circles yet</h3>
                        <p className="text-slate-500 mb-6">Create a circle to start sharing money with friends and family.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Create your first circle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {circles.map((circle) => (
                            <div
                                key={circle.id}
                                onClick={() => navigate(`/circles/${circle.id}`)}
                                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                        {circle.members?.length || 1} members
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{circle.name}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                    {circle.description || 'No description provided.'}
                                </p>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Created by {circle.creator_id === user.id ? 'You' : 'Someone else'}</span>
                                    <span className="text-indigo-600 font-medium group-hover:underline">View Details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <CreateCircleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCircles}
            />
        </div>
    );
}
