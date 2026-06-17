/**
 * pages/Login.jsx -- Split-panel login, cream/pearl theme.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)                            e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
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

  return (
    <div className="min-h-screen flex">

      {/* Left panel: brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #2C1A0E 0%, #3D2B1A 50%, #5C4535 100%)' }}>

        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(196,154,85,0.15), transparent 70%)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(196,154,85,0.10), transparent 70%)' }} />

        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-2xl mx-auto mb-7 flex items-center justify-center shadow-2xl"
               style={{ background: 'rgba(196,154,85,0.18)', border: '1px solid rgba(196,154,85,0.35)' }}>
            <span className="text-5xl">&#x1F95B;</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight" style={{ color: '#F5EDD8' }}>
            Akshaya Farm Dairy
          </h1>
          <p className="text-base mt-3 font-light leading-relaxed" style={{ color: '#C49A55' }}>
            Complete Dairy Management System
          </p>

          <div className="w-16 h-px mx-auto mt-6 mb-8"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,85,0.5), transparent)' }} />

          <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              { icon: '&#x1F404;', text: 'Cattle health & tracking' },
              { icon: '&#x1F95B;', text: 'Daily milk collection logs' },
              { icon: '&#x1F4B0;', text: 'Sales & revenue insights' },
              { icon: '&#x1F4E6;', text: 'Inventory management' },
            ].map(f => (
              <div key={f.text}
                   className="flex items-center gap-3 rounded-xl px-4 py-3"
                   style={{ background: 'rgba(196,154,85,0.10)', border: '1px solid rgba(196,154,85,0.2)' }}>
                <span className="text-xl" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <span className="text-sm font-medium" style={{ color: '#F5EDD8', opacity: 0.9 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-xs" style={{ color: '#C49A55', opacity: 0.55 }}>
          Powered by Akshaya Farms &middot; 2026
        </p>
      </div>

      {/* Right panel: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12"
           style={{ background: '#FDFAF5' }}>
        <div className="w-full max-w-sm">

          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-2">&#x1F95B;</div>
            <h1 className="text-2xl font-bold" style={{ color: '#3D2B1A' }}>Akshaya Farm Dairy</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid #E8D5B0' }}>
            <div className="mb-7">
              <h2 className="text-2xl font-bold" style={{ color: '#2C1A0E' }}>Welcome back</h2>
              <p className="text-sm mt-1" style={{ color: '#8B6228' }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#4A3213' }}>
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">&#x2709;&#xFE0F;</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={errors.email ? 'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-red-400 bg-red-50 focus:outline-none' : 'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none'}
                    style={!errors.email ? { border: '1.5px solid #E8D5B0', background: '#FDFAF5', color: '#2C1A0E' } : {}}
                    onFocus={e => { if (!errors.email) { e.target.style.borderColor = '#C49A55'; e.target.style.boxShadow = '0 0 0 3px rgba(196,154,85,0.15)'; }}}
                    onBlur={e  => { if (!errors.email) { e.target.style.borderColor = '#E8D5B0'; e.target.style.boxShadow = 'none'; }}}
                    placeholder="you@akshayafarm.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5">! {errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#4A3213' }}>
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">&#x1F512;</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={errors.password ? 'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm border border-red-400 bg-red-50 focus:outline-none' : 'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm focus:outline-none'}
                    style={!errors.password ? { border: '1.5px solid #E8D5B0', background: '#FDFAF5', color: '#2C1A0E' } : {}}
                    onFocus={e => { if (!errors.password) { e.target.style.borderColor = '#C49A55'; e.target.style.boxShadow = '0 0 0 3px rgba(196,154,85,0.15)'; }}}
                    onBlur={e  => { if (!errors.password) { e.target.style.borderColor = '#E8D5B0'; e.target.style.boxShadow = 'none'; }}}
                    placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                    autoComplete="current-password"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: '#A87C3A' }}>
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">! {errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{
                  background: loading ? '#E8D5B0' : 'linear-gradient(135deg, #C49A55 0%, #8B6228 100%)',
                  color: '#FDFAF5',
                  fontSize: '15px',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-5 leading-relaxed" style={{ color: '#A87C3A', opacity: 0.7 }}>
            Account locked after 5 failed attempts. Contact your Super Admin to unlock.
          </p>
        </div>
      </div>
    </div>
  );
}
