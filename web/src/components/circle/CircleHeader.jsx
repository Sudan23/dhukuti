import { Wallet } from 'lucide-react';

/**
 * CircleHeader - Displays circle name, description, and current amount
 */
export default function CircleHeader({ circle }) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-slate-100">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{circle.name}</h1>
                <p className="text-slate-600 mb-4">{circle.description}</p>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 w-fit px-4 py-2 rounded-lg">
                    <Wallet className="w-5 h-5" />
                    Saving: रु {circle.amount_per_member} / member
                </div>
            </div>
        </div>
    );
}
