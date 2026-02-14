import { DealerLayout } from '../../components/layout/DealerLayout';

const DealerHistory = () => {
    return (
        <DealerLayout>
            <h1 className="text-3xl font-bold text-white mb-6">Service History</h1>
            <p className="text-slate-400">View all services performed by your center.</p>
            {/* Implementation can mirror user history but filtered by verified provider if we had that field */}
            <div className="mt-8 text-center py-12 bg-white/5 rounded-xl border border-white/5">
                <p className="text-slate-500">History module coming soon.</p>
            </div>
        </DealerLayout>
    );
};

export default DealerHistory;
