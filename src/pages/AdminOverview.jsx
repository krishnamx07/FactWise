/* src/pages/AdminOverview.jsx */
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { PatientsContext } from '../context/PatientsContext';
import { AdmitPatientModal } from '../components/Modals';
import { AlertTriangleIcon, BedIcon, CheckCircleIcon, PlusIcon } from '../components/Icons';

export default function AdminOverview() {
  const {
    patients,
    ALL_ROOMS,
    getStats,
    getTodayStatus,
    isEligibleForDischarge,
    dischargePatient,
    feverThreshold,
    setFeverThreshold,
    simulateFullCapacity,
    resetDemoData,
  } = useContext(PatientsContext);

  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [notice, setNotice] = useState('');

  const stats = getStats();
  const admitted = patients.filter((p) => p.status === 'admitted');
  const roomMap = new Map(admitted.map((p) => [p.roomNumber, p]));
  const dischargeEligible = admitted.filter((p) => isEligibleForDischarge(p));

  const handleSimulateFull = () => {
    const added = simulateFullCapacity();
    setNotice(
      added > 0
        ? `Simulated full capacity: added ${added} patients to reach 74/74 beds.`
        : 'Facility is already at 74/74 full capacity.'
    );
  };

  const handleReset = () => {
    resetDemoData();
    setNotice('Demo data reset to initial facility state.');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin & 74-Bed Facility Overview</h1>
            <p className="text-sm text-slate-500">
              Manage room capacity, process doctor-approved discharges, and monitor treatment benchmarks.
            </p>
          </div>
          <button
            onClick={() => setShowAdmitModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            Admit Patient ({stats.availableBeds} Free)
          </button>
        </div>

        {notice && (
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} className="text-xs font-semibold underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Quality & Discharge Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discharge Queue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Discharge Queue ({dischargeEligible.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">3-Day No-Fever Criterion</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {dischargeEligible.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No patients currently ready for discharge.
                </div>
              ) : (
                dischargeEligible.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div>
                      <Link to={`/patients/${p.id}`} className="font-semibold text-sm text-slate-900 hover:text-sky-600">
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        Room {p.roomNumber} •{' '}
                        {p.dischargeRecommended ? (
                          <span className="text-emerald-700 font-semibold">
                            Doctor Approved ({p.dischargeRecommendedBy})
                          </span>
                        ) : (
                          <span className="text-amber-700">Eligible (Doctor sign-off optional)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => dischargePatient(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shrink-0"
                    >
                      Discharge & Free Bed
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quality Benchmarks & Prototype Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm mb-3">Facility Quality Benchmarks</h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border ${
                    stats.isMortalityAlert ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs text-slate-500">Mortality Rate</div>
                  <div className={`text-2xl font-bold mt-1 ${stats.isMortalityAlert ? 'text-red-700' : 'text-slate-900'}`}>
                    {stats.mortalityRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Target: ≤ {stats.targetMortalityRate}% ({stats.deceased} deceased)
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200">
                  <div className="text-xs text-slate-500">Treatment Success Rate</div>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    {stats.successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Benchmark: ≥ {stats.targetSuccessRate}% ({stats.discharged} cured)
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fever Threshold (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="36"
                  max="40"
                  value={feverThreshold}
                  onChange={(e) => setFeverThreshold(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-28"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSimulateFull}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 cursor-pointer"
                >
                  Simulate 74/74 Full Capacity
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 74-Room Visual Ward Map */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <BedIcon className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                74-Room Quarantine Ward Map ({stats.admitted} Occupied / {stats.availableBeds} Available)
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" /> Needs Temp
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-sky-100 border border-sky-400 inline-block" /> In Care
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500 inline-block" /> Discharge Ready
              </span>
            </div>
          </div>

          {stats.admitted >= stats.maxCapacity && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold">
              <AlertTriangleIcon className="w-4 h-4 text-red-600" />
              <span>Ward at 100% capacity (74/74). New admissions are blocked until a room is freed.</span>
            </div>
          )}

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {ALL_ROOMS.map((room) => {
              const occupant = roomMap.get(room);
              if (!occupant) {
                return (
                  <div
                    key={room}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-[11px] text-slate-400"
                    title={`${room}: Available`}
                  >
                    <div className="font-mono font-semibold">{room}</div>
                    <div className="text-[10px]">Free</div>
                  </div>
                );
              }
              const ts = getTodayStatus(occupant);
              const eligible = isEligibleForDischarge(occupant);
              const style = eligible
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                : ts.needsTemp
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-sky-100 border-sky-400 text-sky-900';

              return (
                <Link
                  key={room}
                  to={`/patients/${occupant.id}`}
                  title={`${room}: ${occupant.name}`}
                  className={`p-2 rounded-lg border text-center text-[11px] transition hover:shadow-sm ${style}`}
                >
                  <div className="font-mono font-bold">{room}</div>
                  <div className="truncate text-[10px] font-medium">{occupant.name.split(' ')[0]}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {showAdmitModal && <AdmitPatientModal onClose={() => setShowAdmitModal(false)} />}
    </Layout>
  );
}
