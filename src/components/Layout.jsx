/* src/components/Layout.jsx */
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PatientsContext } from '../context/PatientsContext';
import { AlertTriangleIcon, BedIcon, LogoutIcon, ShieldCheckIcon } from './Icons';

export default function Layout({ children }) {
  const { user, quickLogin, logout } = useContext(AuthContext);
  const { getStats } = useContext(PatientsContext);
  const location = useLocation();
  const navigate = useNavigate();
  const stats = getStats();

  const roleColors = {
    nurse: 'bg-sky-100 text-sky-800 border-sky-200',
    doctor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['nurse', 'doctor', 'admin'] },
    { path: '/patients', label: 'Patient Ward', roles: ['nurse', 'doctor', 'admin'] },
    { path: '/admin', label: 'Admin & 74-Bed Map', roles: ['admin'] },
  ];

  const handleRoleSwitch = (role) => {
    quickLogin(role);
    if (role !== 'admin' && location.pathname === '/admin') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mortality Alert Banner */}
      {stats.isMortalityAlert && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangleIcon className="w-4 h-4 shrink-0" />
          <span>
            CRITICAL QUALITY ALERT: Facility mortality rate is{' '}
            <strong>{stats.mortalityRate.toFixed(1)}%</strong> (exceeds the 15.0% benchmark). Immediate clinical review required.
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                FW
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">FactWise Care</div>
                <div className="text-[11px] text-slate-500">Quarantine & Treatment</div>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems
                .filter((item) => item.roles.includes(user?.role))
                .map((item) => {
                  const active =
                    location.pathname === item.path ||
                    (item.path === '/patients' && location.pathname.startsWith('/patients/'));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Occupancy Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                stats.admitted >= stats.maxCapacity
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <BedIcon className="w-3.5 h-3.5" />
              <span>
                {stats.admitted} / {stats.maxCapacity} Beds
              </span>
            </div>

            {/* Quick Role Switcher for Prototype Demo */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 px-1.5 font-medium">Demo Role:</span>
              {['nurse', 'doctor', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition cursor-pointer ${
                    user?.role === r
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* User Badge & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
                <span
                  className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                    roleColors[user?.role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                <LogoutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheckIcon className="w-4 h-4 text-sky-600" />
        <span>FactWise Quarantine & Treatment Prototype — Daily Temp → Doctor Round → 3-Day Fever-Free Discharge</span>
      </footer>
    </div>
  );
}
