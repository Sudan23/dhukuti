/**
 * CircleDetailsSkeleton - Loading skeleton for circle details page
 */
export default function CircleDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 animate-pulse">
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <div className="h-10 w-32 bg-slate-200 rounded-lg mb-6"></div>

                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            {/* Circle name */}
                            <div className="h-8 bg-slate-200 rounded w-1/2 mb-3"></div>
                            {/* Description */}
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        </div>
                        {/* Amount badge */}
                        <div className="h-12 w-32 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Members */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Members Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>

                            {/* Member items */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-slate-200 rounded w-48"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                                </div>
                            ))}
                        </div>

                        {/* Add Member Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
                            <div className="flex gap-3">
                                <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
                                <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="h-6 bg-slate-200 rounded w-24 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-slate-200 rounded-xl"></div>
                                <div className="h-10 bg-slate-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
