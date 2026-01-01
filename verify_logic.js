
import { calculateServiceStatus } from './src/utils/maintenance.js';

console.log("--- START TEST ---");

// Mock Data
const serviceType_Oil = { name: "Oil Change", interval_km: 5000, interval_months: 6 };

let failed = false;

// Scenario 1: Fresh Car
const res1 = calculateServiceStatus(serviceType_Oil, { last_performed_mileage: 50000, last_performed_date: new Date().toISOString() }, 50000);
if (res1.status === 'OK') console.log("SCENARIO 1: PASS");
else { console.log("SCENARIO 1: FAIL", res1); failed = true; }

// Scenario 2: Overdue Car
const res2 = calculateServiceStatus(serviceType_Oil, { last_performed_mileage: 50000, last_performed_date: new Date().toISOString() }, 56000);
if (res2.status === 'DUE') console.log("SCENARIO 2: PASS");
else { console.log("SCENARIO 2: FAIL", res2); failed = true; }

// Scenario 3: Upcoming Alert
const res3 = calculateServiceStatus(serviceType_Oil, { last_performed_mileage: 50000, last_performed_date: new Date().toISOString() }, 54500);
if (res3.status === 'UPCOMING') console.log("SCENARIO 3: PASS");
else { console.log("SCENARIO 3: FAIL", res3); failed = true; }

// Scenario 4: The "Fix" - Logged Service (Reset)
const res4 = calculateServiceStatus(serviceType_Oil, { last_performed_mileage: 56000, last_performed_date: new Date().toISOString() }, 56000);
if (res4.status === 'OK') console.log("SCENARIO 4: PASS");
else { console.log("SCENARIO 4: FAIL", res4); failed = true; }

if (failed) process.exit(1);
console.log("--- ALL TESTS PASSED ---");
