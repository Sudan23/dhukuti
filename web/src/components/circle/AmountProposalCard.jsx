import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * AmountProposalCard - Shows proposed amount change with approval UI
 */
export default function AmountProposalCard({
    circle,
    onApprove,
    processing
}) {
    if (!circle.proposed_amount || circle.proposed_amount === 0) {
        return null;
    }

    // Calculate approval progress
    const totalMembers = circle.members?.filter(m => m.status === 'active').length || 0;
    const approvedCount = circle.amount_approvals?.filter(a => a.approved).length || 0;
    const approvalPercentage = totalMembers > 0 ? (approvedCount / totalMembers) * 100 : 0;

    return (
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
                        onClick={onApprove}
                        disabled={processing}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Approve Change
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-4 py-2 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Waiting for others</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-amber-700">
                    <span>Approval Progress</span>
                    <span className="font-semibold">{approvedCount} / {totalMembers} members</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${approvalPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
