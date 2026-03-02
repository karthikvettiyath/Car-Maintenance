
const mockUser = {
    id: 'dealer-123',
    email: 'dealer@example.com',
    user_metadata: { full_name: 'Premium Motors' }
};

// ─── Central Data Store (mutable, shared across all calls) ───────────────────
const store = {
    profiles: [
        { id: 'admin-123', email: 'admin@example.com', role: 'admin', full_name: 'System Admin', created_at: '2025-11-10T10:00:00Z', updated_at: '2025-11-10T10:00:00Z' },
        { id: 'dealer-123', email: 'dealer@example.com', role: 'dealer', full_name: 'Premium Motors', created_at: '2025-12-01T10:00:00Z', updated_at: '2025-12-01T10:00:00Z' },
        { id: 'user-123', email: 'john@example.com', role: 'user', full_name: 'John Doe', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
        { id: 'user-456', email: 'sarah@example.com', role: 'user', full_name: 'Sarah Connor', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-20T10:00:00Z' },
        { id: 'user-789', email: 'mike@example.com', role: 'user', full_name: 'Mike Chen', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
    ],
    vehicles: [
        { id: 'v1', user_id: 'user-123', make: 'Toyota', model: 'Corolla', year: 2022, mileage: 12000, license_plate: 'ABC-1234', color: 'White', image_url: null, created_at: '2026-01-15T11:00:00Z' },
        { id: 'v2', user_id: 'user-123', make: 'Honda', model: 'Civic', year: 2021, mileage: 8000, license_plate: 'XYZ-9876', color: 'Black', image_url: null, created_at: '2026-01-16T11:00:00Z' },
        { id: 'v3', user_id: 'user-456', make: 'Ford', model: 'Mustang', year: 2023, mileage: 5200, license_plate: 'MUS-5500', color: 'Red', image_url: null, created_at: '2026-01-22T11:00:00Z' },
        { id: 'v4', user_id: 'user-456', make: 'Tesla', model: 'Model 3', year: 2024, mileage: 3100, license_plate: 'EV-0042', color: 'Silver', image_url: null, created_at: '2026-02-01T11:00:00Z' },
        { id: 'v5', user_id: 'user-789', make: 'BMW', model: 'X5', year: 2020, mileage: 45000, license_plate: 'BMW-7777', color: 'Navy Blue', image_url: null, created_at: '2026-02-06T11:00:00Z' },
        { id: 'v6', user_id: 'user-789', make: 'Toyota', model: 'Camry', year: 2019, mileage: 68000, license_plate: 'CAM-2020', color: 'Grey', image_url: null, created_at: '2026-02-07T11:00:00Z' },
    ],
    service_types: [
        { id: 'st1', name: 'Oil Change', interval_km: 5000, interval_months: 6 },
        { id: 'st2', name: 'Tire Rotation', interval_km: 10000, interval_months: 6 },
        { id: 'st3', name: 'Brake Inspection', interval_km: 20000, interval_months: 12 },
        { id: 'st4', name: 'General Service', interval_km: 15000, interval_months: 12 },
    ],
    services: [
        { id: 's1', vehicle_id: 'v1', user_id: 'user-123', service_type: 'Oil Change', date: '2025-01-01', cost: 50, mileage: 10000, status: 'completed', notes: 'Synthetic oil used', created_at: '2025-01-01T10:00:00Z' },
        { id: 's2', vehicle_id: 'v2', user_id: 'user-123', service_type: 'Brake Inspection', date: '2025-02-15', cost: 120, mileage: 7500, status: 'completed', notes: 'Pads at 60%', created_at: '2025-02-15T10:00:00Z' },
        { id: 's3', vehicle_id: 'v3', user_id: 'user-456', service_type: 'Tire Rotation', date: '2025-03-10', cost: 40, mileage: 4800, status: 'completed', notes: null, created_at: '2025-03-10T10:00:00Z' },
        { id: 's4', vehicle_id: 'v4', user_id: 'user-456', service_type: 'General Service', date: '2025-04-20', cost: 250, mileage: 2800, status: 'completed', notes: 'Full inspection + fluids topped', created_at: '2025-04-20T10:00:00Z' },
        { id: 's5', vehicle_id: 'v5', user_id: 'user-789', service_type: 'Oil Change', date: '2025-05-05', cost: 85, mileage: 43000, status: 'completed', notes: 'BMW spec oil', created_at: '2025-05-05T10:00:00Z' },
        { id: 's6', vehicle_id: 'v6', user_id: 'user-789', service_type: 'Brake Inspection', date: '2025-06-12', cost: 95, mileage: 66000, status: 'upcoming', notes: 'Scheduled for next visit', created_at: '2025-06-12T10:00:00Z' },
    ],
    maintenance_schedules: [
        { id: 'sch1', vehicle_id: 'v1', service_type_id: 'st1', last_performed_date: '2025-01-01', last_performed_mileage: 10000 },
    ],
};

// ─── Helper: Resolve joined fields on data ──────────────────────────────────
const resolveJoins = (tableName, row, selectStr) => {
    const result = { ...row };

    // Vehicles select often joins profiles via user_id
    if (tableName === 'vehicles' && selectStr && selectStr.includes('profiles')) {
        const owner = store.profiles.find(p => p.id === row.user_id);
        result.profiles = owner ? { email: owner.email, full_name: owner.full_name } : null;
    }

    // Services select joins vehicles and profiles
    if (tableName === 'services') {
        if (selectStr && selectStr.includes('vehicles')) {
            const v = store.vehicles.find(veh => veh.id === row.vehicle_id);
            result.vehicles = v ? { make: v.make, model: v.model, license_plate: v.license_plate, year: v.year } : null;
        }
        if (selectStr && selectStr.includes('profiles')) {
            const p = store.profiles.find(pr => pr.id === row.user_id);
            result.profiles = p ? { email: p.email, full_name: p.full_name } : null;
        }
    }

    // Maintenance schedules join service_types
    if (tableName === 'maintenance_schedules' && selectStr && selectStr.includes('service_types')) {
        const st = store.service_types.find(s => s.id === row.service_type_id);
        result.service_types = st || null;
    }

    return result;
};

// ─── Mock Query Builder ─────────────────────────────────────────────────────
const createMockChain = (tableName) => {
    let filters = [];
    let selectStr = '*';
    let orderField = null;
    let orderAsc = false;
    let limitCount = null;
    let rangeStart = null;
    let rangeEnd = null;
    let pendingInsert = null;
    let pendingUpdate = null;
    let isDelete = false;

    const getFilteredData = () => {
        let data = [...(store[tableName] || [])];

        // Apply eq filters
        for (const [col, val] of filters) {
            data = data.filter(item => item[col] === val);
        }

        // Resolve joins
        data = data.map(row => resolveJoins(tableName, row, selectStr));

        // Apply ordering
        if (orderField) {
            data.sort((a, b) => {
                const aVal = a[orderField];
                const bVal = b[orderField];
                if (aVal < bVal) return orderAsc ? -1 : 1;
                if (aVal > bVal) return orderAsc ? 1 : -1;
                return 0;
            });
        }

        // Apply range
        if (rangeStart !== null && rangeEnd !== null) {
            data = data.slice(rangeStart, rangeEnd + 1);
        }

        // Apply limit
        if (limitCount !== null) {
            data = data.slice(0, limitCount);
        }

        return data;
    };

    const chain = {
        select: (str) => { selectStr = str || '*'; return chain; },
        eq: (col, val) => { filters.push([col, val]); return chain; },
        neq: () => chain,
        gt: () => chain,
        gte: () => chain,
        lt: () => chain,
        lte: () => chain,
        like: () => chain,
        ilike: (col, pattern) => {
            // Simple ilike: match %val% pattern
            const term = pattern.replace(/%/g, '').toLowerCase();
            if (term) {
                filters.push(['__ilike', { col, term }]);
            }
            return chain;
        },
        or: () => chain,
        in: () => chain,
        order: (field, opts) => { orderField = field; orderAsc = opts?.ascending || false; return chain; },
        limit: (n) => { limitCount = n; return chain; },
        range: (start, end) => { rangeStart = start; rangeEnd = end; return chain; },

        // ── Mutations ──
        insert: (rows) => {
            pendingInsert = Array.isArray(rows) ? rows : [rows];
            return chain;
        },
        update: (updates) => {
            pendingUpdate = updates;
            return chain;
        },
        delete: () => { isDelete = true; return chain; },

        // ── Terminal methods ──
        single: () => {
            // Mutations first
            if (pendingInsert) {
                const tableData = store[tableName] || [];
                for (const row of pendingInsert) {
                    const newRow = { id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...row, created_at: new Date().toISOString() };
                    tableData.push(newRow);
                }
                store[tableName] = tableData;
                return Promise.resolve({ data: pendingInsert[0], error: null });
            }
            if (pendingUpdate) {
                applyUpdate();
                return Promise.resolve({ data: pendingUpdate, error: null });
            }

            const data = getFilteredData();
            return Promise.resolve({ data: data[0] || null, error: null });
        },
        then: (cb) => {
            // Handle mutations
            if (pendingInsert) {
                const tableData = store[tableName] || [];
                for (const row of pendingInsert) {
                    const newRow = { id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...row, created_at: new Date().toISOString() };
                    tableData.push(newRow);
                    console.log(`[MockDB] INSERT into ${tableName}:`, newRow.service_type || newRow.make || newRow.id);
                }
                store[tableName] = tableData;
                return Promise.resolve({ data: pendingInsert, error: null }).then(cb);
            }
            if (pendingUpdate) {
                applyUpdate();
                return Promise.resolve({ data: pendingUpdate, error: null }).then(cb);
            }
            if (isDelete) {
                applyDelete();
                return Promise.resolve({ data: null, error: null }).then(cb);
            }

            const data = getFilteredData();
            return Promise.resolve({ data, count: data.length, error: null }).then(cb);
        },
    };

    // Override ilike filter in getFilteredData
    const origGetFilteredData = getFilteredData;
    const getFilteredDataPatched = () => {
        let data = [...(store[tableName] || [])];

        // Apply filters
        for (const [col, val] of filters) {
            if (col === '__ilike') {
                data = data.filter(item => {
                    const cellValue = item[val.col];
                    return cellValue && String(cellValue).toLowerCase().includes(val.term);
                });
            } else {
                data = data.filter(item => item[col] === val);
            }
        }

        // Resolve joins
        data = data.map(row => resolveJoins(tableName, row, selectStr));

        // Apply ordering
        if (orderField) {
            data.sort((a, b) => {
                const aVal = a[orderField];
                const bVal = b[orderField];
                if (aVal < bVal) return orderAsc ? -1 : 1;
                if (aVal > bVal) return orderAsc ? 1 : -1;
                return 0;
            });
        }

        if (rangeStart !== null && rangeEnd !== null) {
            data = data.slice(rangeStart, rangeEnd + 1);
        }

        if (limitCount !== null) {
            data = data.slice(0, limitCount);
        }

        return data;
    };

    // Replace references
    const applyUpdate = () => {
        if (!pendingUpdate) return;
        const tableData = store[tableName] || [];
        for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];
            const matches = filters.every(([col, val]) => {
                if (col === '__ilike') return true;
                return row[col] === val;
            });
            if (matches) {
                tableData[i] = { ...row, ...pendingUpdate };
                console.log(`[MockDB] UPDATE ${tableName} id=${row.id}:`, pendingUpdate);
            }
        }
    };

    const applyDelete = () => {
        store[tableName] = (store[tableName] || []).filter(row => {
            return !filters.every(([col, val]) => {
                if (col === '__ilike') return true;
                return row[col] === val;
            });
        });
    };

    // Patch the chain's terminal methods to use the fixed filter
    chain.single = () => {
        if (pendingInsert) {
            const tableData = store[tableName] || [];
            for (const row of pendingInsert) {
                const newRow = { id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...row, created_at: new Date().toISOString() };
                tableData.push(newRow);
            }
            store[tableName] = tableData;
            return Promise.resolve({ data: pendingInsert[0], error: null });
        }
        if (pendingUpdate) {
            applyUpdate();
            return Promise.resolve({ data: pendingUpdate, error: null });
        }
        const data = getFilteredDataPatched();
        return Promise.resolve({ data: data[0] || null, error: null });
    };

    chain.then = (cb) => {
        if (pendingInsert) {
            const tableData = store[tableName] || [];
            for (const row of pendingInsert) {
                const newRow = { id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...row, created_at: new Date().toISOString() };
                tableData.push(newRow);
                console.log(`[MockDB] INSERT into ${tableName}:`, newRow.service_type || newRow.make || newRow.id);
            }
            store[tableName] = tableData;
            return Promise.resolve({ data: pendingInsert, error: null }).then(cb);
        }
        if (pendingUpdate) {
            applyUpdate();
            return Promise.resolve({ data: pendingUpdate, error: null }).then(cb);
        }
        if (isDelete) {
            applyDelete();
            return Promise.resolve({ data: null, error: null }).then(cb);
        }
        const data = getFilteredDataPatched();
        return Promise.resolve({ data, count: data.length, error: null }).then(cb);
    };

    return chain;
};

// ─── Export ──────────────────────────────────────────────────────────────────
export const supabaseMock = {
    auth: {
        getSession: () => Promise.resolve({ data: { session: { user: mockUser } }, error: null }),
        getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
        onAuthStateChange: (cb) => {
            setTimeout(() => cb('SIGNED_IN', { user: mockUser }), 10);
            return { data: { subscription: { unsubscribe: () => { } } } };
        },
        signInWithPassword: () => Promise.resolve({ data: { user: mockUser }, error: null }),
        signUp: () => Promise.resolve({ data: { user: mockUser }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
    },
    from: (table) => createMockChain(table),
};

// Export store so other code can inspect data if needed
export { store as mockStore };
