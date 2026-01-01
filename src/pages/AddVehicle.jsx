import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AddVehicle() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        license_plate: '',
        color: ''
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('vehicles')
                .insert([
                    {
                        user_id: user.id,
                        make: formData.make,
                        model: formData.model,
                        year: parseInt(formData.year),
                        mileage: parseInt(formData.mileage),
                        license_plate: formData.license_plate,
                        color: formData.color,
                        // Random car image for now
                        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800'
                    }
                ])
                .select();

            if (insertError) throw insertError;

            const vehicleId = data[0].id;
            console.log('Vehicle created:', vehicleId);

            // --- Module 2: Auto-assign Default Services ---
            const { data: serviceTypes, error: typesError } = await supabase
                .from('service_types')
                .select('*');

            if (typesError) console.error('Error fetching service types:', typesError);

            if (serviceTypes && serviceTypes.length > 0) {
                const schedules = serviceTypes.map(type => ({
                    user_id: user.id,
                    vehicle_id: vehicleId,
                    service_type_id: type.id,
                    last_performed_date: new Date().toISOString().split('T')[0], // Default to today
                    last_performed_mileage: parseInt(formData.mileage) // Default to current mileage
                }));

                const { error: scheduleError } = await supabase
                    .from('maintenance_schedules')
                    .insert(schedules);

                if (scheduleError) console.error('Error creating schedules:', scheduleError);
            }
            // ---------------------------------------------

            navigate('/vehicles');
        } catch (err) {
            console.error('Error adding vehicle:', err);
            setError(err.message || 'Failed to add vehicle');
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
                    onClick={() => navigate('/vehicles')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Vehicles
                </Button>

                <Card className="border-primary/20">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Add New Vehicle</h1>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Make</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. Toyota"
                                        value={formData.make}
                                        onChange={e => setFormData({ ...formData, make: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Model</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. Camry"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Year</label>
                                    <input
                                        type="number"
                                        required
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. 2020"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Current Mileage (km)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. 50000"
                                        value={formData.mileage}
                                        onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">License Plate</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. ABC-1234"
                                        value={formData.license_plate}
                                        onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Color</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-slate-500"
                                        placeholder="e.g. Silver"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => navigate('/vehicles')}
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
                                        'Save Vehicle'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
