import { UserPlus, Loader2 } from 'lucide-react';

/**
 * AddMemberForm - Form to invite new members to the circle
 */
export default function AddMemberForm({
    newMemberId,
    setNewMemberId,
    onSubmit,
    addingMember,
    error
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Invite Member
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        User ID
                    </label>
                    <input
                        type="number"
                        value={newMemberId}
                        onChange={(e) => setNewMemberId(e.target.value)}
                        placeholder="Enter user ID"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={addingMember}
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={addingMember}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {addingMember ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Inviting...
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Invite Member
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
