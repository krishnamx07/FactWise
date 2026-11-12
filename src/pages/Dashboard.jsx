/* src/pages/Dashboard.jsx */
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { PatientsContext } from '../context/PatientsContext';
import { AuthContext } from '../context/AuthContext';
import { RecordTempModal, DoctorVisitModal, AdmitPatientModal } from '../components/Modals';
import {
  BedIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  StethoscopeIcon,
  ThermometerIcon,
} from '../components/Icons';

export default function Dashboard() {
  const {
    patients,
    getStats,
    getTodayStatus,
    getNoFeverStreak,
    isEligibleForDischarge,
    dischargePatient,
    feverThreshold,
  } = useContext(PatientsContext);
  const { user } = useContext(AuthContext);

  const [tempModalPatient, setTempModalPatient] = useState(null);
  const [visitModalPatient, setVisitModalPatient] = useState(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  const stats = getStats();
  const admittedPatients = patients.filter((p) => p.status === 'admitted');
  const needsTempList = admittedPatients.filter((p) => getTodayStatus(p).needsTemp);
  const readyForDoctorList = admittedPatients.filter((p) => getTodayStatus(p).needsDoctor);
  const dischargeQueueList = admittedPatients.filter((p) => isEligibleForDischarge(p));

  const occupancyPct = Math.round((stats.admitted / stats.maxCapacity) * 100);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Operations Dashboard</h1>
            <p className="text-sm text-slate-500">
              Signed in as <strong>{user?.name}</strong> ({user?.title}) • Fever Threshold:{' '}
              <strong>{feverThreshold.toFixed(1)}°C</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowAdmitModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition cursor-pointer shadow-xs"
              >
                <PlusIcon className="w-4 h-4" />
                Admit Patient
              </button>
            )}
            <Link
              to="/patients"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              View All Patients
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Occupancy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Facility Occupancy
              </span>
              <BedIcon className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.admitted} <span className="text-base font-normal text-slate-500">/ {stats.maxCapacity} beds</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  occupancyPct >= 95 ? 'bg-red-500' : 'bg-sky-600'
                }`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{stats.availableBeds} rooms currently available</p>
          </div>

          {/* Nurse Temp Progress */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Today&apos;s Temperatures
              </span>
              <ThermometerIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.admitted - stats.needsTempCount}{' '}
              <span className="text-base font-normal text-slate-500">/ {stats.admitted} done</span>
            </div>
            <p className="text-xs mt-2 font-medium text-amber-700">
              {stats.needsTempCount} patients still need temperature taken
            </p>
          </div>

          {/* Doctor Rounds Progress */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Doctor Rounds Today
              </span>
              <StethoscopeIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.visitedTodayCount}{' '}
              <span className="text-base font-normal text-slate-500">visited</span>
            </div>
            <p className="text-xs mt-2 text-slate-600">
              <strong className="text-emerald-700">{stats.readyForDoctorCount} ready now</strong> •{' '}
              {stats.needsTempCount} waiting for nurse
            </p>
          </div>

          {/* Quality & Mortality */}
          <div
            className={`rounded-xl border p-5 shadow-2xs ${
              stats.isMortalityAlert
                ? 'bg-red-50 border-red-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Treatment Quality
              </span>
              <CheckCircleIcon
                className={`w-5 h-5 ${stats.isMortalityAlert ? 'text-red-600' : 'text-emerald-600'}`}
              />
            </div>
            <div className="flex items-baseline gap-3">
              <div>
                <div className={`text-2xl font-bold ${stats.isMortalityAlert ? 'text-red-700' : 'text-slate-900'}`}>
                  {stats.mortalityRate.toFixed(1)}%
                </div>
                <div className="text-[11px] text-slate-500">Mortality (≤15%)</div>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <div className="text-2xl font-bold text-emerald-700">
                  {stats.successRate.toFixed(1)}%
                </div>
                <div className="text-[11px] text-slate-500">Success (≥85%)</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Based on {stats.closedCases} closed cases ({stats.discharged} cured, {stats.deceased} deceased)
            </p>
          </div>
        </div>

        {/* Role-Focused Action Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue 1: Needs Nurse Temperature Today */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Pending Nurse Temperature ({needsTempList.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">Step 1 of Daily Care</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {needsTempList.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  All admitted patients have had their temperature recorded today!
                </div>
              ) : (
                needsTempList.map((p) => {
                  const streak = getNoFeverStreak(p);
                  return (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <Link to={`/patients/${p.id}`} className="font-semibold text-sm text-slate-900 hover:text-sky-600">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-500">
                          Room {p.roomNumber} • {p.patientId} • Streak: {streak.streak}/3 days no-fever
                        </div>
                      </div>
                      {user?.role === 'nurse' ? (
                        <button
                          onClick={() => setTempModalPatient(p)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 cursor-pointer shrink-0"
                        >
                          Record Temp
                        </button>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">
                          Awaiting Nurse
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Queue 2: Ready for Doctor Visit OR Discharge Queue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <StethoscopeIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  {user?.role === 'admin'
                    ? `Discharge Ready Queue (${dischargeQueueList.length})`
                    : `Ready for Doctor Round (${readyForDoctorList.length})`}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {user?.role === 'admin' ? '3-Day No-Fever Met' : 'Step 2 of Daily Care'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {user?.role === 'admin' ? (
                dischargeQueueList.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No patients currently eligible for discharge.
                  </div>
                ) : (
                  dischargeQueueList.map((p) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <Link to={`/patients/${p.id}`} className="font-semibold text-sm text-slate-900 hover:text-sky-600">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-500">
                          Room {p.roomNumber} •{' '}
                          {p.dischargeRecommended ? (
                            <span className="text-emerald-700 font-semibold">
                              Recommended by {p.dischargeRecommendedBy || 'Doctor'}
                            </span>
                          ) : (
                            <span>3-day no-fever met (awaiting doctor sign-off)</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dischargePatient(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shrink-0"
                      >
                        Discharge
                      </button>
                    </div>
                  ))
                )
              ) : readyForDoctorList.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No patients waiting for a doctor visit right now.
                </div>
              ) : (
                readyForDoctorList.map((p) => {
                  const ts = getTodayStatus(p);
                  const eligible = isEligibleForDischarge(p);
                  return (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link to={`/patients/${p.id}`} className="font-semibold text-sm text-slate-900 hover:text-sky-600">
                            {p.name}
                          </Link>
                          {eligible && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              3-Day Cured
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Room {p.roomNumber} • Today&apos;s Temp:{' '}
                          <strong className={ts.tempToday.value >= feverThreshold ? 'text-red-600' : 'text-emerald-700'}>
                            {ts.tempToday.value.toFixed(1)}°C
                          </strong>
                        </div>
                      </div>
                      {user?.role === 'doctor' ? (
                        <button
                          onClick={() => setVisitModalPatient(p)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shrink-0"
                        >
                          Log Visit
                        </button>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Ready for Doctor
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {tempModalPatient && (
        <RecordTempModal patient={tempModalPatient} onClose={() => setTempModalPatient(null)} />
      )}
      {visitModalPatient && (
        <DoctorVisitModal patient={visitModalPatient} onClose={() => setVisitModalPatient(null)} />
      )}
      {showAdmitModal && <AdmitPatientModal onClose={() => setShowAdmitModal(false)} />}
    </Layout>
  );
}
