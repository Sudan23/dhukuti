import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Password reset link sent to your email');

            // For development: show the token
            if (response.data.token) {
                console.log('Reset token (DEV ONLY):', response.data.token);
                toast.info(`Reset token: ${response.data.token}`, { duration: 10000 });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
                        Check Your Email
                    </h1>

                    <p className="text-slate-600 text-center mb-6">
                        If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                    </p>

                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="block w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-center"
                        >
                            Return to Login
                        </Link>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="block w-full px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Try Another Email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <Link
                    to="/login"
                    className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                    <Mail className="w-8 h-8 text-indigo-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                    Forgot Password?
                </h1>

                <p className="text-slate-600 text-center mb-8">
                    No worries! Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="w-5 h-5" />
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Remember your password?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
