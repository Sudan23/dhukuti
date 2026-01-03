import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, UserPlus, Users, Loader2 } from 'lucide-react';

export default function CircleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add member state
    const [newMemberId, setNewMemberId] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [addError, setAddError] = useState('');

    useEffect(() => {
        fetchCircleDetails();
    }, [id]);

    const fetchCircleDetails = async () => {
        try {
            // The API returns the list of circles, and we need to find the one we want.
            // Wait, is there a GET /circles/:id endpoint? The README didn't explicitly say so.
            // It said GET /api/v1/circles list user's circles.
            // But typically there should be one. If not, I'll filter from the list.
            // Let's assume there isn't one for now based on README "List user's circles" being the only GET.
            // Actually, if I look at the README, it doesn't list GET /circles/:id.
            // So I will fetch all circles and find the one. Efficient? No. Works? Yes.
            const response = await api.get('/circles');
            const foundCircle = response.data.find(c => c.id === parseInt(id));

            if (foundCircle) {
                setCircle(foundCircle);
            } else {
                setError('Circle not found');
            }
        } catch (err) {
            setError('Failed to load circle details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setAddingMember(true);
        setAddError('');

        try {
            await api.post(`/circles/${id}/members`, {
                user_id: parseInt(newMemberId),
                role: 'member'
            });
            setNewMemberId('');
            fetchCircleDetails(); // Refresh list
        } catch (err) {
            setAddError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !circle) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{error || 'Circle not found'}</h2>
                <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="p-8 border-b border-slate-100">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{circle.name}</h1>
                        <p className="text-slate-600">{circle.description}</p>
                    </div>

                    <div className="p-8 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Members ({circle.members?.length || 0})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Members List */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {circle.members?.map((member) => (
                                        <li key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                    {member.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                                                    <p className="text-slate-500 text-xs">{member.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                {member.id === circle.creator_id ? 'Admin' : 'Member'}
                                            </span>
                                        </li>
                                    ))}
                                    {(!circle.members || circle.members.length === 0) && (
                                        <li className="p-4 text-center text-slate-500 text-sm">No members yet.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Add Member Form */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Add Member
                                </h3>
                                {addError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs">
                                        {addError}
                                    </div>
                                )}
                                <form onSubmit={handleAddMember} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                            User ID
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                            placeholder="Enter User ID"
                                            value={newMemberId}
                                            onChange={(e) => setNewMemberId(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">
                                            Ask your friend for their User ID.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={addingMember}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center"
                                    >
                                        {addingMember ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Invite User'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
