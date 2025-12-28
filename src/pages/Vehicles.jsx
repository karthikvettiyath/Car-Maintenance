import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Edit, Loader2, Car as CarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchVehicles();
    }, [user]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            alert('Failed to delete vehicle');
        }
    }

    return (
        <Layout>
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
                <Button onClick={() => navigate('/vehicles/new')}>
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                </Button>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            ) : vehicles.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-700 bg-slate-900/30">
                    <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CarIcon className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
                    <p className="text-slate-400 mb-6">Add your first vehicle to start tracking maintenance.</p>
                    <Button onClick={() => navigate('/vehicles/new')} className="bg-blue-600 hover:bg-blue-700">
                        Add First Vehicle
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {vehicles.map(vehicle => (
                        <Card key={vehicle.id} className="group hover:border-primary/50 transition-colors">
                            <div className="flex gap-4">
                                <img
                                    src={vehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                                    alt={vehicle.model}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(vehicle.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {vehicle.color || 'Unknown Color'} • {vehicle.mileage?.toLocaleString()} km
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold uppercase">Active</span>
                                        {vehicle.license_plate && (
                                            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs font-mono">
                                                {vehicle.license_plate}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
}
