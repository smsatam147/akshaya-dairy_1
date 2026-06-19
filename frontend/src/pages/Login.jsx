/**
 * pages/Login.jsx -- Centered, light-themed login. Logo + title on top, card below.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GREEN = '#76D27B';
const GREEN_DARK = '#2F9E40';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)                            e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Enter a valid email.';
    if (!form.password)                         e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const inputBase = 'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none transition-shadow';
  const focusOn  = (e) => { e.target.style.borderColor = GREEN_DARK; e.target.style.boxShadow = '0 0 0 3px rgba(47,158,64,0.20)'; };
  const focusOff = (e) => { e.target.style.borderColor = '#D8DDD2'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
         style={{ background: 'linear-gradient(rgba(18,38,18,0.55), rgba(18,38,18,0.45)), url(' + (process.env.PUBLIC_URL || '') + '/farm-bg.jpg) center/cover no-repeat' }}>

      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Logo + title */}
        <img
          src={(process.env.PUBLIC_URL || '') + '/akshaya-logo.png'}
          alt="Akshaya Farms"
          className="w-36 h-auto mb-4"
          style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <p className="text-xs font-semibold uppercase mb-8"
           style={{ color: '#FFFFFF', letterSpacing: '0.22em', textShadow: '0 1px 10px rgba(0,0,0,0.45)' }}>
          Dairy Management System
        </p>

        {/* Login card */}
        <div className="w-full bg-white rounded-2xl p-8"
             style={{ border: '1px solid #EAEDE4', boxShadow: '0 12px 40px rgba(43,61,38,0.08)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#1F2A1B' }}>Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: '#7C857A' }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3A4436' }}>
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">&#x2709;&#xFE0F;</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={errors.email ? inputBase + ' border border-red-400 bg-red-50' : inputBase}
                  style={!errors.email ? { border: '1.5px solid #D8DDD2', background: '#FFFFFF', color: '#1F2A1B' } : {}}
                  onFocus={e => { if (!errors.email) focusOn(e); }}
                  onBlur={e  => { if (!errors.email) focusOff(e); }}
                  placeholder="you@akshayafarm.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3A4436' }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">&#x1F512;</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={errors.password ? inputBase + ' pr-10 border border-red-400 bg-red-50' : inputBase + ' pr-10'}
                  style={!errors.password ? { border: '1.5px solid #D8DDD2', background: '#FFFFFF', color: '#1F2A1B' } : {}}
                  onFocus={e => { if (!errors.password) focusOn(e); }}
                  onBlur={e  => { if (!errors.password) focusOff(e); }}
                  placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                  autoComplete="current-password"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{ color: GREEN_DARK }}>
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#BFE6C4' : GREEN,
                color: '#14532D',
                fontSize: '15px',
                boxShadow: '0 6px 16px rgba(47,158,64,0.22)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = GREEN_DARK; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = GREEN; }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          Account locked after 5 failed attempts. Contact your Super Admin to unlock.
        </p>
      </div>
    </div>
  );
}
