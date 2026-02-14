import { useState } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const DealerLookup = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);
        setResults([]); // Clear previous

        try {
            // Search by license_plate (primary) or VIN (if exists, but we don't have it yet)
            // Or partial match on make/model/year?
            // For now: exact license plate match or partial make/model

            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .ilike('license_plate', `%${searchQuery}%`)
                // .or(`license_plate.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`) // More comprehensive search
                .limit(10);

            if (error) throw error;
            setResults(data || []);

        } catch (err) {
            console.error('Error searching vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DealerLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Find Vehicle</h1>
                    <p className="text-slate-400">Search by license plate to log a new service record.</p>
                </header>

                <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-xl">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Enter License Plate (e.g. ABC-1234)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-600 px-8"
                                disabled={loading || !searchQuery.trim()}
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
                            </Button>
                        </form>
                    </div>
                </Card>

                {searched && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-lg font-semibold text-slate-300 px-1">
                            {results.length > 0 ? `Found ${results.length} vehicle(s)` : 'No vehicles found'}
                        </h2>

                        {results.length === 0 ? (
                            <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No vehicle found with license plate matching "<span className="text-white font-mono">{searchQuery}</span>".</p>
                                <p className="text-sm text-slate-500 mt-2">Try searching with a partial plate number.</p>
                            </div>
                        ) : (
                            results.map(vehicle => (
                                <Card key={vehicle.id} className="hover:border-amber-500/50 transition-colors group">
                                    <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                                        <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={vehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                                                alt={vehicle.model}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-white">
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </h3>
                                                {vehicle.license_plate && (
                                                    <span className="bg-slate-700 text-slate-300 text-xs font-mono px-2 py-1 rounded border border-slate-600 w-fit mx-auto md:mx-0">
                                                        {vehicle.license_plate}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-sm mb-3">
                                                Color: {vehicle.color || 'Unknown'} • Mileage: {vehicle.mileage?.toLocaleString()} km
                                            </p>

                                            <div className="flex gap-3 justify-center md:justify-start">
                                                <Button
                                                    size="sm"
                                                    className="bg-amber-500 hover:bg-amber-600 text-white border-none"
                                                    onClick={() => navigate('/dealer/log-service', { state: { vehicle } })}
                                                >
                                                    <PenTool className="w-4 h-4 mr-2" />
                                                    Log Service
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/dealer/vehicle/${vehicle.id}`)} // Assuming we make a detail view later
                                                    disabled // Placeholder for now
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DealerLayout>
    );
};

export default DealerLookup;
