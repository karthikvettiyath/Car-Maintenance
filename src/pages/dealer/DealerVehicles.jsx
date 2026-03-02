import { useState, useEffect } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    Car, Search, Filter, ChevronRight, Loader2, Gauge,
    Calendar, Palette, Hash, ArrowUpDown, X
} from 'lucide-react';

const DealerVehicles = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMake, setFilterMake] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        fetchVehicles();
    }, [sortBy, sortDir]);

    const fetchVehicles = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*, profiles:user_id(email, full_name)')
                .order(sortBy, { ascending: sortDir === 'asc' });

            if (error) throw error;
            setVehicles(data || []);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    const uniqueMakes = [...new Set(vehicles.map(v => v.make))].sort();

    const filtered = vehicles.filter(v => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            v.make?.toLowerCase().includes(q) ||
            v.model?.toLowerCase().includes(q) ||
            v.license_plate?.toLowerCase().includes(q) ||
            v.profiles?.full_name?.toLowerCase().includes(q) ||
            v.profiles?.email?.toLowerCase().includes(q) ||
            String(v.year).includes(q);
        const matchesMake = !filterMake || v.make === filterMake;
        return matchesSearch && matchesMake;
    });

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    return (
        <DealerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">All Vehicles</h1>
                        <p className="text-slate-400 mt-1 text-sm">Browse every vehicle registered on the platform.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">{filtered.length} of {vehicles.length} vehicles</span>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="Search by make, model, plate, owner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[160px]"
                            value={filterMake}
                            onChange={(e) => setFilterMake(e.target.value)}
                        >
                            <option value="">All Makes</option>
                            {uniqueMakes.map(make => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sort Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 font-medium mr-1">Sort:</span>
                    {[
                        { key: 'created_at', label: 'Newest' },
                        { key: 'make', label: 'Make' },
                        { key: 'year', label: 'Year' },
                        { key: 'mileage', label: 'Mileage' },
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => toggleSort(opt.key)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortBy === opt.key
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                    : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            {opt.label}
                            {sortBy === opt.key && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                    ))}
                </div>

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50">
                        <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No vehicles found</p>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(vehicle => (
                            <div
                                key={vehicle.id}
                                className="group relative rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
                                onClick={() => navigate('/dealer/log-service', { state: { vehicle } })}
                            >
                                {/* Vehicle Image */}
                                <div className="h-36 bg-slate-700/50 overflow-hidden">
                                    <img
                                        src={vehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Body */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-white text-sm group-hover:text-amber-50 transition-colors">
                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                            </h3>
                                            {vehicle.profiles && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                                                    Owner: {vehicle.profiles.full_name || vehicle.profiles.email}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {vehicle.license_plate && (
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="w-3 h-3 text-slate-500" />
                                                <span className="text-xs text-slate-400 font-mono">{vehicle.license_plate}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Gauge className="w-3 h-3 text-slate-500" />
                                            <span className="text-xs text-slate-400">{vehicle.mileage?.toLocaleString()} km</span>
                                        </div>
                                        {vehicle.color && (
                                            <div className="flex items-center gap-1.5">
                                                <Palette className="w-3 h-3 text-slate-500" />
                                                <span className="text-xs text-slate-400">{vehicle.color}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            <span className="text-xs text-slate-400">{new Date(vehicle.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DealerLayout>
    );
};

export default DealerVehicles;
