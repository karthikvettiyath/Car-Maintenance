export const MOCK_VEHICLES = [
    {
        id: 1,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        mileage: 45000,
        image: 'https://images.unsplash.com/photo-1590362835106-1c41b3340476?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        color: 'White'
    },
    {
        id: 2,
        make: 'Honda',
        model: 'Civic',
        year: 2018,
        mileage: 72000,
        image: 'https://images.unsplash.com/photo-1626856555541-697b4ec8b22a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        color: 'Blue'
    }
];

export const MOCK_SERVICES = [
    {
        id: 1,
        vehicle_id: 1,
        service_type: 'Oil Change',
        date: '2025-10-15',
        mileage: 40000,
        cost: 50,
        notes: 'Synthetic oil used'
    },
    {
        id: 2,
        vehicle_id: 2,
        service_type: 'Tire Rotation',
        date: '2025-11-20',
        mileage: 70000,
        cost: 30,
        notes: 'All 4 tires'
    }
];

export const SERVICE_TYPES = [
    'Oil Change',
    'Tire Rotation',
    'Brake Inspection',
    'Insurance Renewal',
    'General Service',
    'Battery Check',
    'Coolant Flush'
];
