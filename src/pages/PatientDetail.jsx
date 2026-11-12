/* src/pages/PatientDetail.jsx */
import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PatientsContext } from '../context/PatientsContext';
import { AuthContext } from '../context/AuthContext';
import { RecordTempModal, DoctorVisitModal } from '../components/Modals';
import { CheckCircleIcon, StethoscopeIcon, ThermometerIcon } from '../components/Icons';

function TemperatureChart({ temperatures, feverThreshold }) {
  if (!temperatures || temperatures.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        No temperature readings recorded yet.
      </div>
    );
  }

  const sorted = [...temperatures].sort((a, b) => a.date.localeCompare(b.date));
  const width = 560;
  const height = 180;
  const padX = 42;
  const padY = 20;
  const minT = 35.5;
  const maxT = 41.0;

  const getY = (val) => {
    const clamped = Math.max(minT, Math.min(maxT, val));
    return height - padY - ((clamped - minT) / (maxT - minT)) * (height - padY * 2);
  };

  const getX = (idx) => {
    if (sorted.length === 1) return width / 2;
    return padX + (idx / (sorted.length - 1)) * (width - padX * 2);
  };

  const thresholdY = getY(feverThreshold);
  const points = sorted.map((t, i) => `${getX(i)},${getY(t.value)}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[380px] h-48">
        {/* Horizontal grid lines */}
        {[36, 37, 38, 39, 40].map((deg) => {
          const y = getY(deg);
          return (
            <g key={deg}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={8} y={y + 4} fontSize="10" fill="#64748b">
                {deg}°C
              </text>
            </g>
          );
        })}

        {/* Fever threshold dashed line */}
        <line
          x1={padX}
          y1={thresholdY}
          x2={width - padX}
          y2={thresholdY}
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text x={width - padX - 85} y={thresholdY - 5} fontSize="10" fill="#dc2626" fontWeight="600">
          Fever ≥ {feverThreshold.toFixed(1)}°C
        </text>

        {/* Line */}
        {sorted.length > 1 && (
          <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={points} />
        )}

        {/* Points */}
        {sorted.map((t, i) => {
          const cx = getX(i);
          const cy = getY(t.value);
          const isFever = t.value >= feverThreshold;
          return (
            <g key={t.date}>
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill={isFever ? '#dc2626' : '#16a34a'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="#0f172a">
                {t.value.toFixed(1)}°
              </text>
              <text x={cx} y={height - 4} textAnchor="middle" fontSize="9" fill="#64748b">
                {t.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    patients,
    getTodayStatus,
    getNoFeverStreak,
    isEligibleForDischarge,
    recommendDischarge,
    dischargePatient,
    markDeceased,
    feverThreshold,
  } = useContext(PatientsContext);
  const { user } = useContext(AuthContext);

  const [showTempModal, setShowTempModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const patient = patients.find((p) => String(p.id) === String(id));
  if (!patient) {
    return (
      <Layout>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">Patient Not Found</h2>
          <Link to="/patients" className="text-sm text-sky-600 hover:underline mt-2 inline-block">
            ← Back to Patient Ward
          </Link>
        </div>
      </Layout>
    );
  }

  const ts = getTodayStatus(patient);
  const streak = getNoFeverStreak(patient);
  const eligible = isEligibleForDischarge(patient);

  const handleMarkDeceased = () => {
    if (window.confirm(`Confirm marking ${patient.name} as deceased? This updates facility mortality metrics.`)) {
      markDeceased(patient.id, `Recorded by ${user?.name}`);
      navigate('/patients');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/patients" className="text-sm font-medium text-sky-600 hover:underline">
            ← Back to Patient Ward
          </Link>
        </div>

        {/* Patient Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  patient.status === 'admitted'
                    ? 'bg-sky-100 text-sky-800'
                    : patient.status === 'discharged'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {patient.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ID: <strong>{patient.patientId}</strong> • Age: <strong>{patient.age}</strong> • Room:{' '}
              <strong>{patient.roomNumber || 'Released'}</strong> • Admitted: <strong>{patient.admissionDate}</strong>
            </p>
          </div>

          {/* Role Actions */}
          {patient.status === 'admitted' && (
            <div className="flex flex-wrap items-center gap-2">
              {user?.role === 'nurse' && (
                <button
                  disabled={!ts.needsTemp}
                  onClick={() => setShowTempModal(true)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    ts.needsTemp
                      ? 'bg-sky-600 text-white hover:bg-sky-700 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ThermometerIcon className="w-4 h-4" />
                  {ts.needsTemp ? 'Record Today Temp' : 'Temp Recorded Today ✓'}
                </button>
              )}

              {user?.role === 'doctor' && (
                <>
                  <button
                    disabled={Boolean(ts.visitToday)}
                    onClick={() => setShowVisitModal(true)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      ts.visitToday
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : ts.tempToday
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer'
                    }`}
                  >
                    <StethoscopeIcon className="w-4 h-4" />
                    {ts.visitToday ? 'Visited Today ✓' : 'Log Doctor Visit'}
                  </button>

                  {eligible && !patient.dischargeRecommended && (
                    <button
                      onClick={() => recommendDischarge(patient.id, user.name)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      Recommend Discharge
                    </button>
                  )}
                </>
              )}

              {user?.role === 'admin' && eligible && (
                <button
                  onClick={() => {
                    dischargePatient(patient.id);
                    navigate('/patients');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Process Discharge
                </button>
              )}

              {(user?.role === 'doctor' || user?.role === 'admin') && (
                <button
                  onClick={handleMarkDeceased}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                >
                  Mark Deceased
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3-Day No-Fever Progress Tracker */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">3-Day Fever-Free Discharge Criterion</h2>
              <p className="text-xs text-slate-500">
                Patient must have 3 consecutive days with temperature &lt; {feverThreshold.toFixed(1)}°C to be eligible for discharge.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {eligible ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  Eligible for Discharge ({streak.streak} consecutive days)
                </>
              ) : (
                `Current Streak: ${streak.streak} / 3 Days`
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((dayNum) => {
              const achieved = streak.streak >= dayNum;
              return (
                <div
                  key={dayNum}
                  className={`p-3 rounded-lg border text-center ${
                    achieved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase">Day {dayNum}</div>
                  <div className="text-sm font-bold mt-0.5">{achieved ? 'No Fever ✓' : 'Pending'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart + Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Temperature Trend</h2>
            <TemperatureChart temperatures={patient.temperatures} feverThreshold={feverThreshold} />

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2">Recorded Readings</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {[...patient.temperatures]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <div
                      key={t.date}
                      className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-50"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{t.date}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({t.time}) by {t.recordedBy}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          t.value >= feverThreshold ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {t.value.toFixed(1)}°C
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Doctor Visit Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Doctor Visits & Treatment Log</h2>
            {patient.doctorVisits.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No doctor visits recorded yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...patient.doctorVisits]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((v, idx) => (
                    <div key={`${v.date}-${idx}`} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{v.date}</span>
                        <span>{v.doctorName}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{v.treatment}</div>
                      {v.notes && <p className="text-xs text-slate-600 mt-1">{v.notes}</p>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTempModal && <RecordTempModal patient={patient} onClose={() => setShowTempModal(false)} />}
      {showVisitModal && <DoctorVisitModal patient={patient} onClose={() => setShowVisitModal(false)} />}
    </Layout>
  );
}
