/**
 * components/Layout.jsx -- Cream/Pearl themed layout with top header.
 */
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_META = {
  '/':          { title: 'Dashboard',         icon: 'Dashboard',  sub: 'Overview & KPIs' },
  '/milk':      { title: 'Milk Entry',        icon: 'Milk',       sub: 'Daily collection records' },
  '/cattle':    { title: 'Cattle Health',     icon: 'Cattle',     sub: 'Health & vaccination tracking' },
  '/inventory': { title: 'Inventory',         icon: 'Inventory',  sub: 'Stock & supply management' },
  '/sales':     { title: 'Sales',             icon: 'Sales',      sub: 'Milk & Ghee sales records' },
  '/employees': { title: 'Employee Roster',   icon: 'Employees',  sub: 'Staff & attendance' },
  '/reports':   { title: 'Financial Reports', icon: 'Reports',    sub: 'Revenue & expense reports' },
};

const PAGE_EMOJI = {
  '/': '&#x1F4CA;', '/milk': '&#x1F95B;', '/cattle': '&#x1F404;',
  '/inventory': '&#x1F4E6;', '/sales': '&#x1F4B0;',
  '/employees': '&#x1F465;', '/reports': '&#x1F4C8;',
};

function TopHeader() {
  const location = useLocation();
  const meta  = PAGE_META[location.pathname] || { title: 'Akshaya Farm Dairy', sub: '' };
  const emoji = PAGE_EMOJI[location.pathname] || '&#x1F95B;';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm"
            style={{ borderBottom: '1px solid #E8D5B0' }}>
      <div className="flex items-center justify-between px-6 py-3.5">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
               style={{ background: '#F5EDD8', border: '1px solid #E8D5B0' }}
               dangerouslySetInnerHTML={{ __html: emoji }} />
          <div>
            <h1 className="font-bold leading-tight" style={{ color: '#2C1A0E', fontSize: '17px' }}>
              {meta.title}
            </h1>
            {meta.sub && (
              <p className="text-xs mt-0.5" style={{ color: '#A87C3A' }}>{meta.sub}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: '#4A3213' }}>{today}</p>
            <p className="text-xs mt-0.5" style={{ color: '#A87C3A' }}>Akshaya Farm Dairy</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
               style={{ background: '#F5EDD8', border: '1px solid #E8D5B0' }}>
            <span className="w-2 h-2 rounded-full inline-block animate-pulse"
                  style={{ background: '#C49A55' }} />
            <span className="text-xs font-semibold" style={{ color: '#8B6228' }}>Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#FDFAF5' }}>
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="px-6 py-3 bg-white" style={{ borderTop: '1px solid #E8D5B0' }}>
          <p className="text-xs text-center" style={{ color: '#C49A55', opacity: 0.7 }}>
            &copy; 2026 Akshaya Farm Dairy &middot; Management System
          </p>
        </footer>
      </div>
    </div>
  );
}
