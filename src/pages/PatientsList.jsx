/* src/pages/PatientsList.jsx */
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { PatientsContext } from '../context/PatientsContext';
import { AuthContext } from '../context/AuthContext';
import { RecordTempModal, DoctorVisitModal, AdmitPatientModal } from '../components/Modals';
import { PlusIcon } from '../components/Icons';

export default function PatientsList() {
  const {
    patients,
    getTodayStatus,
    getNoFeverStreak,
    isEligibleForDischarge,
    recommendDischarge,
    dischargePatient,
    feverThreshold,
  } = useContext(PatientsContext);
  const { user } = useContext(AuthContext);

  const [filter, setFilter] = useState('admitted');
  const [search, setSearch] = useState('');
  const [tempModalPatient, setTempModalPatient] = useState(null);
  const [visitModalPatient, setVisitModalPatient] = useState(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  const admitted = patients.filter((p) => p.status === 'admitted');
  const tabs = [
    { id: 'admitted', label: 'All Admitted', count: admitted.length },
    { id: 'needs_temp', label: 'Needs Temp', count: admitted.filter((p) => getTodayStatus(p).needsTemp).length },
    { id: 'ready_doctor', label: 'Ready for Doctor', count: admitted.filter((p) => getTodayStatus(p).needsDoctor).length },
    { id: 'discharge_ready', label: 'Discharge Ready', count: admitted.filter((p) => isEligibleForDischarge(p)).length },
    { id: 'discharged', label: 'Discharged', count: patients.filter((p) => p.status === 'discharged').length },
    { id: 'deceased', label: 'Deceased', count: patients.filter((p) => p.status === 'deceased').length },
  ];

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase()) ||
      (p.roomNumber && p.roomNumber.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    const ts = getTodayStatus(p);
    switch (filter) {
      case 'admitted':
        return p.status === 'admitted';
      case 'needs_temp':
        return p.status === 'admitted' && ts.needsTemp;
      case 'ready_doctor':
        return p.status === 'admitted' && ts.needsDoctor;
      case 'discharge_ready':
        return isEligibleForDischarge(p);
      case 'discharged':
        return p.status === 'discharged';
      case 'deceased':
        return p.status === 'deceased';
      default:
        return true;
    }
  });

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Ward Directory</h1>
            <p className="text-sm text-slate-500">
              Track daily temperature measurements, doctor rounds, and 3-day no-fever discharge eligibility.
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAdmitModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              Admit Patient
            </button>
          )}
        </div>

        {/* Search & Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <input
              type="text"
              placeholder="Search by patient name, ID (e.g. FW-1001), or room (e.g. R-101)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  filter === tab.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    filter === tab.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Today&apos;s Temp</th>
                  <th className="py-3 px-4">Today&apos;s Doctor Round</th>
                  <th className="py-3 px-4">3-Day No-Fever</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No patients match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const ts = getTodayStatus(p);
                    const streak = getNoFeverStreak(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                          {p.roomNumber ? (
                            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                              {p.roomNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/patients/${p.id}`}
                            className="font-semibold text-slate-900 hover:text-sky-600"
                          >
                            {p.name}
                          </Link>
                          <div className="text-xs text-slate-500">
                            {p.patientId} • Age {p.age} • Admitted {p.admissionDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status !== 'admitted' ? (
                            <span className="text-xs text-slate-400 capitalize">{p.status}</span>
                          ) : ts.tempToday ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                ts.tempToday.value >= feverThreshold
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {ts.tempToday.value.toFixed(1)}°C
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status !== 'admitted' ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : ts.visitToday ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Visited ✓
                            </span>
                          ) : ts.tempToday ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                              Ready for Doctor
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                              Waiting for Temp
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status === 'discharged' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                              Discharged
                            </span>
                          ) : p.status === 'deceased' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Deceased
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  streak.eligible
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {streak.streak} / 3 Days
                              </span>
                              {p.dischargeRecommended && (
                                <span className="text-[11px] font-semibold text-emerald-700">
                                  • Recommended
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {p.status === 'admitted' && user?.role === 'nurse' && ts.needsTemp && (
                              <button
                                onClick={() => setTempModalPatient(p)}
                                className="px-2.5 py-1 rounded-md bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 cursor-pointer"
                              >
                                Record Temp
                              </button>
                            )}
                            {p.status === 'admitted' && user?.role === 'doctor' && !ts.visitToday && (
                              <button
                                onClick={() => setVisitModalPatient(p)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                                  ts.tempToday
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                {ts.tempToday ? 'Log Visit' : 'Blocked (No Temp)'}
                              </button>
                            )}
                            {p.status === 'admitted' &&
                              user?.role === 'doctor' &&
                              streak.eligible &&
                              !p.dischargeRecommended && (
                                <button
                                  onClick={() => recommendDischarge(p.id, user.name)}
                                  className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                                >
                                  Recommend Discharge
                                </button>
                              )}
                            {p.status === 'admitted' && user?.role === 'admin' && streak.eligible && (
                              <button
                                onClick={() => dischargePatient(p.id)}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                              >
                                Discharge
                              </button>
                            )}
                            <Link
                              to={`/patients/${p.id}`}
                              className="px-2.5 py-1 rounded-md border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
                            >
                              Chart
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
