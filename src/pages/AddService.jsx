import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';

export default function AddService() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingVehicles, setFetchingVehicles] = useState(true);
    const [vehicles, setVehicles] = useState([]);

    const [formData, setFormData] = useState({
        vehicle_id: '',
        service_type: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        notes: '',
        status: 'completed'
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('id, make, model, year')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setVehicles(data || []);
                if (data && data.length > 0) {
                    setFormData(prev => ({ ...prev, vehicle_id: data[0].id }));
                }
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Failed to load your vehicles. Please try again.');
            } finally {
                setFetchingVehicles(false);
            }
        };

        if (user) fetchVehicles();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.vehicle_id) {
            setError('Please select a vehicle');
            setLoading(false);
            return;
        }

        try {
            const { error: insertError } = await supabase
                .from('services')
                .insert([
                    {
                        user_id: user.id,
                        vehicle_id: formData.vehicle_id,
                        service_type: formData.service_type,
                        date: formData.date,
                        cost: formData.cost ? parseFloat(formData.cost) : null,
                        notes: formData.notes,
                        status: formData.status
                    }
                ]);

            if (insertError) throw insertError;

            // Update vehicle mileage if provided in the service log? 
            // For simplicity, let's keep it separate for now or maybe later add a feature to update mileage from here.

            navigate('/history');
        } catch (err) {
            console.error('Error adding service:', err);
            setError(err.message || 'Failed to add service record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 text-slate-400 hover:text-white pl-0"
                    onClick={() => navigate('/history')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to History
                </Button>

                <Card className="border-primary/20">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Log Service Record</h1>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {fetchingVehicles ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <p>You need to add a vehicle before logging services.</p>
                                <Button className="mt-4" onClick={() => navigate('/vehicles/new')}>Add Vehicle</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Vehicle</label>
                                    <select
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    >
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.year} {v.make} {v.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Service Type</label>
                                        <input
                                            type="text"
                                            required
                                            list="service-types"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                            placeholder="e.g. Oil Change"
                                            value={formData.service_type}
                                            onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                                        />
                                        <datalist id="service-types">
                                            <option value="Oil Change" />
                                            <option value="Tire Rotation" />
                                            <option value="Brake Inspection" />
                                            <option value="Battery Replacement" />
                                            <option value="General Inspection" />
                                        </datalist>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary placeholder-slate-500 [color-scheme:dark]"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Cost ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                            placeholder="0.00"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Status</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="completed">Completed</option>
                                            <option value="upcoming">Upcoming</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Notes</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="Any additional details..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => navigate('/history')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            'Save Record'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
