import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, DollarSign, PenTool, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function History() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch completed services with vehicle details
                const { data, error } = await supabase
                    .from('services')
                    .select('*, vehicles(make, model, year)')
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .order('date', { ascending: false });

                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchHistory();
    }, [user]);

    return (
        <Layout>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Service History</h1>
                    <p className="text-slate-400 mt-1">Track all maintenance records across your fleet</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4" />
                    Log Service
                </Button>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : services.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 bg-slate-900/30 border-dashed">
                    <p>No service history found.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {services.map((service) => (
                        <Card key={service.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <PenTool className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-white">{service.service_type}</h3>
                                <p className="text-slate-400 text-sm">
                                    {service.vehicles?.year} {service.vehicles?.make} {service.vehicles?.model} • {service.notes}
                                </p>
                            </div>

                            <div className="flex flex-col md:items-end gap-1 text-sm text-slate-300 min-w-[150px]">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span>{service.date}</span>
                                </div>
                                {service.mileage && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">{service.mileage.toLocaleString()} km</span>
                                    </div>
                                )}
                            </div>

                            {service.cost && (
                                <div className="flex items-center px-4 py-2 bg-white/5 rounded-lg border border-white/5 font-mono text-emerald-400">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{service.cost}</span>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
}
