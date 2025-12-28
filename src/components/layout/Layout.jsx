import { Sidebar } from './Sidebar';

export function Layout({ children }) {
    return (
        <div className="min-h-screen bg-dark">
            <Sidebar />
            <main className="pl-20 lg:pl-64 min-h-screen transition-all duration-300">
                <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
