import { useState, useEffect } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { supabase } from '../../lib/supabase';
import {
    Users, Search, Mail, Shield, Calendar, Car, X, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const DealerCustomers = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [customerVehicles, setCustomerVehicles] = useState({});

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // Dealers can see profiles via RLS. If RLS blocks this, we fallback gracefully.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehiclesForCustomer = async (userId) => {
        if (customerVehicles[userId]) return; // Already cached
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomerVehicles(prev => ({ ...prev, [userId]: data || [] }));
        } catch (err) {
            console.error('Error fetching customer vehicles:', err);
        }
    };

    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            fetchVehiclesForCustomer(id);
        }
    };

    const filtered = profiles.filter(p => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (
            p.email?.toLowerCase().includes(q) ||
            p.full_name?.toLowerCase().includes(q) ||
            p.role?.toLowerCase().includes(q)
        );
    });

    const roleBadge = (role) => {
        const map = {
            user: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/25' },
            dealer: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
            admin: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/25' },
        };
        const c = map[role] || map.user;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                <Shield className="w-2.5 h-2.5" />
                {role}
            </span>
        );
    };

    return (
        <DealerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Customers</h1>
                        <p className="text-slate-400 mt-1 text-sm">View registered users and their associated vehicles.</p>
                    </div>
                    <span className="text-sm text-slate-500">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No customers found</p>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-slate-800/60 border-b border-slate-700/40 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-4">Customer</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-2">Joined</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-slate-700/30">
                            {filtered.map(profile => (
                                <div key={profile.id}>
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
                                        onClick={() => toggleExpand(profile.id)}
                                    >
                                        {/* Name */}
                                        <div className="md:col-span-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                                                {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{profile.full_name || 'Unnamed User'}</p>
                                                <p className="text-xs text-slate-500 md:hidden truncate">{profile.email}</p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="hidden md:flex md:col-span-3 items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                            <span className="text-sm text-slate-400 truncate">{profile.email}</span>
                                        </div>

                                        {/* Role */}
                                        <div className="hidden md:flex md:col-span-2 items-center">
                                            {roleBadge(profile.role)}
                                        </div>

                                        {/* Joined */}
                                        <div className="hidden md:flex md:col-span-2 items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            <span className="text-xs text-slate-400">{new Date(profile.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {/* Expand */}
                                        <div className="hidden md:flex md:col-span-1 justify-end">
                                            {expandedId === profile.id
                                                ? <ChevronUp className="w-4 h-4 text-amber-400" />
                                                : <ChevronDown className="w-4 h-4 text-slate-500" />
                                            }
                                        </div>
                                    </div>

                                    {/* Expanded: Vehicles */}
                                    {expandedId === profile.id && (
                                        <div className="px-5 pb-4 animate-in slide-in-from-top-2 duration-200">
                                            <div className="ml-12 space-y-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Vehicles</p>
                                                {!customerVehicles[profile.id] ? (
                                                    <div className="flex items-center gap-2 py-2">
                                                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                                        <span className="text-xs text-slate-500">Loading...</span>
                                                    </div>
                                                ) : customerVehicles[profile.id].length === 0 ? (
                                                    <p className="text-xs text-slate-500 py-2">No vehicles registered.</p>
                                                ) : (
                                                    customerVehicles[profile.id].map(v => (
                                                        <div
                                                            key={v.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/30 hover:border-amber-500/20 transition-colors"
                                                        >
                                                            <Car className="w-4 h-4 text-amber-400/60 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-white">{v.year} {v.make} {v.model}</p>
                                                                <p className="text-[11px] text-slate-500">{v.license_plate || 'No plate'} • {v.mileage?.toLocaleString()} km</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DealerLayout>
    );
};

export default DealerCustomers;
