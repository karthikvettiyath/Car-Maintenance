import { LayoutDashboard, PenTool, Database, Settings, Truck, Search, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

export function DealerSidebar({ className }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dealer' },
        { icon: Search, label: 'Vehicle Lookup', to: '/dealer/lookup' },
        { icon: PenTool, label: 'Log Service', to: '/dealer/log-service' },
        { icon: Database, label: 'Service History', to: '/dealer/history' },
        { icon: Settings, label: 'Settings', to: '/dealer/settings' },
    ];

    return (
        <aside className={clsx("w-20 lg:w-64 bg-dark-light border-r border-slate-700/50 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300", className)}>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Truck className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 font-bold text-lg hidden lg:block tracking-wide">Dealer Portal</span>
            </div>

            <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/dealer'}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="hidden lg:block">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                        <Truck className="w-4 h-4" />
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Service Center</p>
                        <p className="text-xs text-amber-500 truncate">Dealer Access</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden lg:block text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
