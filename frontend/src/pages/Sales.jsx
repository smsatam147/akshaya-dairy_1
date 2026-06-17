/**
 * pages/Sales.jsx — Milk & Ghee Sales Records (Dec 2025 – Jun 2026)
 * Data sourced from Excel records. Sections: KPI cards, Monthly Revenue,
 * Daily Milk Sales, Ghee Orders.
 */
import { useState } from 'react';

const INR = (v) =>
  v == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

/* ─── Monthly Revenue ───────────────────────────────────────────────── */
const MONTHLY_REVENUE = [
  { month: 'Jan 2026', total: 56950,  milk: 27211,  ghee: 29739, other: 0,     partial: false },
  { month: 'Feb 2026', total: 71883,  milk: 32808,  ghee: 39075, other: 0,     partial: false },
  { month: 'Mar 2026', total: 123632, milk: 60733,  ghee: 37852, other: 25047, partial: false },
  { month: 'Apr 2026', total: 130232, milk: 77172,  ghee: 11280, other: 41780, partial: false },
  { month: 'May 2026', total: 103606, milk: 79246,  ghee: 24360, other: 0,     partial: false },
  { month: 'Jun 2026', total: null,   milk: 45162,  ghee: 2700,  other: 0,     partial: true  },
];

/* ─── Daily Milk Sales ───────────────────────────────────────────────── */
const DAILY_MILK = {
  'Jan 2026': { days: 31, totals: [735,805,875,840,910,875,910,910,945,910,0,875,875,910,840,805,840,805,700,700,735,0,875,1050,805,665,875,945,1085,1172,1102] },
  'Feb 2026': { days: 28, totals: [0,962,1102,962,962,927,1032,927,1032,927,1102,0,1032,1102,1172,1224,1084,1364,1189,1294,1329,1224,0,1364,1434,1434,1434,1329] },
  'Mar 2026': { days: 31, totals: [0,1206,1451,1346,1591,1661,1731,1801,1766,1836,1784,0,2011,1801,2081,1906,1731,1906,2029,1784,2064,2046,0,1941,2011,2116,2081,2291,2361,2431,2641] },
  'Apr 2026': { days: 30, totals: [0,2466,2273,2588,2308,2483,2448,2518,2448,2518,2658,0,2816,2571,2641,2781,2693,2658,2728,2728,2798,2693,0,2693,2693,2763,2658,2658,2588,2868,2868] },
  'May 2026': { days: 31, totals: [0,2658,2746,2571,2624,2274,2554,2518,2553,2396,2326,0,2431,2361,2501,2676,2501,2536,2536,2606,2501,2676,0,2606,2606,2571,2606,2606,2711,2676,2676,2641] },
  'Jun 2026': { days: 30, totals: [0,2886,2606,2641,2554,2554,2466,2466,2746,2886,2956,0,3026,3166,3061,2921,2956,3271,0,0,0,0,0,0,0,0,0,0,0,0], partial: true },
};

