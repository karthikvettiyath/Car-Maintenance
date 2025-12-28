import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, AlertTriangle, Calendar, Plus, Loader2, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [primaryVehicle, setPrimaryVehicle] = useState(null);
    const [upcomingServices, setUpcomingServices] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch the most recently added or updated vehicle as primary
                const { data: vehicles, error: vehicleError } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (vehicleError) throw vehicleError;

                if (vehicles && vehicles.length > 0) {
                    setPrimaryVehicle(vehicles[0]);

                    // Fetch services for this vehicle (Mocking service structure for now as table might not exist)
                    // In a real app, this would be: 
                    // const { data: services } = await supabase.from('services').select('*').eq('vehicle_id', vehicles[0].id)...
                    setUpcomingServices([]);
                } else {
                    setPrimaryVehicle(null);
                }

            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!primaryVehicle) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="bg-slate-800 p-6 rounded-full mb-6">
                        <Car className="w-12 h-12 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to CarMinder</h1>
                    <p className="text-slate-400 max-w-md mb-8">
                        To get started with personalized maintenance reminders, please add your first vehicle.
                    </p>
                    <Button onClick={() => navigate('/vehicles/new')}>
                        <Plus className="w-4 h-4" />
                        Add Your Vehicle
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome back, your fleet is looking good.</p>
                </div>
                <Button variant="primary" size="md">
                    <Plus className="w-4 h-4" />
                    Add Service
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Status Card */}
                <Card className="lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <img
                            src={primaryVehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                            alt={primaryVehicle.model}
                            className="w-full md:w-48 h-32 object-cover rounded-xl shadow-lg border border-slate-700"
                        />
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider border border-secondary/20">Active</span>
                                <h2 className="text-2xl font-bold">{primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}</h2>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-6 text-slate-300 text-sm">
                                <div>
                                    <p className="text-slate-500 mb-0.5 uppercase text-xs font-bold">Mileage</p>
                                    <p className="font-mono text-white">{primaryVehicle.mileage?.toLocaleString()} km</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-0.5 uppercase text-xs font-bold">Health</p>
                                    <div className="flex items-center gap-1 text-secondary">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats / Alert */}
                <Card className="flex flex-col justify-center items-center text-center bg-gradient-to-b from-dark-light to-dark border-orange-500/20">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Attention Needed</h3>
                    <p className="text-sm text-slate-400 mb-4">Insurance renewal due in 15 days.</p>
                    <Button variant="outline" size="sm" className="w-full">Review</Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Upcoming Services" subtitle="Based on your maintenance schedule" />
                    <div className="space-y-4">
                        {upcomingServices.length > 0 ? upcomingServices.map(service => (
                            <div key={service.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{service.service_type}</h4>
                                    <p className="text-sm text-slate-400">Due: {service.date} • {service.mileage}km</p>
                                </div>
                                <Button variant="ghost" size="sm">Details</Button>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-slate-500">
                                <p>No upcoming services scheduled.</p>
                            </div>
                        )}
                        <Button variant="ghost" className="w-full mt-2">View Full Schedule</Button>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Recent Activity" subtitle="Log of latest maintenance" />
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <p>No recent services logged.</p>
                        <Button variant="ghost" className="mt-2 text-primary">Add Past Service</Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
