import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Calendar, Gauge, DollarSign } from 'lucide-react';

const DealerLogService = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Vehicle passed from lookup page
    const initialVehicle = location.state?.vehicle;

    // Redirect if direct access without vehicle
    useEffect(() => {
        if (!initialVehicle) {
            navigate('/dealer/lookup');
        }
    }, [initialVehicle, navigate]);

    const [loading, setLoading] = useState(false);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [formData, setFormData] = useState({
        service_type: '',
        date: new Date().toISOString().split('T')[0],
        mileage: initialVehicle?.mileage || '',
        cost: '',
        notes: '',
        status: 'completed'
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypes = async () => {
            const { data } = await supabase.from('service_types').select('*').order('name');
            setServiceTypes(data || []);
        };
        fetchTypes();
    }, []);

    // Early return ONLY after hooks
    if (!initialVehicle) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Insert Service Record
            const { error: insertError } = await supabase
                .from('services')
                .insert([
                    {
                        user_id: initialVehicle.user_id, // Link to vehicle owner
                        vehicle_id: initialVehicle.id,
                        service_type: formData.service_type,
                        date: formData.date,
                        mileage: parseInt(formData.mileage) || null,
                        cost: parseFloat(formData.cost) || null,
                        notes: formData.notes,
                        status: formData.status
                    }
                ]);

            if (insertError) throw insertError;

            // 2. Update Vehicle Mileage
            if (parseInt(formData.mileage) > initialVehicle.mileage) {
                await supabase
                    .from('vehicles')
                    .update({ mileage: parseInt(formData.mileage) })
                    .eq('id', initialVehicle.id);
            }

            // 3. Update Schedule (Optional but good for consistency)
            const selectedType = serviceTypes.find(t => t.name === formData.service_type);
            if (selectedType) {
                await supabase
                    .from('maintenance_schedules')
                    .update({
                        last_performed_date: formData.date,
                        last_performed_mileage: parseInt(formData.mileage)
                    })
                    .eq('vehicle_id', initialVehicle.id)
                    .eq('service_type_id', selectedType.id);
            }

            navigate('/dealer', { state: { success: 'Service logged successfully!' } });

        } catch (err) {
            console.error('Error logging service:', err);
            setError(err.message || 'Failed to submit service record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DealerLayout>
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent text-slate-400 hover:text-white"
                    onClick={() => navigate('/dealer/lookup')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lookup
                </Button>

                <Card className="border-amber-500/20">
                    <div className="p-6">
                        <header className="mb-6 flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Log Service</h1>
                                <p className="text-slate-400 text-sm mt-1">Recording maintenance for customer vehicle</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-slate-700 text-slate-300 text-xs font-mono px-2 py-1 rounded border border-slate-600">
                                    {initialVehicle.license_plate || 'NO PLATE'}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">
                                    {initialVehicle.year} {initialVehicle.make} {initialVehicle.model}
                                </p>
                            </div>
                        </header>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Service Type</label>
                                    <select
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                                        value={formData.service_type}
                                        onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                                    >
                                        <option value="">Select Service...</option>
                                        {serviceTypes.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                        <option value="Other">Other / Custom</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Date Performed</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">New Mileage (km)</label>
                                    <div className="relative">
                                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            required
                                            min={initialVehicle.mileage || 0}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                                            placeholder={initialVehicle.mileage}
                                            value={formData.mileage}
                                            onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Total Cost ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                                            placeholder="0.00"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Service Notes</label>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 h-24 resize-none"
                                    placeholder="Enter details about parts replaced, inspection notes, etc."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => navigate('/dealer/lookup')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Submit Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </DealerLayout>
    );
};

export default DealerLogService;