/* ─── Ghee Orders (Jan – Jun 2026) ───────────────────────────────────── */
const GHEE_ORDERS = [
  /* ── January ── */
  { name:'Anant Rane',         invoice:'AFBS/140/25-26', qty:100,  amount:255,  status:'Cash',   date:'29-01-2026', month:'Jan 2026' },
  { name:'Anant Thakur',       invoice:'AFBS/154/25-26', qty:250,  amount:620,  status:'Cash',   date:'31-01-2026', month:'Jan 2026' },
  { name:'Ashutosh Rasam',     invoice:'AFBS/139/25-26', qty:100,  amount:255,  status:'Online', date:'29-01-2026', month:'Jan 2026' },
  /* ── February ── */
  { name:'Smita Rane',         invoice:'AFBS/281/25-26', qty:500,  amount:1300, status:'Cash',   date:'02-02-2026', month:'Feb 2026' },
  { name:'Swati',              invoice:'AFBS/282/25-26', qty:250,  amount:638,  status:'Cash',   date:'09-02-2026', month:'Feb 2026' },
  /* ── March ── */
  { name:'Anup Warang',        invoice:'AFBS/476/25-26', qty:100,  amount:255,  status:'Cash',   date:'01-03-2026', month:'Mar 2026' },
  { name:'Santosh Patil',      invoice:'AFBS/477/25-26', qty:100,  amount:250,  status:'Online', date:'28-02-2026', month:'Mar 2026' },
  /* ── April ── */
  { name:'Sujata Patel',       invoice:'AFGS/001/26-27', qty:300,  amount:780,  status:'Cash',   date:'11-04-2026', month:'Apr 2026' },
  { name:'Mahesh Raorane',     invoice:'AFGS/002/26-27', qty:1000, amount:2800, status:'Cash',   date:'07-04-2026', month:'Apr 2026' },
  { name:'Samidha Rane',       invoice:'AFGS/003/26-27', qty:500,  amount:1400, status:'Cash',   date:'17-04-2026', month:'Apr 2026' },
  /* ── May ── */
  { name:'Sudhir Surve',       invoice:'AFGS/006/26-27', qty:1000, amount:2800, status:'Online', date:'05-04-2026', month:'May 2026' },
  { name:'Supriya Raorane',    invoice:'AFGS/007/26-27', qty:500,  amount:1400, status:'Cash',   date:'30-04-2026', month:'May 2026' },
  { name:'Sheetal Sawant',     invoice:'AFGS/008/26-27', qty:500,  amount:1400, status:'Cash',   date:'06-05-2026', month:'May 2026' },
  { name:'Ganesh Gavankar',    invoice:'AFGS/009/26-27', qty:500,  amount:1400, status:'Cash',   date:'06-05-2026', month:'May 2026' },
  { name:'Vinit Rane',         invoice:'AFGS/010/26-27', qty:500,  amount:1400, status:'Online', date:'09-05-2026', month:'May 2026' },
  { name:'Shubham Kadam',      invoice:'AFGS/011/26-27', qty:100,  amount:280,  status:'Cash',   date:'08-05-2026', month:'May 2026' },
  { name:'Gururaja Dongare',   invoice:'AFGS/012/26-27', qty:500,  amount:1400, status:'Cash',   date:'14-05-2026', month:'May 2026' },
  { name:'Dipali Rane',        invoice:'AFGS/013/26-27', qty:500,  amount:1400, status:'Online', date:'15-05-2026', month:'May 2026' },
  { name:'Prakash Rane',       invoice:'AFGS/014/26-27', qty:1000, amount:2800, status:'Online', date:'15-05-2026', month:'May 2026' },
  { name:'Vedika Parkar',      invoice:'AFGS/015/26-27', qty:250,  amount:700,  status:'Online', date:'17-05-2026', month:'May 2026' },
  { name:'Sudhir Raorane',     invoice:'AFGS/016/26-27', qty:250,  amount:700,  status:'Cash',   date:'22-05-2026', month:'May 2026' },
  { name:'Satyajit Raorane',   invoice:'AFGS/017/26-27', qty:200,  amount:560,  status:'Cash',   date:'23-05-2026', month:'May 2026' },
  { name:'Sindhu Sawant',      invoice:'AFGS/018/26-27', qty:500,  amount:1400, status:'Cash',   date:'24-05-2026', month:'May 2026' },
  { name:'Abhijit Sawant',     invoice:'AFGS/019/26-27', qty:1000, amount:2800, status:'Cash',   date:'28-05-2026', month:'May 2026' },
  { name:'Abhay Pednekar',     invoice:'AFGS/020/26-27', qty:500,  amount:1400, status:'Online', date:'31-05-2026', month:'May 2026' },
  { name:'Archana Tavade',     invoice:'AFGS/021/26-27', qty:100,  amount:280,  status:'Cash',   date:'31-05-2026', month:'May 2026' },
  /* ── June ── */
  { name:'Vishal Parkar',      invoice:'AFGS/022/26-27', qty:250,  amount:700,  status:'Cash',   date:'01-06-2026', month:'Jun 2026' },
  { name:'Vedika Parkar',      invoice:'AFGS/023/26-27', qty:250,  amount:600,  status:'Online', date:'03-06-2026', month:'Jun 2026' },
  { name:'Satyajit Raorane',   invoice:'AFGS/024/26-27', qty:250,  amount:700,  status:'Cash',   date:'05-06-2026', month:'Jun 2026' },
  { name:'Shubhra Rane',       invoice:'AFGS/025/26-27', qty:250,  amount:700,  status:'Online', date:'07-06-2026', month:'Jun 2026' },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const statusBadge = (s) => {
  const map = { Cash:'bg-green-100 text-green-800', Online:'bg-blue-100 text-blue-800', cash:'bg-green-100 text-green-800', online:'bg-blue-100 text-blue-800' };
  return map[s] || 'bg-gray-100 text-gray-700';
};

const MONTHS = Object.keys(DAILY_MILK);

/* ─── Sub-components ─────────────────────────────────────────────────── */

function KpiCard({ label, value, icon, color, note }) {
  const palette = {
    green:  'bg-green-50  border-green-200  text-green-700',
    blue:   'bg-blue-50   border-blue-200   text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }[color] || 'bg-gray-50 border-gray-200 text-gray-700';
  return (
    <div className={`rounded-xl border p-4 ${palette}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {note && <div className="text-xs mt-1 opacity-60">{note}</div>}
    </div>
  );
}

/* ── Monthly Revenue Tab ── */
function MonthlyRevenueTab() {
  const grandTotal   = MONTHLY_REVENUE.filter(r => !r.partial).reduce((s, r) => s + r.total, 0);
  const grandMilk    = MONTHLY_REVENUE.reduce((s, r) => s + r.milk,  0);
  const grandGhee    = MONTHLY_REVENUE.reduce((s, r) => s + r.ghee,  0);
  const grandOther   = MONTHLY_REVENUE.reduce((s, r) => s + r.other, 0);

  const bar = (val, max, color) => {
    const pct = max ? Math.round((val / max) * 100) : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[60px]">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-[70px] text-right">{INR(val)}</span>
      </div>
    );
  };

  const maxTotal = Math.max(...MONTHLY_REVENUE.filter(r => r.total).map(r => r.total));

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Revenue (Jan–May)"  value={INR(grandTotal)}  icon="💰" color="green"  note="Confirmed months only" />
        <KpiCard label="Milk Revenue"             value={INR(grandMilk)}   icon="🥛" color="blue"   note="Daily deliveries" />
        <KpiCard label="Ghee Revenue"             value={INR(grandGhee)}   icon="🧈" color="yellow" note="Individual orders" />
        <KpiCard label="Tak + Cashew + Other"     value={INR(grandOther)}  icon="📦" color="purple" note="March–April only" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Monthly Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left" style={{minWidth:'160px'}}>Milk</th>
                <th className="px-4 py-3 text-left" style={{minWidth:'160px'}}>Ghee</th>
                <th className="px-4 py-3 text-left" style={{minWidth:'160px'}}>Tak / Cashew / Other</th>
                <th className="px-4 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MONTHLY_REVENUE.map((row) => (
                <tr key={row.month} className={row.partial ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {row.month}
                    {row.partial && <span className="ml-2 text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Partial</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{INR(row.total)}</td>
                  <td className="px-4 py-3">{bar(row.milk, Math.max(...MONTHLY_REVENUE.map(r=>r.milk)), 'bg-blue-400')}</td>
                  <td className="px-4 py-3">{bar(row.ghee, Math.max(...MONTHLY_REVENUE.map(r=>r.ghee)), 'bg-yellow-400')}</td>
                  <td className="px-4 py-3">{row.other > 0 ? bar(row.other, Math.max(...MONTHLY_REVENUE.map(r=>r.other)), 'bg-purple-400') : <span className="text-gray-300 text-xs">—</span>}</td>
                  <td className="px-4 py-3 text-right">
                    {row.total ? (
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.round((row.total/maxTotal)*100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((row.total/maxTotal)*100)}%</span>
                      </div>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 text-sm font-bold">
              <tr>
                <td className="px-4 py-3 text-gray-700">Grand Total</td>
                <td className="px-4 py-3 text-right text-gray-900">{INR(grandTotal)}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{INR(grandMilk)}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{INR(grandGhee)}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{INR(grandOther)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Daily Milk Sales Tab ── */
function DailyMilkTab() {
  const [selMonth, setSelMonth] = useState('Jun 2026');
  const data = DAILY_MILK[selMonth];
  const totals = data.totals;
  const deliveredDays = totals.filter(v => v > 0).length;
  const monthTotal    = totals.reduce((s, v) => s + v, 0);
  const avgPerDay     = deliveredDays ? Math.round(monthTotal / deliveredDays) : 0;
  const maxDay        = Math.max(...totals);

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex gap-1 flex-wrap">
        {MONTHS.map(m => (
          <button key={m} onClick={() => setSelMonth(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
              ${selMonth === m
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'}`}>
            {m}
            {DAILY_MILK[m].partial && ' *'}
          </button>
        ))}
      </div>

      {/* KPI mini cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-800">{INR(monthTotal)}</div>
          <div className="text-xs text-blue-600 mt-0.5">Month Total</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-800">{deliveredDays}</div>
          <div className="text-xs text-green-600 mt-0.5">Delivery Days</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-800">{INR(avgPerDay)}</div>
          <div className="text-xs text-yellow-600 mt-0.5">Avg / Delivery Day</div>
        </div>
      </div>

      {/* Daily table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Day-wise Milk Sales — {selMonth}</h3>
          {data.partial && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">* Partial month data</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-center">Day</th>
                <th className="px-4 py-2 text-right">Sales (INR)</th>
                <th className="px-4 py-2 text-left">Bar</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totals.map((val, i) => (
                <tr key={i} className={val === 0 ? 'bg-gray-50' : val === maxDay ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2 text-center font-medium text-gray-700">{String(i + 1).padStart(2, '0')}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${val === 0 ? 'text-gray-300' : 'text-gray-900'}`}>
                    {val > 0 ? INR(val) : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {val > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-2 max-w-[200px]">
                        <div
                          className={`h-2 rounded-full ${val === maxDay ? 'bg-green-500' : 'bg-blue-400'}`}
                          style={{ width: `${Math.round((val / maxDay) * 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {val > 0
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Delivered</span>
                      : <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">No Delivery</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-sm">
              <tr>
                <td className="px-4 py-3 text-gray-700">Total</td>
                <td className="px-4 py-3 text-right text-gray-900">{INR(monthTotal)}</td>
                <td></td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">{deliveredDays} days</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Ghee Orders Tab ── */
function GheeOrdersTab() {
  const allMonths = [...new Set(GHEE_ORDERS.map(o => o.month))];
  const [filter, setFilter] = useState('All');

  const rows = filter === 'All' ? GHEE_ORDERS : GHEE_ORDERS.filter(o => o.month === filter);
  const totalAmt = rows.reduce((s, o) => s + o.amount, 0);
  const totalQty = rows.filter(o => typeof o.qty === 'number').reduce((s, o) => s + o.qty, 0);

  return (
    <div className="space-y-4">
      {/* Month filter */}
      <div className="flex gap-1 flex-wrap">
        {['All', ...allMonths].map(m => (
          <button key={m} onClick={() => setFilter(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
              ${filter === m
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-800">{rows.length}</div>
          <div className="text-xs text-yellow-600 mt-0.5">Total Orders</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-800">{INR(totalAmt)}</div>
          <div className="text-xs text-green-600 mt-0.5">Total Revenue</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-800">{totalQty.toLocaleString()} gm</div>
          <div className="text-xs text-blue-600 mt-0.5">Total Qty (numeric rows)</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Ghee Order Records ({rows.length} orders)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Customer Name</th>
                <th className="px-4 py-2 text-left">Invoice No</th>
                <th className="px-4 py-2 text-center">Qty (gm)</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-center">Payment</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((o, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{o.name}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{o.invoice}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{typeof o.qty === 'number' ? o.qty.toLocaleString() : o.qty}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{INR(o.amount)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(o.status)}`}>
                      {o.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{o.date}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{o.month}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-sm">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-gray-700">Total ({rows.length} orders)</td>
                <td className="px-4 py-3 text-right text-gray-900">{INR(totalAmt)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sales Page ──────────────────────────────────────────────────── */
export default function Sales() {
  const [tab, setTab] = useState('revenue');

  const TABS = [
    { id: 'revenue',    label: 'Monthly Revenue', icon: '📅' },
    { id: 'daily',      label: 'Daily Milk',      icon: '🥛' },
    { id: 'ghee',       label: 'Ghee Orders',     icon: '🧈' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Milk & Ghee sales records — Dec 2025 to Jun 2026</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'revenue' && <MonthlyRevenueTab />}
      {tab === 'daily'   && <DailyMilkTab   />}
      {tab === 'ghee'    && <GheeOrdersTab  />}
    </div>
  );
}
