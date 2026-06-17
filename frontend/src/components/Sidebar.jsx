/**
 * components/Sidebar.jsx -- Cream/Pearl themed navigation sidebar.
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',         icon: '&#x1F4CA;', roles: ['super_admin','farm_manager','accountant','field_worker','vet','viewer'] },
  { path: '/milk',      label: 'Milk Entry',        icon: '&#x1F95B;', roles: ['super_admin','farm_manager','field_worker'] },
  { path: '/cattle',    label: 'Cattle Health',     icon: '&#x1F404;', roles: ['super_admin','farm_manager','vet'] },
  { path: '/inventory', label: 'Inventory',         icon: '&#x1F4E6;', roles: ['super_admin','farm_manager'] },
  { path: '/sales',     label: 'Sales',             icon: '&#x1F4B0;', roles: ['super_admin','accountant','farm_manager'] },
  { path: '/employees', label: 'Employee Roster',   icon: '&#x1F465;', roles: ['super_admin','accountant'] },
  { path: '/reports',   label: 'Financial Reports', icon: '&#x1F4C8;', roles: ['super_admin','accountant'] },
];

const ROLE_LABELS = {
  super_admin:  'Super Admin',
  farm_manager: 'Farm Manager',
  accountant:   'Accountant',
  field_worker: 'Field Worker',
  vet:          'Veterinarian',
  viewer:       'Viewer',
};

const ROLE_COLORS = {
  super_admin:  '#9333ea',
  farm_manager: '#A87C3A',
  accountant:   '#1d4ed8',
  field_worker: '#c49a55',
  vet:          '#dc2626',
  viewer:       '#6b7280',
};

function Initials({ name }) {
  if (!name) return <span className="text-sm font-bold">?</span>;
  const parts = name.trim().split(' ');
  const init  = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return <span className="text-sm font-bold uppercase">{init}</span>;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <aside
      className="flex flex-col h-screen w-64 fixed left-0 top-0 z-10 shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #2C1A0E 0%, #3D2B1A 55%, #4A3525 100%)' }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(196,154,85,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
               style={{ background: 'rgba(196,154,85,0.2)', border: '1px solid rgba(196,154,85,0.3)' }}>
            <span className="text-2xl">&#x1F95B;</span>
          </div>
          <div>
            <div className="font-extrabold text-sm leading-tight" style={{ color: '#F5EDD8' }}>
              Akshaya Farm Dairy
            </div>
            <div className="text-xs mt-0.5 font-light tracking-wide" style={{ color: '#C49A55', opacity: 0.85 }}>
              Management System
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
           style={{ color: '#C49A55', opacity: 0.7 }}>Menu</p>

        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150"
            style={({ isActive }) => ({
              fontSize: '15px',
              background: isActive
                ? 'linear-gradient(135deg, rgba(196,154,85,0.28) 0%, rgba(168,124,58,0.18) 100%)'
                : 'transparent',
              color: isActive ? '#F5EDD8' : 'rgba(245,237,216,0.7)',
              border: isActive ? '1px solid rgba(196,154,85,0.3)' : '1px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: isActive ? 'rgba(196,154,85,0.25)' : 'transparent' }}
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#C49A55' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4">
        <div className="rounded-xl p-3"
             style={{ background: 'rgba(196,154,85,0.1)', border: '1px solid rgba(196,154,85,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow text-sm font-bold"
                 style={{ background: ROLE_COLORS[user && user.role] || '#6b7280' }}>
              <Initials name={user && user.full_name} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate leading-tight" style={{ color: '#F5EDD8' }}>
                {(user && user.full_name) || 'User'}
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: '#C49A55' }}>
                {ROLE_LABELS[user && user.role] || (user && user.role)}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{ color: '#F5EDD8', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.borderColor = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
