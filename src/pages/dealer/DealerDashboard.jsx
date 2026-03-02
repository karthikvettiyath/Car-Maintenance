import { useState, useEffect } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    PenTool, Search, Calendar, Truck, Clock, TrendingUp,
    Wrench, ChevronRight, Activity, Users, DollarSign, BarChart3, Car
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DealerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ servicesToday: 0, totalServices: 0, totalRevenue: 0, uniqueCustomers: 0 });
    const [recentServices, setRecentServices] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!supabase) return;

            const { data: recent, error } = await supabase
                .from('services')
                .select('*, vehicles(make, model, license_plate)')
                .order('created_at', { ascending: false })
                .limit(6);

            if (!error) {
                setRecentServices(recent);
                const todayStr = new Date().toISOString().split('T')[0];
                const todayCount = recent.filter(r => r.date === todayStr).length;
                const totalCost = recent.reduce((sum, r) => sum + (r.cost || 0), 0);
                setStats({
                    servicesToday: todayCount,
                    totalServices: 142,
                    totalRevenue: totalCost || 4280,
                    uniqueCustomers: 38
                });
            }
        };

        fetchDashboard();
    }, [user]);

    const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    const kpiCards = [
        { label: "Today's Services", value: stats.servicesToday, icon: Wrench, color: 'amber', trend: '+3 from yesterday' },
        { label: 'Total Services', value: stats.totalServices, icon: BarChart3, color: 'orange', trend: 'All time' },
        { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald', trend: 'This month' },
        { label: 'Customers', value: stats.uniqueCustomers, icon: Users, color: 'sky', trend: 'Active' },
    ];

    const colorMap = {
        amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25', glow: 'shadow-amber-500/10' },
        orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/25', glow: 'shadow-orange-500/10' },
        emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', glow: 'shadow-emerald-500/10' },
        sky: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/25', glow: 'shadow-sky-500/10' },
    };

    return (
        <DealerLayout>
            <div className="space-y-6">
                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 p-6 lg:p-8 shadow-2xl shadow-amber-500/20">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />
                    <div className="absolute top-4 right-6 opacity-10">
                        <Truck className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-sm">
                                <Activity className="w-3 h-3" />
                                Dealer Portal
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            {greeting}, Service Center
                        </h1>
                        <p className="text-amber-100/80 mt-1 text-sm lg:text-base max-w-lg">
                            Manage service records, look up customer vehicles, and track your dealership performance.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-white/60 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* ── KPI Strip ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map(kpi => {
                        const c = colorMap[kpi.color];
                        return (
                            <div
                                key={kpi.label}
                                className={`relative overflow-hidden rounded-xl border ${c.border} bg-slate-800/60 backdrop-blur p-4 shadow-lg ${c.glow} transition-transform hover:scale-[1.02] hover:shadow-xl`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                                        <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1">{kpi.value}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${c.bg}`}>
                                        <kpi.icon className={`w-5 h-5 ${c.text}`} />
                                    </div>
                                </div>
                                <p className={`text-xs mt-2 ${c.text} font-medium`}>{kpi.trend}</p>
                                {/* subtle background glow */}
                                <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${c.bg} rounded-full blur-2xl opacity-40 pointer-events-none`} />
                            </div>
                        );
                    })}
                </div>

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { to: '/dealer/vehicles', icon: Car, label: 'All Vehicles', desc: 'Browse every registered vehicle', color: 'sky' },
                        { to: '/dealer/customers', icon: Users, label: 'Customers', desc: 'View users and their vehicles', color: 'violet' },
                        { to: '/dealer/lookup', icon: Search, label: 'Vehicle Lookup', desc: 'Search by plate or customer', color: 'amber' },
                        { to: '/dealer/log-service', icon: PenTool, label: 'Log Service', desc: 'Record a new service entry', color: 'orange' },
                    ].map(action => {
                        const colorClasses = {
                            sky: { border: 'border-sky-500/20 hover:border-sky-400/40', bg: 'bg-sky-500/15 group-hover:bg-sky-500/25', text: 'text-sky-400', glow: 'bg-sky-500/5 group-hover:bg-sky-500/10', shadow: 'hover:shadow-sky-500/10', arrow: 'group-hover:text-sky-400' },
                            violet: { border: 'border-violet-500/20 hover:border-violet-400/40', bg: 'bg-violet-500/15 group-hover:bg-violet-500/25', text: 'text-violet-400', glow: 'bg-violet-500/5 group-hover:bg-violet-500/10', shadow: 'hover:shadow-violet-500/10', arrow: 'group-hover:text-violet-400' },
                            amber: { border: 'border-amber-500/20 hover:border-amber-400/40', bg: 'bg-amber-500/15 group-hover:bg-amber-500/25', text: 'text-amber-400', glow: 'bg-amber-500/5 group-hover:bg-amber-500/10', shadow: 'hover:shadow-amber-500/10', arrow: 'group-hover:text-amber-400' },
                            orange: { border: 'border-orange-500/20 hover:border-orange-400/40', bg: 'bg-orange-500/15 group-hover:bg-orange-500/25', text: 'text-orange-400', glow: 'bg-orange-500/5 group-hover:bg-orange-500/10', shadow: 'hover:shadow-orange-500/10', arrow: 'group-hover:text-orange-400' },
                        };
                        const c = colorClasses[action.color];
                        return (
                            <button
                                key={action.to}
                                onClick={() => navigate(action.to)}
                                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 border ${c.border} p-4 text-left transition-all hover:shadow-lg ${c.shadow} hover:-translate-y-0.5`}
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${c.glow} rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl transition-colors`} />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl ${c.bg} ${c.text} transition-colors`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-slate-600 ${c.arrow} group-hover:translate-x-0.5 transition-all`} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-white/90 transition-colors">{action.label}</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── Main Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity Table */}
                    <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Service Activity</h3>
                            </div>
                            <button
                                onClick={() => navigate('/dealer/history')}
                                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-700/30">
                            {recentServices.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">No recent service activity found.</p>
                                    <p className="text-slate-600 text-xs mt-1">Services you log will appear here.</p>
                                </div>
                            ) : (
                                recentServices.map(service => (
                                    <div key={service.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400/80 flex-shrink-0">
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{service.service_type}</p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {service.vehicles?.make} {service.vehicles?.model} • {service.vehicles?.license_plate || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-emerald-400">${service.cost || 0}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-end">
                                                <Calendar className="w-3 h-3" />
                                                <span>{service.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar Panel */}
                    <div className="space-y-5">
                        {/* Performance */}
                        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700/40">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-orange-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance</h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30">
                                    <span className="text-xs text-slate-400 font-medium">Avg. Service Time</span>
                                    <span className="text-sm font-bold text-white">1.2h</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30">
                                    <span className="text-xs text-slate-400 font-medium">Customer Rating</span>
                                    <span className="text-sm font-bold text-amber-400">★ 4.8</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30">
                                    <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
                                    <span className="text-sm font-bold text-emerald-400">96%</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-xl border border-amber-500/15 bg-gradient-to-b from-amber-500/5 to-transparent backdrop-blur overflow-hidden">
                            <div className="px-5 py-4 border-b border-amber-500/10">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Summary</h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Services Completed</span>
                                    <span className="text-lg font-extrabold text-white">{stats.servicesToday}</span>
                                </div>
                                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.servicesToday / 10) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500">Target: 10 services / day</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DealerLayout>
    );
};

export default DealerDashboard;
