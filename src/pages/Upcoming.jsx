import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Upcoming() {
    const { user } = useAuth();
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*, vehicles(make, model, year)')
                    .eq('user_id', user.id)
                    .eq('status', 'upcoming')
                    .order('date', { ascending: true }); // Soonest first

                if (error) throw error;
                setUpcomingServices(data || []);
            } catch (err) {
                console.error('Error fetching upcoming services:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchUpcoming();
    }, [user]);

    const getStatusColor = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return 'text-red-500 bg-red-500/10 border-red-500/20'; // Urgent
        if (diffDays < 30) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // Upcoming
        return 'text-primary bg-primary/10 border-primary/20'; // Planned
    };

    const getStatusLabel = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays < 7) return 'Urgent';
        return 'Upcoming';
    };

    const handleMarkComplete = async (serviceId) => {
        try {
            const { error } = await supabase
                .from('services')
                .update({ status: 'completed' })
                .eq('id', serviceId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Remove from local list
            setUpcomingServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (err) {
            console.error('Error marking completed:', err);
            alert('Failed to update service status');
        }
    };


    return (
        <Layout>
            <h1 className="text-3xl font-bold text-white mb-6">Upcoming Services</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Summary cards logic could be dynamic, but keeping static structure for now */}
                <Card className="bg-gradient-to-br from-red-500/20 to-transparent border-red-500/20">
                    <div className="flex items-center gap-3 mb-2 text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-bold">Urgent Attention</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{upcomingServices.filter(s => getStatusLabel(s.date) === 'Urgent' || getStatusLabel(s.date) === 'Overdue').length} Tasks</p>
                    <p className="text-sm text-red-300">Overdue or due within 7 days</p>
                </Card>
                <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
                    <div className="flex items-center gap-3 mb-2 text-primary">
                        <Calendar className="w-6 h-6" />
                        <span className="font-bold">Total Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{upcomingServices.length} Tasks</p>
                    <p className="text-sm text-sky-300">Scheduled maintenance</p>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold">Health Score</span>
                    </div>
                    <p className="text-2xl font-bold text-white">Good</p>
                    <p className="text-sm text-emerald-300">Based on service history</p>
                </Card>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : upcomingServices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No upcoming services found.</p>
                        <p className="text-sm">Great job keeping up with maintenance!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingServices.map(service => (
                            <div key={service.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                    getStatusLabel(service.date) === 'Urgent' ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-300'
                                )}>
                                    <Calendar className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white text-lg">{service.service_type}</h3>
                                        <span className={clsx("px-2 py-0.5 rounded text-xs font-bold uppercase border", getStatusColor(service.date))}>
                                            {getStatusLabel(service.date)}
                                        </span>
                                    </div>
                                    <p className="text-slate-400">{service.vehicles?.year} {service.vehicles?.make} {service.vehicles?.model} • Due: {service.date}</p>
                                </div>

                                <Button
                                    onClick={() => handleMarkComplete(service.id)}
                                    variant={getStatusLabel(service.date) === 'Urgent' ? 'primary' : 'outline'}
                                    size="sm"
                                    className="w-full md:w-auto"
                                >
                                    Mark Complete
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </Layout>
    );
}
