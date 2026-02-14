import { LayoutDashboard, Users, Settings, Shield, Car, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export function AdminSidebar({ className }) {
    const navItems = [
        { icon: LayoutDashboard, label: 'Admin Dashboard', to: '/admin' },
        { icon: Users, label: 'User Management', to: '/admin/users' },
        { icon: Settings, label: 'Admin Settings', to: '/admin/settings' },
    ];

    return (
        <aside className={clsx("w-20 lg:w-64 bg-dark-light border-r border-slate-700/50 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300", className)}>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Shield className="text-white w-5 h-5" />
                </div>
                <span className="ml-3 font-bold text-lg hidden lg:block tracking-wide">Admin Panel</span>
            </div>

            <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-red-500/10 text-red-400 font-medium"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="hidden lg:block">{item.label}</span>
                    </NavLink>
                ))}

                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden lg:block">Back to App</span>
                    </NavLink>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Admin Access</p>
                        <p className="text-xs text-red-400 truncate">Full Control</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
