import { useState, useEffect } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PenTool, Search, Calendar, User, Truck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DealerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ servicesToday: 0, totalServices: 0 });
    const [recentServices, setRecentServices] = useState([]);

    useEffect(() => {
        // Fetch stats - In a real app we'd filter by 'created_by' but current schema uses user_id as owner.
        // We'll just show all services for now or filtering if we add a 'provider_id' column later.
        // For MVP, let's assume dealers see all recent service activity they can access.

        const fetchDashboard = async () => {
            if (!supabase) return;

            // 1. Get recent services
            const { data: recent, error } = await supabase
                .from('services')
                .select('*, vehicles(make, model, license_plate)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error) {
                setRecentServices(recent);

                // Simple stats based on what we fetched (mocking real distinct counts for speed)
                setStats({
                    servicesToday: recent.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
                    totalServices: 142 // Mock total for visual impact
                });
            }
        };

        fetchDashboard();
    }, [user]);

    return (
        <DealerLayout>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white">Dealer Dashboard</h1>
                    <p className="text-slate-400 mt-1">Manage service records and customer vehicles.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500">
                                <Search className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Vehicle Lookup</h3>
                                <p className="text-sm text-slate-400">Find a customer vehicle to log service</p>
                            </div>
                        </div>
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white border-none"
                            onClick={() => navigate('/dealer/lookup')}
                        >
                            Find Vehicle
                        </Button>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                                <PenTool className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Quick Log</h3>
                                <p className="text-sm text-slate-400">Directly log a new service record</p>
                            </div>
                        </div>
                        <Button
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white border-none"
                            onClick={() => navigate('/dealer/log-service')}
                        >
                            Log Service
                        </Button>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Recent Service Activity</h3>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/dealer/history')}>View All</Button>
                        </div>

                        <div className="space-y-4">
                            {recentServices.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No recent activity found.</p>
                            ) : (
                                recentServices.map(service => (
                                    <div key={service.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{service.service_type}</p>
                                                <p className="text-xs text-slate-400">
                                                    {service.vehicles?.make} {service.vehicles?.model} • {service.vehicles?.license_plate || 'No Plate'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-400">${service.cost || 0}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                                                <Calendar className="w-3 h-3" />
                                                <span>{service.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-white mb-4">Today's Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-slate-400">Services Logged</span>
                                    <span className="text-xl font-bold text-white">{stats.servicesToday}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-slate-400">Total Revenue</span>
                                    <span className="text-xl font-bold text-emerald-400">$--</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DealerLayout>
    );
};

export default DealerDashboard;
