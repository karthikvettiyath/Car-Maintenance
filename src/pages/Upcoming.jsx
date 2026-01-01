import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, AlertTriangle, CheckCircle2, Loader2, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateServiceStatus } from '../utils/maintenance';

export default function Upcoming() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                // Fetch schedules with related vehicle and service type info
                const { data, error } = await supabase
                    .from('maintenance_schedules')
                    .select(`
                        *,
                        vehicles (
                            id, make, model, year, mileage
                        ),
                        service_types (
                            id, name, interval_km, interval_months
                        )
                    `)
                    .eq('user_id', user.id);

                if (error) throw error;

                // Calculate status for each
                const calculated = (data || [])
                    .map(item => {
                        if (!item.vehicles || !item.service_types) return null;

                        const calculation = calculateServiceStatus(
                            item.service_types,
                            item,
                            item.vehicles.mileage
                        );

                        return {
                            ...item,
                            ...calculation
                        };
                    })
                    .filter(Boolean);

                // Sort: DUE > UPCOMING > OK
                calculated.sort((a, b) => {
                    if (a.status === 'DUE' && b.status !== 'DUE') return -1;
                    if (a.status !== 'DUE' && b.status === 'DUE') return 1;
                    if (a.status === 'UPCOMING' && b.status !== 'UPCOMING') return -1;
                    if (a.status !== 'UPCOMING' && b.status === 'UPCOMING') return 1;
                    return 0;
                });

                setScheduleItems(calculated);

            } catch (err) {
                console.error('Error loading schedule:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSchedules();
    }, [user]);

    const handleMarkComplete = (item) => {
        // Navigate to add service page, pre-filling data via state or query params is tricky without passing state.
        // For simplicity, we just go to the page. User has to select.
        // A better UX would be to pass state:
        navigate('/services/new', {
            state: {
                vehicleId: item.vehicle_id,
                serviceTypeName: item.service_types.name
            }
        });
    };

    const urgentCount = scheduleItems.filter(s => s.status === 'DUE').length;
    const upcomingCount = scheduleItems.filter(s => s.status === 'UPCOMING').length;

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-white mb-6">Maintenance Schedule</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-red-500/20 to-transparent border-red-500/20">
                    <div className="flex items-center gap-3 mb-2 text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-bold">Attention Needed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{urgentCount} Tasks</p>
                    <p className="text-sm text-red-300">Overdue items</p>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2 text-amber-400">
                        <Calendar className="w-6 h-6" />
                        <span className="font-bold">Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{upcomingCount} Tasks</p>
                    <p className="text-sm text-amber-300">Due soon</p>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold">On Track</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{scheduleItems.filter(s => s.status === 'OK').length} Items</p>
                    <p className="text-sm text-emerald-300">Scheduled maintenance</p>
                </Card>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : scheduleItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No maintenance schedule found.</p>
                        <p className="text-sm">Add a vehicle to generate a schedule.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scheduleItems.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                    item.status === 'DUE' ? 'bg-red-500/20 text-red-500' :
                                        item.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-500' :
                                            'bg-emerald-500/20 text-emerald-500'
                                )}>
                                    {item.status === 'DUE' ? <AlertTriangle className="w-6 h-6" /> :
                                        item.status === 'UPCOMING' ? <Calendar className="w-6 h-6" /> :
                                            <CheckCircle2 className="w-6 h-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-white text-lg">{item.serviceName}</h3>
                                        <span className={clsx("px-2 py-0.5 rounded text-xs font-bold uppercase border",
                                            item.status === 'DUE' ? 'text-red-400 border-red-500/30' :
                                                item.status === 'UPCOMING' ? 'text-amber-400 border-amber-500/30' :
                                                    'text-emerald-400 border-emerald-500/30'
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 mb-2">
                                        {item.vehicles?.year} {item.vehicles?.make} {item.vehicles?.model}
                                    </p>
                                    <div className="text-sm text-slate-500 flex flex-wrap gap-4">
                                        <span className="flex items-center gap-1">
                                            Last: {item.last_performed_date} • {item.last_performed_mileage?.toLocaleString()} km
                                        </span>
                                        <span className={clsx("font-medium",
                                            item.status === 'DUE' ? 'text-red-400' :
                                                item.status === 'UPCOMING' ? 'text-amber-400' : 'text-slate-500'
                                        )}>
                                            Status: {item.reason}
                                        </span>
                                    </div>
                                </div>

                                {(item.status === 'DUE' || item.status === 'UPCOMING') && (
                                    <Button
                                        onClick={() => handleMarkComplete(item)}
                                        variant={item.status === 'DUE' ? 'primary' : 'outline'}
                                        size="sm"
                                        className="w-full md:w-auto"
                                    >
                                        Log Completed
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </Layout>
    );
}
