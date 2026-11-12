/* src/components/Modals.jsx */
import React, { useState, useContext } from 'react';
import { PatientsContext } from '../context/PatientsContext';
import { AuthContext } from '../context/AuthContext';
import { getTodayDate } from '../data/mockData';
import { AlertTriangleIcon, CheckCircleIcon, StethoscopeIcon, ThermometerIcon } from './Icons';

export function RecordTempModal({ patient, onClose }) {
  const { recordTemperature, feverThreshold } = useContext(PatientsContext);
  const { user } = useContext(AuthContext);
  const [value, setValue] = useState('37.0');
  const [error, setError] = useState('');

  if (!patient) return null;

  const numVal = Number(value);
  const isFever = !Number.isNaN(numVal) && numVal >= feverThreshold;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      recordTemperature(patient.id, {
        date: getTodayDate(),
        value: numVal,
        recordedBy: user?.name || 'Nurse',
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
            <ThermometerIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Daily Temperature</h3>
            <p className="text-xs text-slate-500">
              {patient.name} ({patient.patientId}) • Room {patient.roomNumber}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="text"
              disabled
              value={getTodayDate()}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              min="34.0"
              max="43.0"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Fever threshold: ≥ {feverThreshold.toFixed(1)}°C</span>
              {!Number.isNaN(numVal) && value !== '' && (
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    isFever ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isFever ? 'Fever Detected' : 'No Fever (Afebrile)'}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
            >
              Save Temperature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DoctorVisitModal({ patient, onClose }) {
  const { recordDoctorVisit, getTodayStatus, getNoFeverStreak, feverThreshold } = useContext(PatientsContext);
  const { user } = useContext(AuthContext);
  const [treatment, setTreatment] = useState('Supportive Care & Hydration');
  const [notes, setNotes] = useState('');
  const [recommendDischarge, setRecommendDischarge] = useState(false);
  const [error, setError] = useState('');

  if (!patient) return null;

  const todayStatus = getTodayStatus(patient);
  const streakInfo = getNoFeverStreak(patient);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      recordDoctorVisit(patient.id, {
        date: getTodayDate(),
        doctorName: user?.name || 'Dr. House',
        treatment,
        notes,
        recommendDischarge: streakInfo.eligible && recommendDischarge,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <StethoscopeIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Log Doctor Round</h3>
            <p className="text-xs text-slate-500">
              {patient.name} ({patient.patientId}) • Room {patient.roomNumber}
            </p>
          </div>
        </div>

        {/* Temp-first enforcement check */}
        {!todayStatus.tempToday ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
              <span>Blocked: Today&apos;s Temperature Not Recorded</span>
            </div>
            <p className="text-xs text-amber-800">
              Per facility protocol, a nurse must record the patient&apos;s daily temperature before the doctor visit so you don&apos;t waste round time or miss fever trends.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Today's Temp Summary */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Today&apos;s Nurse Reading ({todayStatus.tempToday.time})</div>
                <div className="text-lg font-bold text-slate-900">
                  {todayStatus.tempToday.value.toFixed(1)}°C
                  <span
                    className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      todayStatus.tempToday.value >= feverThreshold
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {todayStatus.tempToday.value >= feverThreshold ? 'Fever' : 'Afebrile'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">No-Fever Streak</div>
                <div className="text-sm font-bold text-slate-900">
                  {streakInfo.streak} / 3 Days
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Treatment Administered
              </label>
              <input
                type="text"
                required
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clinical Notes
              </label>
              <textarea
                rows={3}
                placeholder="Observations, symptom progression..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {streakInfo.eligible && !patient.dischargeRecommended && (
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recommendDischarge}
                  onChange={(e) => setRecommendDischarge(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 rounded"
                />
                <div className="text-xs">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    Recommend for Discharge (3-Day No-Fever Met)
                  </div>
                  <div className="text-emerald-700">
                    Notifies Admin staff immediately to process discharge and free Room {patient.roomNumber}.
                  </div>
                </div>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Complete Visit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function AdmitPatientModal({ onClose }) {
  const { addPatient, getAvailableRooms, getStats } = useContext(PatientsContext);
  const availableRooms = getAvailableRooms();
  const stats = getStats();

  const [name, setName] = useState('');
  const [age, setAge] = useState('35');
  const [roomNumber, setRoomNumber] = useState(availableRooms[0] || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      addPatient({ name, age: Number(age), roomNumber });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Admit New Patient</h3>
        <p className="text-xs text-slate-500 mb-4">
          Current Occupancy: {stats.admitted} / {stats.maxCapacity} beds ({stats.availableBeds} available)
        </p>

        {availableRooms.length === 0 ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm space-y-3">
            <div className="font-semibold flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              <span>Facility at Full Capacity (74 / 74)</span>
            </div>
            <p className="text-xs">
              All 74 quarantine rooms are currently occupied. Discharge an eligible patient before admitting new patients.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Jordan Taylor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="110"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Room</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
              >
                Admit Patient
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
