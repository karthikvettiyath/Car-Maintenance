import { useState } from 'react';
import { DealerLayout } from '../../components/layout/DealerLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Store, Mail, Phone, MapPin, Clock, Shield, Save, Loader2, LogOut, Bell, Palette
} from 'lucide-react';

const DealerSettings = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        dealershipName: 'My Service Center',
        contactEmail: user?.email || '',
        phone: '',
        address: '',
        businessHours: '9:00 AM - 6:00 PM',
        notifyNewService: true,
        notifyCustomerReturn: true,
        darkMode: true,
    });

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Simulate save (in production, store in a dealer_settings table)
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const inputClasses = "w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors";

    return (
        <DealerLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your dealership profile and preferences.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Dealership Profile */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
                            <Store className="w-4 h-4 text-amber-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dealership Profile</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">Dealership Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            className={`${inputClasses} pl-10`}
                                            value={formData.dealershipName}
                                            onChange={(e) => handleChange('dealershipName', e.target.value)}
                                            placeholder="Your service center name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">Contact Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            className={`${inputClasses} pl-10`}
                                            value={formData.contactEmail}
                                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="tel"
                                            className={`${inputClasses} pl-10`}
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">Business Hours</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            className={`${inputClasses} pl-10`}
                                            value={formData.businessHours}
                                            onChange={(e) => handleChange('businessHours', e.target.value)}
                                            placeholder="9:00 AM - 6:00 PM"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <textarea
                                        className={`${inputClasses} pl-10 h-20 resize-none`}
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="123 Main St, City, State, ZIP"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-amber-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30 cursor-pointer hover:bg-white/[0.05] transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-white">New Service Alert</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Get notified when a new service is logged</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.notifyNewService}
                                    onChange={(e) => handleChange('notifyNewService', e.target.checked)}
                                    className="w-5 h-5 rounded accent-amber-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30 cursor-pointer hover:bg-white/[0.05] transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-white">Returning Customer</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Alert when a known customer books again</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.notifyCustomerReturn}
                                    onChange={(e) => handleChange('notifyCustomerReturn', e.target.checked)}
                                    className="w-5 h-5 rounded accent-amber-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Account & Security */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-slate-700/30">
                                <div>
                                    <p className="text-sm font-medium text-white">Email</p>
                                    <p className="text-xs text-slate-500">{user?.email || 'Not available'}</p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Dealer</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {saved && (
                            <span className="text-sm text-emerald-400 font-medium animate-in fade-in duration-300">
                                ✓ Settings saved successfully
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </DealerLayout>
    );
};

export default DealerSettings;
