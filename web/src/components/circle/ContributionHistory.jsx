import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Calendar, User, Wallet, TrendingUp } from 'lucide-react';

/**
 * ContributionHistory - Displays contribution history for a circle
 */
export default function ContributionHistory({ circleId }) {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        memberCount: 0,
    });

    useEffect(() => {
        fetchContributions();
    }, [circleId]);

    const fetchContributions = async () => {
        try {
            const response = await api.get(`/circles/${circleId}/contributions`);
            const data = response.data || [];
            setContributions(data);

            // Calculate stats
            const total = data.reduce((sum, c) => sum + c.amount, 0);
            const thisMonth = data.filter(c => {
                const contribDate = new Date(c.month);
                const now = new Date();
                return contribDate.getMonth() === now.getMonth() &&
                    contribDate.getFullYear() === now.getFullYear();
            }).reduce((sum, c) => sum + c.amount, 0);

            const uniqueMembers = new Set(data.map(c => c.user_id)).size;

            setStats({ total, thisMonth, memberCount: uniqueMembers });
        } catch (err) {
            toast.error('Failed to load contribution history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatMonth = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-indigo-900">Total Saved</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">रु {stats.total.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-900">This Month</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">रु {stats.thisMonth.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-purple-900">Contributors</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{stats.memberCount}</p>
                </div>
            </div>

            {/* Contributions List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Contribution History
                    </h3>
                </div>

                {contributions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No contributions yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {contributions.map((contribution) => (
                            <div
                                key={contribution.id}
                                className="p-6 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{contribution.user_name}</p>
                                            <p className="text-sm text-slate-500">{contribution.user_email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-500">
                                                    {formatMonth(contribution.month)} • {formatDate(contribution.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-indigo-600">
                                            रु {contribution.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
