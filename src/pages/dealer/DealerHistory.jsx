import { useState, useEffect } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { supabase } from '../../lib/supabase';
import {
    Search, Calendar, Loader2, Wrench, DollarSign, Download,
    ChevronLeft, ChevronRight, X, Filter, SlidersHorizontal
} from 'lucide-react';

const DealerHistory = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [serviceTypes, setServiceTypes] = useState([]);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 15;

    useEffect(() => {
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        fetchServices();
    }, [page]);

    const fetchServiceTypes = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('service_types').select('name').order('name');
        setServiceTypes((data || []).map(d => d.name));
    };

    const fetchServices = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*, vehicles(make, model, license_plate, year), profiles:user_id(email, full_name)')
                .order('date', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            setServices(data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = services.filter(s => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            s.service_type?.toLowerCase().includes(q) ||
            s.vehicles?.make?.toLowerCase().includes(q) ||
            s.vehicles?.model?.toLowerCase().includes(q) ||
            s.vehicles?.license_plate?.toLowerCase().includes(q) ||
            s.profiles?.full_name?.toLowerCase().includes(q);
        const matchesType = !filterType || s.service_type === filterType;
        const matchesStatus = !filterStatus || s.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalRevenue = filtered.reduce((sum, s) => sum + (s.cost || 0), 0);
    const activeFilters = [filterType, filterStatus, searchQuery].filter(Boolean).length;

    const clearFilters = () => {
        setSearchQuery('');
        setFilterType('');
        setFilterStatus('');
    };

    const statusBadge = (status) => {
        if (status === 'completed') {
            return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Completed</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Upcoming</span>;
    };

    return (
        <DealerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Service History</h1>
                        <p className="text-slate-400 mt-1 text-sm">Complete service log across all customers and vehicles.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-xs text-slate-400">Page Revenue: </span>
                            <span className="text-sm font-bold text-emerald-400">${totalRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="Search services, vehicles, customers..."
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
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {serviceTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[150px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                    {activeFilters > 0 && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
                            <X className="w-3.5 h-3.5" /> Clear ({activeFilters})
                        </button>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-3 bg-slate-800/60 border-b border-slate-700/40 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-3">Service</div>
                            <div className="col-span-3">Vehicle</div>
                            <div className="col-span-2">Customer</div>
                            <div className="col-span-1">Cost</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Date</div>
                        </div>

                        <div className="divide-y divide-slate-700/30">
                            {filtered.length === 0 ? (
                                <div className="text-center py-16">
                                    <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No service records match your filters.</p>
                                </div>
                            ) : (
                                filtered.map(service => (
                                    <div key={service.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors items-center">
                                        {/* Service Type */}
                                        <div className="lg:col-span-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400/80 flex-shrink-0">
                                                <Wrench className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{service.service_type}</p>
                                                {service.notes && <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{service.notes}</p>}
                                            </div>
                                        </div>

                                        {/* Vehicle */}
                                        <div className="lg:col-span-3">
                                            <p className="text-sm text-slate-300 truncate">
                                                {service.vehicles?.year} {service.vehicles?.make} {service.vehicles?.model}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-mono">{service.vehicles?.license_plate || 'N/A'}</p>
                                        </div>

                                        {/* Customer */}
                                        <div className="hidden lg:block lg:col-span-2">
                                            <p className="text-xs text-slate-400 truncate">{service.profiles?.full_name || 'Unknown'}</p>
                                        </div>

                                        {/* Cost */}
                                        <div className="lg:col-span-1">
                                            <p className="text-sm font-bold text-emerald-400">{service.cost ? `$${service.cost}` : '—'}</p>
                                        </div>

                                        {/* Status */}
                                        <div className="lg:col-span-1">
                                            {statusBadge(service.status)}
                                        </div>

                                        {/* Date */}
                                        <div className="lg:col-span-2 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            <span className="text-xs text-slate-400">{service.date}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/40 bg-slate-800/60">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <span className="text-xs text-slate-500">Page {page + 1}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={services.length < PAGE_SIZE}
                                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DealerLayout>
    );
};

export default DealerHistory;
