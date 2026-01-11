import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { useCircleDetails } from '../hooks/useCircles';
import { getCurrentUser } from '../utils/auth';
import { MEMBER_STATUS, SUCCESS_MESSAGES } from '../constants';
import CircleDetailsSkeleton from '../components/skeletons/CircleDetailsSkeleton';
import ContributionHistory from '../components/circle/ContributionHistory';
import { ArrowLeft, UserPlus, Users, Loader2, CheckCircle, Wallet, Clock, AlertCircle, History } from 'lucide-react';

export default function CircleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { circle, loading, error, refetch } = useCircleDetails(id);

    // Add member state
    const [newMemberId, setNewMemberId] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [addError, setAddError] = useState('');

    const [processing, setProcessing] = useState(false);

    // Amount change state
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [newProposedAmount, setNewProposedAmount] = useState('');

    // Tab state
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'history'

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
            toast.success(SUCCESS_MESSAGES.MEMBER_INVITED);
            refetch();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to add member';
            setAddError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setAddingMember(false);
        }
    };

    const handleApprove = async (userId) => {
        setProcessing(true);
        try {
            await api.post(`/circles/${id}/approve/${userId}`);
            toast.success(SUCCESS_MESSAGES.MEMBER_APPROVED);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve member');
        } finally {
            setProcessing(false);
        }
    };

    const handleContribute = async () => {
        setProcessing(true);
        try {
            await api.post(`/circles/${id}/contributions`);
            toast.success(SUCCESS_MESSAGES.CONTRIBUTION_RECORDED);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to record contribution');
        } finally {
            setProcessing(false);
        }
    };

    const handleProposeAmount = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post(`/circles/${id}/propose-amount`, {
                new_amount: parseInt(newProposedAmount)
            });
            setShowProposeModal(false);
            setNewProposedAmount('');
            toast.success('Amount change proposed successfully!');
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to propose amount change');
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveAmount = async () => {
        setProcessing(true);
        try {
            await api.post(`/circles/${id}/approve-amount`);
            toast.success(SUCCESS_MESSAGES.AMOUNT_APPROVED);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve amount change');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <CircleDetailsSkeleton />;
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
                    <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{circle.name}</h1>
                            <p className="text-slate-600 mb-4">{circle.description}</p>
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 w-fit px-4 py-2 rounded-lg">
                                <Wallet className="w-5 h-5" />
                                Saving: रु {circle.amount_per_member} / member
                            </div>

                            {circle.proposed_amount > 0 && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-amber-900 mb-1">
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                                <span className="font-bold text-lg">New Saving Proposal</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm text-amber-700">Proposed Amount:</span>
                                                <span className="text-2xl font-bold text-amber-600">रु {circle.proposed_amount}</span>
                                            </div>
                                        </div>
                                        {circle.needs_amount_approval ? (
                                            <button
                                                onClick={handleApproveAmount}
                                                disabled={processing}
                                                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve Change
                                            </button>
                                        ) : (
                                            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 text-amber-600 text-xs font-bold uppercase flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Awaiting Consensus
                                            </div>
                                        )}
                                    </div>

                                    {/* Approval Progress Visualization */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-semibold text-amber-800 uppercase tracking-wider">
                                            <span>Consensus Progress</span>
                                            <span>
                                                {circle.amount_approvals?.filter(a => a.approved).length || 0} / {circle.amount_approvals?.length || 0} Approved
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-amber-100">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${((circle.amount_approvals?.filter(a => a.approved).length || 0) / (circle.amount_approvals?.length || 1)) * 100}%` }}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-xs text-amber-700 mb-3 font-medium">Member Status:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {circle.amount_approvals?.map(approval => (
                                                    <div
                                                        key={approval.user_id}
                                                        className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs font-semibold transition-colors ${approval.approved
                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                            : 'bg-white border-amber-100 text-slate-400'
                                                            }`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${approval.approved ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {approval.user_name?.charAt(0)}
                                                        </div>
                                                        {approval.user_name}
                                                        {approval.approved ? (
                                                            <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
                                                        ) : (
                                                            <Clock className="w-3 h-3 text-amber-400 ml-1" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleContribute}
                                disabled={processing || circle.members?.find(m => m.id === getCurrentUser()?.id)?.status !== MEMBER_STATUS.ACTIVE || circle.proposed_amount > 0}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                                title={circle.proposed_amount > 0 ? "Cannot deposit while amount change is pending" : ""}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Deposit Saving
                            </button>

                            {circle.creator_id === getCurrentUser()?.id && (!circle.proposed_amount || circle.proposed_amount === 0) && (
                                <button
                                    onClick={() => setShowProposeModal(true)}
                                    className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-lg transition-colors border border-indigo-100"
                                >
                                    Change Saving Amount
                                </button>
                            )}
                        </div>
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
                                                <div className={`w-8 h-8 ${member.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} rounded-full flex items-center justify-center font-bold text-xs`}>
                                                    {member.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                                                        {member.status === 'pending' && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">
                                                                <Clock className="w-3 h-3" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-xs">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {circle.pending_approvals?.includes(member.id) && (
                                                    <button
                                                        onClick={() => handleApprove(member.id)}
                                                        disabled={processing}
                                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                    {member.role === 'admin' ? 'Admin' : 'Member'}
                                                </span>
                                            </div>
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

            {/* Propose Amount Modal */}
            {showProposeModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Propose New Saving</h2>
                            <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleProposeAmount} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Monthly Saving Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">रु</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g., 2000"
                                        value={newProposedAmount}
                                        onChange={(e) => setNewProposedAmount(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 italic">
                                    This will require UNANIMOUS approval from all active members.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all active:scale-95"
                            >
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Broadcast Proposition'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
