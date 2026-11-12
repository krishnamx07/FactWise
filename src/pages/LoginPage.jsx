/* src/pages/LoginPage.jsx */
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheckIcon, StethoscopeIcon, ThermometerIcon, UsersIcon } from '../components/Icons';

export default function LoginPage() {
  const { login, quickLogin, demoUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleDemoLogin = (role) => {
    quickLogin(role);
    navigate('/dashboard');
  };

  const roleIcon = {
    nurse: <ThermometerIcon className="w-5 h-5 text-sky-600" />,
    doctor: <StethoscopeIcon className="w-5 h-5 text-emerald-600" />,
    admin: <UsersIcon className="w-5 h-5 text-indigo-600" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Quick Demo Role Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-lg">
                FW
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FactWise Care</h1>
                <p className="text-xs text-slate-500">Quarantine & Treatment Facility (74 Beds)</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 mb-5">
              Select a role below for <strong>instant 1-click access</strong> to test the end-to-end daily temperature, doctor round, and 3-day discharge workflow:
            </p>

            <div className="space-y-3">
              {demoUsers.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => handleDemoLogin(u.role)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition shrink-0">
                    {roleIcon[u.role]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">{u.name}</span>
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheckIcon className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Prototype data persists locally in your browser.</span>
          </div>
        </div>

        {/* Right: Standard Email/Password Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Staff Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">
            Or enter credentials manually (e.g. <code className="bg-slate-100 px-1 rounded">nurse@factwise.io</code> / <code className="bg-slate-100 px-1 rounded">password123</code>)
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Staff Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nurse@factwise.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-lg hover:bg-sky-700 transition cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
