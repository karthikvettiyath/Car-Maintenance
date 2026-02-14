import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { Users, Car, ClipboardList, Shield, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, vehicles: 0, services: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        if (!supabase) return;
        try {
            const [usersRes, vehiclesRes, servicesRes, recentRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('vehicles').select('*', { count: 'exact', head: true }),
                supabase.from('services').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
            ]);

            setStats({
                users: usersRes.count || 0,
                vehicles: vehiclesRes.count || 0,
                services: servicesRes.count || 0,
            });

            setRecentUsers(recentRes.data || []);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: 'blue' },
        { label: 'Total Vehicles', value: stats.vehicles, icon: Car, color: 'emerald' },
        { label: 'Total Services', value: stats.services, icon: ClipboardList, color: 'violet' },
    ];

    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    };

    const iconBgMap = {
        blue: 'bg-blue-500/20',
        emerald: 'bg-emerald-500/20',
        violet: 'bg-violet-500/20',
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-red-400" />
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-slate-400">Overview of platform activity and statistics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat) => (
                        <Card key={stat.label} className={`border ${colorMap[stat.color]}`}>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${iconBgMap[stat.color]}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Recent Users */}
                <Card className="border-slate-700/50">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
                        {recentUsers.length === 0 ? (
                            <p className="text-slate-400 text-sm">No users found. Make sure the profiles table is set up.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentUsers.map((profile) => (
                                    <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                                {(profile.email || '?')[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{profile.full_name || profile.email || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400">{profile.email}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            profile.role === 'admin'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {profile.role || 'user'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
