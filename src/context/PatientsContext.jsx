/* src/context/PatientsContext.jsx */
import React, { createContext, useState, useEffect } from 'react';
import {
  MAX_CAPACITY,
  TARGET_MORTALITY_RATE,
  TARGET_SUCCESS_RATE,
  getInitialPatients,
  savePatients,
  resetPatientsStorage,
  getTodayDate,
  getRelativeDate,
} from '../data/mockData';

export const PatientsContext = createContext(null);

const DEFAULT_FEVER_THRESHOLD = 38.0;
const ALL_ROOMS = Array.from({ length: MAX_CAPACITY }, (_, i) => `R-${101 + i}`);

export const PatientsProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => getInitialPatients());
  const [feverThreshold, setFeverThresholdState] = useState(() => {
    const stored = localStorage.getItem('factwise_fever_threshold');
    return stored ? Number(stored) : DEFAULT_FEVER_THRESHOLD;
  });

  useEffect(() => {
    savePatients(patients);
  }, [patients]);

  const setFeverThreshold = (val) => {
    const num = Number(val);
    if (!Number.isNaN(num) && num >= 35 && num <= 42) {
      setFeverThresholdState(num);
      localStorage.setItem('factwise_fever_threshold', String(num));
    }
  };

  // ---- Room Helpers ----
  const getOccupiedRooms = (list = patients) =>
    new Set(list.filter((p) => p.status === 'admitted' && p.roomNumber).map((p) => p.roomNumber));

  const getAvailableRooms = () => {
    const occupied = getOccupiedRooms();
    return ALL_ROOMS.filter((r) => !occupied.has(r));
  };

  // ---- Admission ----
  const addPatient = ({ name, age, roomNumber }) => {
    const admittedCount = patients.filter((p) => p.status === 'admitted').length;
    if (admittedCount >= MAX_CAPACITY) {
      throw new Error(`Facility is at full capacity (${MAX_CAPACITY}/${MAX_CAPACITY} beds occupied). Discharge a patient before admitting.`);
    }
    const available = getAvailableRooms();
    const assignedRoom = roomNumber && available.includes(roomNumber) ? roomNumber : available[0];
    if (!assignedRoom) {
      throw new Error('No available rooms found.');
    }

    const nextNum = 1001 + patients.length;
    const newPatient = {
      id: Date.now(),
      patientId: `FW-${nextNum}`,
      name: name.trim(),
      age: Number(age) || 35,
      roomNumber: assignedRoom,
      admissionDate: getTodayDate(),
      status: 'admitted',
      dischargeRecommended: false,
      temperatures: [],
      doctorVisits: [],
    };
    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  // ---- Temperature Recording (Nurse) ----
  const recordTemperature = (patientId, { date = getTodayDate(), value, recordedBy }) => {
    const tempVal = Number(value);
    if (Number.isNaN(tempVal) || tempVal < 34 || tempVal > 43) {
      throw new Error('Please enter a valid body temperature between 34.0°C and 43.0°C.');
    }

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found.');
    if (patient.status !== 'admitted') throw new Error('Temperature can only be recorded for admitted patients.');

    const existing = patient.temperatures.find((t) => t.date === date);
    if (existing) {
      throw new Error(`Temperature already recorded for ${patient.name} on ${date} (${existing.value}°C). Duplicate daily entries are blocked.`);
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              temperatures: [...p.temperatures, { date, value: tempVal, recordedBy, time }].sort((a, b) =>
                a.date.localeCompare(b.date)
              ),
            }
          : p
      )
    );
  };

  // ---- Doctor Visit ----
  const recordDoctorVisit = (patientId, { date = getTodayDate(), doctorName, treatment, notes, recommendDischarge = false }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found.');
    if (patient.status !== 'admitted') throw new Error('Doctor visits can only be logged for admitted patients.');

    const tempForDate = patient.temperatures.find((t) => t.date === date);
    if (!tempForDate) {
      throw new Error(`Cannot log doctor visit: ${patient.name}'s temperature has not been recorded by a nurse for ${date} yet.`);
    }

    const existingVisit = patient.doctorVisits.find((v) => v.date === date);
    if (existingVisit) {
      throw new Error(`Doctor visit already completed for ${patient.name} on ${date}.`);
    }

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              dischargeRecommended: recommendDischarge ? true : p.dischargeRecommended,
              dischargeRecommendedBy: recommendDischarge ? doctorName : p.dischargeRecommendedBy,
              doctorVisits: [
                ...p.doctorVisits,
                { date, doctorName, treatment: treatment || 'Routine Check', notes: notes || '' },
              ].sort((a, b) => a.date.localeCompare(b.date)),
            }
          : p
      )
    );
  };

  const recommendDischarge = (patientId, doctorName) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found.');
    if (!isEligibleForDischarge(patient)) {
      throw new Error('Patient has not completed 3 consecutive fever-free days yet.');
    }
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, dischargeRecommended: true, dischargeRecommendedBy: doctorName }
          : p
      )
    );
  };

  // ---- Discharge & Outcome (Admin / Doctor) ----
  const dischargePatient = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found.');
    if (patient.status !== 'admitted') throw new Error('Only admitted patients can be discharged.');
    if (!isEligibleForDischarge(patient)) {
      throw new Error('Discharge blocked: patient does not meet the 3-day no-fever criterion.');
    }

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'discharged',
              dischargeDate: getTodayDate(),
              roomNumber: null,
            }
          : p
      )
    );
  };

  const markDeceased = (patientId, reason = '') => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found.');
    if (patient.status !== 'admitted') throw new Error('Only admitted patients can be marked deceased.');

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'deceased',
              outcomeDate: getTodayDate(),
              roomNumber: null,
              doctorVisits: reason
                ? [
                    ...p.doctorVisits,
                    {
                      date: getTodayDate(),
                      doctorName: 'Clinical Outcome',
                      treatment: 'Deceased',
                      notes: reason,
                    },
                  ]
                : p.doctorVisits,
            }
          : p
      )
    );
  };

  // ---- Calculations ----
  const getNoFeverStreak = (patient) => {
    if (!patient.temperatures || patient.temperatures.length === 0) {
      return { streak: 0, eligible: false, lastTemp: null };
    }
    const sorted = [...patient.temperatures].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];

    // Walk backwards day-by-day from the latest recorded temperature date
    let streak = 0;
    const anchor = new Date(latest.date + 'T00:00:00');
    for (let i = 0; i < 14; i++) {
      const d = new Date(anchor);
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const rec = sorted.find((t) => t.date === iso);
      if (!rec || rec.value >= feverThreshold) {
        break;
      }
      streak += 1;
    }

    return {
      streak,
      eligible: streak >= 3,
      lastTemp: latest,
    };
  };

  const isEligibleForDischarge = (patient) => {
    return patient.status === 'admitted' && getNoFeverStreak(patient).eligible;
  };

  const getTodayStatus = (patient) => {
    const today = getTodayDate();
    const tempToday = patient.temperatures.find((t) => t.date === today) || null;
    const visitToday = patient.doctorVisits.find((v) => v.date === today) || null;
    const isAdmitted = patient.status === 'admitted';
    return {
      tempToday,
      visitToday,
      needsTemp: isAdmitted && !tempToday,
      needsDoctor: isAdmitted && Boolean(tempToday) && !visitToday,
      blockedForDoctor: isAdmitted && !tempToday,
      completedToday: isAdmitted && Boolean(tempToday) && Boolean(visitToday),
    };
  };

  const getStats = () => {
    const admittedList = patients.filter((p) => p.status === 'admitted');
    const admitted = admittedList.length;
    const availableBeds = MAX_CAPACITY - admitted;
    const discharged = patients.filter((p) => p.status === 'discharged').length;
    const deceased = patients.filter((p) => p.status === 'deceased').length;
    const closedCases = discharged + deceased;

    const mortalityRate = closedCases > 0 ? (deceased / closedCases) * 100 : 0;
    const successRate = closedCases > 0 ? (discharged / closedCases) * 100 : 100;
    const isMortalityAlert = closedCases > 0 && mortalityRate > TARGET_MORTALITY_RATE;

    let needsTempCount = 0;
    let readyForDoctorCount = 0;
    let visitedTodayCount = 0;
    let dischargeEligibleCount = 0;
    let dischargeQueueCount = 0;

    for (const p of admittedList) {
      const ts = getTodayStatus(p);
      if (ts.needsTemp) needsTempCount += 1;
      if (ts.needsDoctor) readyForDoctorCount += 1;
      if (ts.completedToday) visitedTodayCount += 1;
      if (isEligibleForDischarge(p)) {
        dischargeEligibleCount += 1;
        if (p.dischargeRecommended) dischargeQueueCount += 1;
      }
    }

    return {
      admitted,
      availableBeds,
      maxCapacity: MAX_CAPACITY,
      discharged,
      deceased,
      closedCases,
      mortalityRate,
      successRate,
      targetMortalityRate: TARGET_MORTALITY_RATE,
      targetSuccessRate: TARGET_SUCCESS_RATE,
      isMortalityAlert,
      needsTempCount,
      readyForDoctorCount,
      visitedTodayCount,
      dischargeEligibleCount,
      dischargeQueueCount,
    };
  };

  // ---- Demo Helpers ----
  const simulateFullCapacity = () => {
    const available = getAvailableRooms();
    if (available.length === 0) return 0;
    const today = getTodayDate();
    const yesterday = getRelativeDate(-1);
    const added = available.map((room, idx) => ({
      id: Date.now() + idx + 1,
      patientId: `FW-${2000 + idx}`,
      name: `Ward Patient ${room}`,
      age: 30 + (idx % 35),
      roomNumber: room,
      admissionDate: yesterday,
      status: 'admitted',
      dischargeRecommended: false,
      temperatures:
        idx % 2 === 0
          ? [{ date: today, value: 38.2, recordedBy: 'Nurse Joy', time: '08:00' }]
          : [{ date: yesterday, value: 38.5, recordedBy: 'Nurse Joy', time: '08:00' }],
      doctorVisits: [],
    }));
    setPatients((prev) => [...prev, ...added]);
    return added.length;
  };

  const resetDemoData = () => {
    const fresh = resetPatientsStorage();
    setPatients(fresh);
  };

  return (
    <PatientsContext.Provider
      value={{
        patients,
        feverThreshold,
        setFeverThreshold,
        ALL_ROOMS,
        getAvailableRooms,
        addPatient,
        recordTemperature,
        recordDoctorVisit,
        recommendDischarge,
        dischargePatient,
        markDeceased,
        getNoFeverStreak,
        isEligibleForDischarge,
        getTodayStatus,
        getStats,
        simulateFullCapacity,
        resetDemoData,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
};
