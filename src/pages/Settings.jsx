import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Database, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input type="email" defaultValue={user?.email} disabled className="w-full bg-dark/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="pt-2">
                            <Button onClick={handleSignOut} variant="danger" size="sm" className="w-full">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-secondary" />
                        Notifications
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div>
                                <p className="text-white font-medium">Email Alerts</p>
                                <p className="text-sm text-slate-400">Receive reminders via email</p>
                            </div>
                            <div className="w-10 h-6 rounded-full bg-secondary relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div>
                                <p className="text-white font-medium">Push Notifications</p>
                                <p className="text-sm text-slate-400">Browser alerts</p>
                            </div>
                            <div className="w-10 h-6 rounded-full bg-slate-600 relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
