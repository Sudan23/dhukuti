import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Hash, Copy, Check, ArrowLeft } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.id) {
            navigate('/login');
            return;
        }
        setUser(userData);
    }, [navigate]);

    const copyUserId = () => {
        navigator.clipboard.writeText(user.id?.toString() || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            <nav className="bg-white border-b border-slate-200 px-8 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                        <span className="text-xl font-bold text-slate-900">Dhukuti</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-8">
                <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                                <User className="w-12 h-12" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                                <p className="text-indigo-100 text-lg">Your Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-6">
                        {/* User ID Card - Most Important */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash className="w-5 h-5 text-indigo-600" />
                                        <h2 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Your User ID</h2>
                                    </div>
                                    <p className="text-4xl font-bold text-indigo-600 mb-2">{user.id}</p>
                                    <p className="text-sm text-slate-600">
                                        Share this ID with others so they can add you to their circles
                                    </p>
                                </div>
                                <button
                                    onClick={copyUserId}
                                    className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy ID
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">Account Information</h2>

                            <div className="bg-slate-50 rounded-xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <User className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 font-medium">Full Name</p>
                                    <p className="text-lg font-semibold text-slate-900">{user.name}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 font-medium">Email Address</p>
                                    <p className="text-lg font-semibold text-slate-900">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Help Text */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                How to invite others
                            </h3>
                            <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                                <li>Share your User ID with the person you want to invite</li>
                                <li>They need to create an account and share their User ID with you</li>
                                <li>Go to your circle and use their User ID to add them as a member</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
