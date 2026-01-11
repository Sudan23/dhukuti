import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCircles } from '../hooks/useCircles';
import { getCurrentUser } from '../utils/auth';
import CreateCircleModal from '../components/CreateCircleModal';
import CircleCardSkeleton from '../components/skeletons/CircleCardSkeleton';
import { Plus, Users, Wallet, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const { circles, loading, refetch } = useCircles();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);



    return (
        <div className="min-h-screen bg-slate-50">


            <main className="max-w-7xl mx-auto p-8">
                {/* Notifications */}
                {circles.some(c => c.needs_amount_approval) && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900">Pending Amount Changes</h4>
                                <p className="text-amber-700 text-sm">One or more of your circles have a proposed saving amount change waiting for your approval.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {circles.filter(c => c.needs_amount_approval).map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => navigate(`/circles/${c.id}`)}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Review {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CircleCardSkeleton key={i} />
                        ))}
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
                                    <div className="flex items-center gap-2">
                                        {circle.needs_amount_approval && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200 animate-pulse">
                                                <AlertCircle className="w-3 h-3" />
                                                Action Required
                                            </span>
                                        )}
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                            {circle.members?.length || 1} members
                                        </span>
                                    </div>
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
                onSuccess={refetch}
            />
        </div>
    );
}
