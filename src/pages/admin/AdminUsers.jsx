import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Users, Search, Shield, ShieldOff, Loader2 } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId, currentRole) => {
        if (!supabase) return;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setUpdating(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Failed to update role: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const term = search.toLowerCase();
        return (
            (u.email || '').toLowerCase().includes(term) ||
            (u.full_name || '').toLowerCase().includes(term) ||
            (u.role || '').toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-red-400" />
                        <h1 className="text-2xl font-bold text-white">User Management</h1>
                    </div>
                    <p className="text-slate-400">Manage user accounts and roles</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                        placeholder="Search users by email, name, or role..."
                    />
                </div>

                {/* Users Table */}
                <Card className="border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">User</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Role</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Joined</th>
                                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-slate-400 py-8">
                                            {search ? 'No users match your search.' : 'No users found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((profile) => (
                                        <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                                        {(profile.email || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{profile.full_name || 'No name'}</p>
                                                        <p className="text-xs text-slate-400">{profile.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                    profile.role === 'admin'
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {profile.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    onClick={() => toggleRole(profile.id, profile.role)}
                                                    disabled={updating === profile.id}
                                                    className={`text-xs px-3 py-1.5 ${
                                                        profile.role === 'admin'
                                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                                                    }`}
                                                >
                                                    {updating === profile.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : profile.role === 'admin' ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <ShieldOff className="w-3 h-3" />
                                                            Remove Admin
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            <Shield className="w-3 h-3" />
                                                            Make Admin
                                                        </span>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <p className="text-xs text-slate-500">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
