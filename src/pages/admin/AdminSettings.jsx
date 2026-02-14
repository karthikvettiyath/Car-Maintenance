import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, LogOut } from 'lucide-react';

const AdminSettings = () => {
    const { user, signOut } = useAuth();
    const [notifications, setNotifications] = useState({
        newUserAlerts: true,
        serviceAlerts: false,
        systemAlerts: true,
    });

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-6 h-6 text-red-400" />
                        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
                    </div>
                    <p className="text-slate-400">Manage admin preferences and system configuration</p>
                </div>

                {/* Admin Account */}
                <Card className="border-slate-700/50">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-400" />
                            Admin Account
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Email</p>
                                    <p className="text-sm text-slate-400">{user?.email || 'N/A'}</p>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    admin
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notification Preferences */}
                <Card className="border-slate-700/50">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                        <div className="space-y-3">
                            {[
                                { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Get notified when new users register' },
                                { key: 'serviceAlerts', label: 'Service Activity Alerts', desc: 'Get notified on service logging activity' },
                                { key: 'systemAlerts', label: 'System Alerts', desc: 'Get notified about system events and errors' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div>
                                        <p className="text-sm font-medium text-slate-300">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                                            notifications[item.key] ? 'bg-red-500' : 'bg-slate-600'
                                        } relative`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                                            notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Sign Out */}
                <Card className="border-red-500/20">
                    <div className="p-6">
                        <Button
                            onClick={handleSignOut}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
