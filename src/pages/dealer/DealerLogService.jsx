import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Calendar, Gauge, DollarSign, Car, CheckCircle } from 'lucide-react';

const DealerLogService = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Vehicle may be passed from lookup/vehicles page, or selected here
    const initialVehicle = location.state?.vehicle || null;

    const [loading, setLoading] = useState(false);
    const [allVehicles, setAllVehicles] = useState([]);
    const [fetchingVehicles, setFetchingVehicles] = useState(!initialVehicle);
    const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        service_type: '',
        date: new Date().toISOString().split('T')[0],
        mileage: initialVehicle?.mileage || '',
        cost: '',
        notes: '',
        status: 'completed'
    });
    const [error, setError] = useState(null);

    // Fetch service types
    useEffect(() => {
        const fetchTypes = async () => {
            const { data } = await supabase.from('service_types').select('*').order('name');
            setServiceTypes(data || []);
        };
        fetchTypes();
    }, []);

    // Fetch all vehicles if none was passed
    useEffect(() => {
        if (initialVehicle) return;
        const fetchVehicles = async () => {
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*, profiles:user_id(email, full_name)')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAllVehicles(data || []);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
            } finally {
                setFetchingVehicles(false);
            }
        };
        fetchVehicles();
    }, [initialVehicle]);

    const handleVehicleSelect = (vehicleId) => {
        const vehicle = allVehicles.find(v => v.id === vehicleId);
        setSelectedVehicle(vehicle || null);
        if (vehicle) {
            setFormData(prev => ({ ...prev, mileage: vehicle.mileage || '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVehicle) {
            setError('Please select a vehicle first.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // 1. Insert Service Record
            const { error: insertError } = await supabase
                .from('services')
                .insert([
                    {
                        user_id: selectedVehicle.user_id,
                        vehicle_id: selectedVehicle.id,
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
            if (parseInt(formData.mileage) > selectedVehicle.mileage) {
                await supabase
                    .from('vehicles')
                    .update({ mileage: parseInt(formData.mileage) })
                    .eq('id', selectedVehicle.id);
            }

            // 3. Update Schedule
            const selectedType = serviceTypes.find(t => t.name === formData.service_type);
            if (selectedType) {
                await supabase
                    .from('maintenance_schedules')
                    .update({
                        last_performed_date: formData.date,
                        last_performed_mileage: parseInt(formData.mileage)
                    })
                    .eq('vehicle_id', selectedVehicle.id)
                    .eq('service_type_id', selectedType.id);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/dealer/history');
            }, 1500);

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
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* Success State */}
                {success ? (
                    <Card className="border-emerald-500/30">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Service Logged Successfully!</h2>
                            <p className="text-slate-400 text-sm">
                                {formData.service_type} for {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model} has been recorded.
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Redirecting to history...</p>
                        </div>
                    </Card>
                ) : (
                    <Card className="border-amber-500/20">
                        <div className="p-6">
                            <header className="mb-6">
                                <h1 className="text-2xl font-bold text-white">Log Service</h1>
                                <p className="text-slate-400 text-sm mt-1">Record a service for any customer vehicle</p>
                            </header>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Vehicle Selection */}
                                {initialVehicle ? (
                                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <div className="flex items-center gap-3">
                                            <Car className="w-5 h-5 text-amber-400" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Plate: {selectedVehicle?.license_plate || 'N/A'} • {selectedVehicle?.mileage?.toLocaleString()} km
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Select Vehicle</label>
                                        {fetchingVehicles ? (
                                            <div className="flex items-center gap-2 py-3">
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                                <span className="text-sm text-slate-400">Loading vehicles...</span>
                                            </div>
                                        ) : (
                                            <select
                                                required
                                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                                                value={selectedVehicle?.id || ''}
                                                onChange={e => handleVehicleSelect(e.target.value)}
                                            >
                                                <option value="">Choose a vehicle...</option>
                                                {allVehicles.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.license_plate || '—'} • {v.year} {v.make} {v.model}
                                                        {v.profiles?.full_name ? ` (${v.profiles.full_name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

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
                                                min={selectedVehicle?.mileage || 0}
                                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                                                placeholder={selectedVehicle?.mileage || '0'}
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
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                                        disabled={loading || !selectedVehicle}
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Submit Record'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                )}
            </div>
        </DealerLayout>
    );
};

export default DealerLogService;
