import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Car, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const { error } = await resetPassword(email);
            if (error) throw error;
            setSent(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700/50 shadow-xl">
                        <div className="bg-blue-600 p-2.5 rounded-xl">
                            <Car className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            CarMinder
                        </h1>
                    </div>
                </div>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <div className="p-6 space-y-6">
                        {sent ? (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="bg-emerald-500/10 p-3 rounded-full">
                                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
                                <p className="text-slate-400 text-sm">
                                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                                    Please check your inbox and follow the instructions to reset your password.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline mt-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-white">Forgot Password?</h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
