import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Car, Mail, Lock, Loader2, User } from 'lucide-react';

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            const { data, error } = await signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });
            if (error) throw error;

            // Check if email confirmation is required
            // When confirmation is needed, data.session will be null
            if (!data?.session) {
                setSuccessMessage('Account created! Please check your email to confirm your account before signing in.');
                return;
            }

            // Auto-confirmed signup — redirect based on role
            if (role === 'dealer') {
                navigate('/dealer');
            } else if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/vehicles/new');
            }
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
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white">Create Account</h2>
                            <p className="text-slate-400 text-sm mt-1">Start tracking your vehicle maintenance today</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg text-center">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

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


                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Account Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'user', label: 'Car Owner', icon: '🚗' },
                                        { value: 'dealer', label: 'Dealer', icon: '🔧' },
                                        { value: 'admin', label: 'Admin', icon: '⚙️' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setRole(option.value)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-sm font-medium ${role === option.value
                                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            <span className="text-lg">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Confirm your password"
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
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="text-center pt-2">
                            <p className="text-slate-400 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div >
        </div >
    );
};

export default SignUp;
