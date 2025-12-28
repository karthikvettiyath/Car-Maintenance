import { Home, ClipboardList, PenTool, LayoutDashboard, Settings, Car } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export function Sidebar({ className }) {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Car, label: 'My Vehicles', to: '/vehicles' },
        { icon: ClipboardList, label: 'Service History', to: '/history' },
        { icon: PenTool, label: 'Upcoming', to: '/upcoming' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <aside className={clsx("w-20 lg:w-64 bg-dark-light border-r border-slate-700/50 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300", className)}>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Car className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 font-bold text-lg hidden lg:block tracking-wide">AutoMind</span>
            </div>

            <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="hidden lg:block">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">MK</div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">My Garage</p>
                        <p className="text-xs text-slate-400 truncate">Premium Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
