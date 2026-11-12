/* src/data/mockData.js */

export const MAX_CAPACITY = 74;
export const TARGET_MORTALITY_RATE = 15;
export const TARGET_SUCCESS_RATE = 85;

// Helper to get YYYY-MM-DD relative to today
export function getRelativeDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return getRelativeDate(0);
}

export function buildDefaultPatients() {
  const d0 = getRelativeDate(0);  // today
  const d1 = getRelativeDate(-1); // yesterday
  const d2 = getRelativeDate(-2); // 2 days ago
  const d3 = getRelativeDate(-3);
  const d4 = getRelativeDate(-4);
  const d5 = getRelativeDate(-5);
  const d6 = getRelativeDate(-6);

  return [
    // 1. Admitted: 3 full days no fever + doctor recommended discharge -> Ready in Admin Queue!
    {
      id: 1,
      patientId: 'FW-1001',
      name: 'Aarav Sharma',
      age: 34,
      roomNumber: 'R-101',
      admissionDate: d5,
      status: 'admitted',
      dischargeRecommended: true,
      dischargeRecommendedBy: 'Dr. House',
      temperatures: [
        { date: d4, value: 39.1, recordedBy: 'Nurse Joy', time: '08:15' },
        { date: d3, value: 38.4, recordedBy: 'Nurse Joy', time: '08:20' },
        { date: d2, value: 37.3, recordedBy: 'Nurse Joy', time: '08:10' },
        { date: d1, value: 36.9, recordedBy: 'Nurse Joy', time: '08:05' },
        { date: d0, value: 36.7, recordedBy: 'Nurse Joy', time: '08:12' },
      ],
      doctorVisits: [
        { date: d4, doctorName: 'Dr. House', treatment: 'Antipyretics + IV Fluids', notes: 'High fever on admission.' },
        { date: d2, doctorName: 'Dr. House', treatment: 'Oral Hydration', notes: 'Fever broke, monitoring 3-day window.' },
        { date: d0, doctorName: 'Dr. House', treatment: 'Observation', notes: '3 consecutive fever-free days achieved. Recommended for discharge.' },
      ],
    },
    // 2. Admitted: 3 full days no fever (including today), temp taken today, needs Doctor visit to confirm discharge!
    {
      id: 2,
      patientId: 'FW-1002',
      name: 'Priya Nair',
      age: 29,
      roomNumber: 'R-102',
      admissionDate: d4,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d4, value: 38.9, recordedBy: 'Nurse Joy', time: '09:00' },
        { date: d3, value: 38.2, recordedBy: 'Nurse Joy', time: '08:45' },
        { date: d2, value: 37.4, recordedBy: 'Nurse Joy', time: '08:30' },
        { date: d1, value: 37.1, recordedBy: 'Nurse Joy', time: '08:25' },
        { date: d0, value: 36.8, recordedBy: 'Nurse Joy', time: '08:15' },
      ],
      doctorVisits: [
        { date: d3, doctorName: 'Dr. House', treatment: 'Paracetamol 500mg', notes: 'Responding well to treatment.' },
        { date: d1, doctorName: 'Dr. House', treatment: 'Supportive Care', notes: 'Day 2 without fever.' },
      ],
    },
    // 3. Admitted: Temp taken today (still has fever), awaiting Doctor visit today
    {
      id: 3,
      patientId: 'FW-1003',
      name: 'Marcus Vance',
      age: 52,
      roomNumber: 'R-103',
      admissionDate: d3,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d3, value: 39.4, recordedBy: 'Nurse Joy', time: '10:00' },
        { date: d2, value: 38.8, recordedBy: 'Nurse Joy', time: '08:40' },
        { date: d1, value: 38.5, recordedBy: 'Nurse Joy', time: '08:50' },
        { date: d0, value: 38.3, recordedBy: 'Nurse Joy', time: '08:20' },
      ],
      doctorVisits: [
        { date: d2, doctorName: 'Dr. House', treatment: 'Antiviral Protocol A', notes: 'Persistent fever; continue close monitoring.' },
        { date: d1, doctorName: 'Dr. House', treatment: 'Antiviral Protocol A + Fluids', notes: 'Slight improvement, still febrile.' },
      ],
    },
    // 4. Admitted: Needs Nurse temperature today (2 days no fever so far - today could be day 3!)
    {
      id: 4,
      patientId: 'FW-1004',
      name: 'Elena Rostova',
      age: 41,
      roomNumber: 'R-104',
      admissionDate: d4,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d4, value: 38.7, recordedBy: 'Nurse Joy', time: '09:30' },
        { date: d3, value: 38.1, recordedBy: 'Nurse Joy', time: '09:10' },
        { date: d2, value: 37.2, recordedBy: 'Nurse Joy', time: '08:55' },
        { date: d1, value: 36.9, recordedBy: 'Nurse Joy', time: '08:40' },
      ],
      doctorVisits: [
        { date: d2, doctorName: 'Dr. House', treatment: 'Standard Supportive Care', notes: 'Afebrile day 1.' },
        { date: d1, doctorName: 'Dr. House', treatment: 'Standard Supportive Care', notes: 'Afebrile day 2. Check tomorrow for discharge.' },
      ],
    },
    // 5. Admitted: Needs Nurse temperature today (high fever yesterday)
    {
      id: 5,
      patientId: 'FW-1005',
      name: 'Liam O\'Connor',
      age: 63,
      roomNumber: 'R-105',
      admissionDate: d2,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d2, value: 39.6, recordedBy: 'Nurse Joy', time: '11:00' },
        { date: d1, value: 39.2, recordedBy: 'Nurse Joy', time: '08:30' },
      ],
      doctorVisits: [
        { date: d1, doctorName: 'Dr. House', treatment: 'Oxygen + Antipyretics', notes: 'High-risk age group, monitor closely.' },
      ],
    },
    // 6. Admitted: Newly admitted today, needs initial Nurse temperature
    {
      id: 6,
      patientId: 'FW-1006',
      name: 'Sophia Chen',
      age: 26,
      roomNumber: 'R-106',
      admissionDate: d0,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [],
      doctorVisits: [],
    },
    // 7. Admitted: Both Nurse temp and Doctor visit completed today
    {
      id: 7,
      patientId: 'FW-1007',
      name: 'Vikram Patel',
      age: 47,
      roomNumber: 'R-107',
      admissionDate: d3,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d3, value: 38.6, recordedBy: 'Nurse Joy', time: '09:15' },
        { date: d2, value: 38.3, recordedBy: 'Nurse Joy', time: '08:25' },
        { date: d1, value: 37.6, recordedBy: 'Nurse Joy', time: '08:30' },
        { date: d0, value: 37.2, recordedBy: 'Nurse Joy', time: '08:10' },
      ],
      doctorVisits: [
        { date: d1, doctorName: 'Dr. House', treatment: 'Oral Antipyretics', notes: 'First day without fever.' },
        { date: d0, doctorName: 'Dr. House', treatment: 'Observation', notes: 'Day 2 without fever. One more fever-free day needed.' },
      ],
    },
    // 8. Admitted: Needs Nurse temp today
    {
      id: 8,
      patientId: 'FW-1008',
      name: 'Fatima Al-Mansoor',
      age: 38,
      roomNumber: 'R-108',
      admissionDate: d2,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [
        { date: d2, value: 38.5, recordedBy: 'Nurse Joy', time: '14:20' },
        { date: d1, value: 37.8, recordedBy: 'Nurse Joy', time: '09:05' },
      ],
      doctorVisits: [
        { date: d1, doctorName: 'Dr. House', treatment: 'Supportive Care', notes: 'Fever subsiding.' },
      ],
    },

    // Historical Closed Outcomes (to make Mortality Rate & Success Rate meaningful!)
    // 13 Discharged, 2 Deceased -> 15 closed cases: 2/15 = 13.3% mortality (<=15% target), 13/15 = 86.7% success (>=85% benchmark)
    ...Array.from({ length: 13 }, (_, idx) => ({
      id: 100 + idx,
      patientId: `FW-09${String(idx + 1).padStart(2, '0')}`,
      name: [
        'Rohan Verma', 'Mei Lin', 'Carlos Mendez', 'Hannah Abbott',
        'David Kim', 'Ananya Iyer', 'Lucas Silva', 'Nadia Koury',
        'Ethan Wright', 'Zara Khan', 'Oliver Brown', 'Chloe Dubois', 'Kenji Sato'
      ][idx],
      age: 24 + (idx * 3),
      roomNumber: null,
      admissionDate: d6,
      dischargeDate: d1,
      status: 'discharged',
      dischargeRecommended: true,
      temperatures: [
        { date: d5, value: 38.6, recordedBy: 'Nurse Joy', time: '08:00' },
        { date: d4, value: 37.4, recordedBy: 'Nurse Joy', time: '08:00' },
        { date: d3, value: 37.0, recordedBy: 'Nurse Joy', time: '08:00' },
        { date: d2, value: 36.8, recordedBy: 'Nurse Joy', time: '08:00' },
      ],
      doctorVisits: [
        { date: d2, doctorName: 'Dr. House', treatment: 'Discharged after 3-day no-fever', notes: 'Cleared for discharge.' },
      ],
    })),
    {
      id: 201,
      patientId: 'FW-0891',
      name: 'George Miller',
      age: 76,
      roomNumber: null,
      admissionDate: d6,
      outcomeDate: d2,
      status: 'deceased',
      temperatures: [
        { date: d6, value: 39.8, recordedBy: 'Nurse Joy', time: '08:00' },
        { date: d5, value: 40.1, recordedBy: 'Nurse Joy', time: '08:00' },
      ],
      doctorVisits: [
        { date: d5, doctorName: 'Dr. House', treatment: 'ICU Respiratory Support', notes: 'Critical condition.' },
      ],
    },
    {
      id: 202,
      patientId: 'FW-0892',
      name: 'Martha Stewart',
      age: 71,
      roomNumber: null,
      admissionDate: d5,
      outcomeDate: d1,
      status: 'deceased',
      temperatures: [
        { date: d5, value: 39.5, recordedBy: 'Nurse Joy', time: '08:00' },
        { date: d4, value: 39.9, recordedBy: 'Nurse Joy', time: '08:00' },
      ],
      doctorVisits: [
        { date: d4, doctorName: 'Dr. House', treatment: 'Intensive Care', notes: 'Severe complications.' },
      ],
    },
  ];
}

const STORAGE_KEY = 'factwise_patients_v2';

export const getInitialPatients = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback to default
    }
  }
  const initial = buildDefaultPatients();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const savePatients = (patients) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

export const resetPatientsStorage = () => {
  const initial = buildDefaultPatients();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};
