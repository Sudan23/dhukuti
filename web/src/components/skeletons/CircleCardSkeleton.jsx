/**
 * CircleCardSkeleton - Loading skeleton for circle cards on Dashboard
 */
export default function CircleCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {/* Circle name */}
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                    {/* Description */}
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                {/* Amount badge */}
                <div className="h-8 w-24 bg-slate-200 rounded-full ml-4"></div>
            </div>

            {/* Members section */}
            <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
                <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
            </div>
        </div>
    );
}
