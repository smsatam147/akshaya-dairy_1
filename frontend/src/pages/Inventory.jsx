/**
 * pages/Inventory.jsx — Stock management with category tabs, structured Bottles view,
 * and full milk bottle history from Excel snapshot.
 */
import { useState, useEffect } from 'react';
import { inventoryAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);

const CATEGORIES = ['All', 'Bottles', 'Feed', 'Medicine', 'Equipment', 'Packaging', 'Chemicals', 'Other'];
const CAT_ICON   = {
  All: '📦', Bottles: '🍶', Feed: '🌾', Medicine: '💊',
  Equipment: '🔧', Packaging: '📫', Chemicals: '🧪', Other: '📋',
};

/* ── Milk bottle history data (from Excel snapshot Apr-Jun 2026) ───────── */
const MILK_HISTORY = [
  { date:'14-04-2026', wc1:9,  wc5:45, off1:0,  off5:0,  stk1:21, stk5:67  },
  { date:'15-04-2026', wc1:3,  wc5:10, off1:0,  off5:0,  stk1:13, stk5:47  },
  { date:'16-04-2026', wc1:3,  wc5:10, off1:0,  off5:0,  stk1:54, stk5:11  },
  { date:'17-04-2026', wc1:3,  wc5:10, off1:11, off5:61, stk1:9,  stk5:14  },
  { date:'18-04-2026', wc1:3,  wc5:10, off1:11, off5:61, stk1:9,  stk5:14  },
  { date:'20-04-2026', wc1:11, wc5:51, off1:13, off5:62, stk1:7,  stk5:9   },
  { date:'21-04-2026', wc1:12, wc5:56, off1:13, off5:58, stk1:7,  stk5:9   },
  { date:'22-04-2026', wc1:13, wc5:53, off1:12, off5:65, stk1:7,  stk5:9   },
  { date:'23-04-2026', wc1:14, wc5:53, off1:14, off5:63, stk1:7,  stk5:9   },
  { date:'24-04-2026', wc1:13, wc5:50, off1:14, off5:63, stk1:7,  stk5:9   },
  { date:'25-04-2026', wc1:14, wc5:47, off1:15, off5:58, stk1:7,  stk5:9   },
  { date:'27-04-2026', wc1:13, wc5:50, off1:13, off5:57, stk1:7,  stk5:5   },
  { date:'28-04-2026', wc1:15, wc5:51, off1:13, off5:57, stk1:7,  stk5:5   },
  { date:'29-04-2026', wc1:15, wc5:51, off1:13, off5:57, stk1:7,  stk5:5   },
  { date:'04-05-2026', wc1:7,  wc5:51, off1:14, off5:57, stk1:0,  stk5:0   },
  { date:'05-05-2026', wc1:13, wc5:46, off1:15, off5:60, stk1:0,  stk5:0   },
  { date:'06-05-2026', wc1:13, wc5:52, off1:13, off5:62, stk1:0,  stk5:0   },
  { date:'07-05-2026', wc1:11, wc5:48, off1:14, off5:50, stk1:0,  stk5:0   },
  { date:'08-05-2026', wc1:12, wc5:47, off1:20, off5:49, stk1:0,  stk5:0   },
  { date:'09-05-2026', wc1:11, wc5:48, off1:18, off5:48, stk1:0,  stk5:0   },
  { date:'10-05-2026', wc1:12, wc5:49, off1:22, off5:50, stk1:0,  stk5:0   },
  { date:'11-05-2026', wc1:12, wc5:43, off1:21, off5:50, stk1:0,  stk5:0   },
  { date:'12-05-2026', wc1:11, wc5:42, off1:23, off5:49, stk1:0,  stk5:0   },
  { date:'13-05-2026', wc1:11, wc5:43, off1:22, off5:50, stk1:0,  stk5:0   },
  { date:'14-05-2026', wc1:11, wc5:45, off1:23, off5:50, stk1:0,  stk5:0   },
  { date:'15-05-2026', wc1:13, wc5:44, off1:22, off5:50, stk1:0,  stk5:0   },
  { date:'16-05-2026', wc1:11, wc5:41, off1:21, off5:49, stk1:0,  stk5:0   },
  { date:'17-05-2026', wc1:11, wc5:39, off1:22, off5:50, stk1:0,  stk5:0   },
  { date:'18-05-2026', wc1:12, wc5:43, off1:21, off5:48, stk1:0,  stk5:0   },
  { date:'19-05-2026', wc1:11, wc5:43, off1:24, off5:47, stk1:0,  stk5:0   },
  { date:'20-05-2026', wc1:11, wc5:43, off1:24, off5:47, stk1:0,  stk5:0   },
  { date:'21-05-2026', wc1:12, wc5:39, off1:21, off5:48, stk1:0,  stk5:0   },
  { date:'22-05-2026', wc1:10, wc5:46, off1:23, off5:47, stk1:0,  stk5:70  },
  { date:'23-05-2026', wc1:10, wc5:46, off1:23, off5:47, stk1:0,  stk5:65  },
  { date:'24-05-2026', wc1:8,  wc5:48, off1:22, off5:45, stk1:0,  stk5:60  },
  { date:'25-05-2026', wc1:10, wc5:50, off1:23, off5:44, stk1:0,  stk5:56  },
  { date:'27-05-2026', wc1:10, wc5:50, off1:16, off5:58, stk1:0,  stk5:56  },
  { date:'28-05-2026', wc1:9,  wc5:43, off1:16, off5:58, stk1:0,  stk5:56  },
  { date:'29-05-2026', wc1:9,  wc5:43, off1:17, off5:58, stk1:0,  stk5:56  },
  { date:'30-05-2026', wc1:9,  wc5:42, off1:15, off5:57, stk1:0,  stk5:56  },
  { date:'31-05-2026', wc1:11, wc5:46, off1:15, off5:50, stk1:0,  stk5:56  },
  { date:'01-06-2026', wc1:16, wc5:51, off1:17, off5:55, stk1:0,  stk5:56  },
  { date:'02-06-2026', wc1:16, wc5:51, off1:16, off5:55, stk1:0,  stk5:55  },
  { date:'03-06-2026', wc1:17, wc5:51, off1:16, off5:50, stk1:0,  stk5:55  },
  { date:'04-06-2026', wc1:14, wc5:46, off1:17, off5:51, stk1:0,  stk5:54  },
  { date:'05-06-2026', wc1:14, wc5:46, off1:14, off5:46, stk1:0,  stk5:54  },
  { date:'06-06-2026', wc1:13, wc5:43, off1:14, off5:45, stk1:0,  stk5:50  },
  { date:'07-06-2026', wc1:13, wc5:46, off1:12, off5:44, stk1:0,  stk5:49  },
  { date:'08-06-2026', wc1:18, wc5:44, off1:11, off5:57, stk1:0,  stk5:45  },
  { date:'09-06-2026', wc1:19, wc5:47, off1:14, off5:47, stk1:0,  stk5:41  },
  { date:'10-06-2026', wc1:19, wc5:48, off1:12, off5:64, stk1:0,  stk5:35  },
  { date:'11-06-2026', wc1:20, wc5:49, off1:13, off5:57, stk1:0,  stk5:35  },
  { date:'12-06-2026', wc1:20, wc5:45, off1:12, off5:57, stk1:0,  stk5:35  },
  { date:'13-06-2026', wc1:14, wc5:42, off1:10, off5:50, stk1:0,  stk5:35  },
];

/* ── Bottle groups config ────────────────────────────────────────────── */
const BOTTLE_GROUPS = [
  {
    product: 'Milk',
    icon: '🥛',
    color: 'blue',
    subGroups: [
      {
        label: 'With Customers (WC)',
        bgClass: 'bg-blue-50',
        sizes: [
          { label: '1 Litre',  code: 'BTL-MILK-WC-1L'     },
          { label: '500 ml',   code: 'BTL-MILK-WC-500ML'  },
        ],
      },
      {
        label: 'In Office',
        bgClass: 'bg-indigo-50',
        sizes: [
          { label: '1 Litre',  code: 'BTL-MILK-OFF-1L'    },
          { label: '500 ml',   code: 'BTL-MILK-OFF-500ML' },
        ],
      },
      {
        label: 'In Stock',
        bgClass: 'bg-cyan-50',
        sizes: [
          { label: '1 Litre',  code: 'BTL-MILK-STK-1L'    },
          { label: '500 ml',   code: 'BTL-MILK-STK-500ML' },
        ],
      },
    ],
  },
  {
    product: 'Ghee',
    icon: '🧈',
    color: 'yellow',
    subGroups: [
      {
        label: 'All Stock',
        bgClass: 'bg-yellow-50',
        sizes: [
          { label: '1 Litre',  code: 'BTL-GHEE-1L'    },
          { label: '500 ml',   code: 'BTL-GHEE-500ML' },
          { label: '100 ml',   code: 'BTL-GHEE-100ML' },
        ],
      },
    ],
  },
  {
    product: 'Jivamrut',
    icon: '🌿',
    color: 'green',
    subGroups: [
      {
        label: 'All Stock',
        bgClass: 'bg-green-50',
        sizes: [
          { label: '1 Litre',  code: 'BTL-JIVA-1L' },
        ],
      },
    ],
  },
];

const GROUP_HDR = {
  blue:   'bg-blue-100 text-blue-900 border-blue-300',
  yellow: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  green:  'bg-green-100 text-green-900 border-green-300',
};

/* ── Milk History Table ──────────────────────────────────────────────── */
function MilkHistoryTable() {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('All');

  const months = ['All', 'Apr-2026', 'May-2026', 'Jun-2026'];
  const MONTH_MAP = {
    'Apr-2026': '-04-2026',
    'May-2026': '-05-2026',
    'Jun-2026': '-06-2026',
  };

  const rows = filter === 'All'
    ? MILK_HISTORY
    : MILK_HISTORY.filter(r => r.date.includes(MONTH_MAP[filter]));

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setShow(s => !s)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
          <span>📅</span>
          <span>Milk Bottle History — {MILK_HISTORY.length} days (Apr – Jun 2026)</span>
        </div>
        <span className="text-gray-400 text-lg">{show ? '\u2227' : '\u2228'}</span>
      </button>

      {show && (
        <div>
          {/* Month filter */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">Month:</span>
            {months.map(m => (
              <button key={m} onClick={() => setFilter(m)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  filter === m
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}>
                {m}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{rows.length} records</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-left border border-gray-300 whitespace-nowrap">Date</th>
                  {/* WC */}
                  <th className="px-3 py-2.5 text-center border border-blue-300 bg-blue-50 text-blue-800" colSpan={2}>With Customers (WC)</th>
                  {/* In Office */}
                  <th className="px-3 py-2.5 text-center border border-indigo-300 bg-indigo-50 text-indigo-800" colSpan={2}>In Office</th>
                  {/* In Stock */}
                  <th className="px-3 py-2.5 text-center border border-cyan-300 bg-cyan-50 text-cyan-800" colSpan={2}>In Stock</th>
                  <th className="px-3 py-2.5 text-right border border-gray-300 bg-gray-100">Total</th>
                </tr>
                <tr>
                  <th className="px-3 py-2 text-left border border-gray-300"></th>
                  <th className="px-3 py-2 text-right border border-blue-200 bg-blue-50 text-blue-700">1L</th>
                  <th className="px-3 py-2 text-right border border-blue-200 bg-blue-50 text-blue-700">500ml</th>
                  <th className="px-3 py-2 text-right border border-indigo-200 bg-indigo-50 text-indigo-700">1L</th>
                  <th className="px-3 py-2 text-right border border-indigo-200 bg-indigo-50 text-indigo-700">500ml</th>
                  <th className="px-3 py-2 text-right border border-cyan-200 bg-cyan-50 text-cyan-700">1L</th>
                  <th className="px-3 py-2 text-right border border-cyan-200 bg-cyan-50 text-cyan-700">500ml</th>
                  <th className="px-3 py-2 text-right border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const total = r.wc1 + r.wc5 + r.off1 + r.off5 + r.stk1 + r.stk5;
                  const isLatest = r.date === '13-06-2026';
                  return (
                    <tr key={r.date}
                      className={`${isLatest ? 'bg-green-50 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50`}
                    >
                      <td className="px-3 py-2 border border-gray-200 whitespace-nowrap font-medium text-gray-700">
                        {r.date}{isLatest && <span className="ml-1 text-green-600 text-xs">(latest)</span>}
                      </td>
                      <td className="px-3 py-2 border border-blue-100 text-right text-blue-800 font-medium">{r.wc1}</td>
                      <td className="px-3 py-2 border border-blue-100 text-right text-blue-800">{r.wc5}</td>
                      <td className="px-3 py-2 border border-indigo-100 text-right text-indigo-800 font-medium">{r.off1}</td>
                      <td className="px-3 py-2 border border-indigo-100 text-right text-indigo-800">{r.off5}</td>
                      <td className="px-3 py-2 border border-cyan-100 text-right text-cyan-800 font-medium">{r.stk1}</td>
                      <td className="px-3 py-2 border border-cyan-100 text-right text-cyan-800">{r.stk5}</td>
                      <td className="px-3 py-2 border border-gray-200 text-right font-bold text-gray-900">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr className="bg-gray-100 font-bold text-xs">
                  <td className="px-3 py-2.5 border border-gray-300 text-gray-700">Period Total</td>
                  {[
                    rows.reduce((s,r) => s+r.wc1,0),
                    rows.reduce((s,r) => s+r.wc5,0),
                    rows.reduce((s,r) => s+r.off1,0),
                    rows.reduce((s,r) => s+r.off5,0),
                    rows.reduce((s,r) => s+r.stk1,0),
                    rows.reduce((s,r) => s+r.stk5,0),
                  ].map((v,i) => (
                    <td key={i} className="px-3 py-2.5 border border-gray-300 text-right text-gray-800">{v}</td>
                  ))}
                  <td className="px-3 py-2.5 border border-gray-300 text-right text-gray-900">
                    {rows.reduce((s,r) => s+r.wc1+r.wc5+r.off1+r.off5+r.stk1+r.stk5, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bottles structured table ─────────────────────────────────────────── */
function BottlesTable({ bottleItems, loading, onTransaction }) {
  const byCode = {};
  bottleItems.forEach(i => { byCode[i.item_code] = i; });
  let serial = 0;

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="px-5 py-3 border-b-2 border-gray-200 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍶</span>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Bottle Stock Register</h2>
              <p className="text-xs text-gray-400 mt-0.5">Milk (WC · Office · Stock) · Ghee · Jivamrut</p>
            </div>
          </div>
          <span className="text-xs text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-full font-medium">
            {bottleItems.length} SKUs loaded
          </span>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-3 py-3 text-center border border-gray-300 w-10">Sr.</th>
              <th className="px-3 py-3 text-left   border border-gray-300">Product</th>
              <th className="px-3 py-3 text-left   border border-gray-300">Location / Type</th>
              <th className="px-3 py-3 text-left   border border-gray-300">Size</th>
              <th className="px-3 py-3 text-left   border border-gray-300">Item Code</th>
              <th className="px-3 py-3 text-right  border border-gray-300">Stock (bottles)</th>
              <th className="px-3 py-3 text-right  border border-gray-300">Reorder At</th>
              <th className="px-3 py-3 text-center border border-gray-300">Status</th>
              <th className="px-3 py-3 text-center border border-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400 border border-gray-200">Loading…</td>
              </tr>
            ) : (
              BOTTLE_GROUPS.map(group => {
                const hdrClass = GROUP_HDR[group.color];
                return [
                  /* Product group header */
                  <tr key={`hdr-${group.product}`}>
                    <td colSpan={9}
                      className={`px-4 py-2 border border-gray-300 font-bold text-sm ${hdrClass}`}>
                      {group.icon}  {group.product}
                    </td>
                  </tr>,

                  /* Sub-group rows */
                  ...group.subGroups.flatMap(sub => [
                    /* Sub-group label row */
                    <tr key={`sub-${group.product}-${sub.label}`}>
                      <td colSpan={9}
                        className={`pl-6 pr-4 py-1.5 border border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide ${sub.bgClass}`}>
                        &#9492;&#9472; {sub.label}
                      </td>
                    </tr>,

                    /* Size rows */
                    ...sub.sizes.map((size, sIdx) => {
                      serial += 1;
                      const item    = byCode[size.code];
                      const qty     = item ? Number(item.quantity_on_hand) : 0;
                      const reorder = item ? Number(item.reorder_level)    : 0;
                      const isLow   = qty <= reorder;
                      const bg      = sIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                      return (
                        <tr key={size.code} className={`${bg} hover:bg-yellow-50`}>
                          <td className="px-3 py-2.5 text-center text-gray-400 border border-gray-200">{serial}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-900 border border-gray-200">{group.icon} {group.product}</td>
                          <td className="px-3 py-2.5 text-gray-600 border border-gray-200">{sub.label}</td>
                          <td className="px-3 py-2.5 text-gray-700 border border-gray-200">{size.label}</td>
                          <td className="px-3 py-2.5 text-xs font-mono text-gray-500 border border-gray-200">{size.code}</td>
                          <td className="px-3 py-2.5 text-right font-bold border border-gray-200">
                            <span className={qty === 0 ? 'text-gray-400' : isLow ? 'text-red-600' : 'text-gray-900'}>
                              {qty}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-500 border border-gray-200">{reorder}</td>
                          <td className="px-3 py-2.5 text-center border border-gray-200">
                            {item
                              ? <Badge label={isLow ? 'Low' : 'OK'} variant={isLow ? 'red' : 'green'} />
                              : <span className="text-xs text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center border border-gray-200">
                            {item
                              ? <button onClick={() => onTransaction(item)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">+ Stock</button>
                              : <span className="text-xs text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    }),
                  ]),
                ];
              })
            )}

            {/* Grand total */}
            {!loading && (
              <tr className="bg-green-50 font-bold border-t-2 border-green-300">
                <td colSpan={5} className="px-4 py-2.5 text-green-900 border border-green-300">
                  Total (all bottles)
                </td>
                <td className="px-3 py-2.5 text-right text-green-900 border border-green-300">
                  {BOTTLE_GROUPS.flatMap(g => g.subGroups.flatMap(s => s.sizes)).reduce((sum, s) => {
                    const item = byCode[s.code];
                    return sum + (item ? Number(item.quantity_on_hand) : 0);
                  }, 0)}
                </td>
                <td colSpan={3} className="border border-green-300"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* History accordion — Milk only */}
      <MilkHistoryTable />
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
export default function Inventory() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showLow, setShowLow]   = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showTxn, setShowTxn]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [txnForm, setTxnForm]   = useState({ txn_type: 'Purchase', quantity: '', notes: '' });

  useEffect(() => { fetchItems(); }, [showLow]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.list(showLow ? { low_stock: true } : {});
      setItems(res.data.data?.results || []);
    } catch { toast.error('Failed to load inventory.'); }
    finally { setLoading(false); }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.addTransaction({
        item:     selectedItem.id,
        txn_type: txnForm.txn_type,
        quantity:  +txnForm.quantity,
        notes:    txnForm.notes,
      });
      toast.success('Stock updated!');
      setShowTxn(false);
      setTxnForm({ txn_type: 'Purchase', quantity: '', notes: '' });
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.errors?.quantity?.[0] || err.response?.data?.message || 'Transaction failed.';
      toast.error(msg);
    }
  };

  const openTransaction = (item) => { setSelectedItem(item); setShowTxn(true); };

  const visibleItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);
  const bottleItems = items.filter(i => i.category === 'Bottles');
  const lowCount    = items.filter(i => i.is_low_stock).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">📦 Inventory</h1>
        <div className="flex items-center gap-3">
          {lowCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              ⚠ {lowCount} low-stock
            </span>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showLow} onChange={e => setShowLow(e.target.checked)} className="rounded" />
            Low-stock only
          </label>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map(cat => {
          const count  = cat === 'All' ? items.length : items.filter(i => i.category === cat).length;
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
              }`}>
              <span>{CAT_ICON[cat]}</span>
              <span>{cat}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Transaction modal */}
      {showTxn && selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Record Transaction</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedItem.name} — {Number(selectedItem.quantity_on_hand).toFixed(0)} on hand
            </p>
            <form onSubmit={handleTransaction} className="space-y-4">
              <select value={txnForm.txn_type}
                onChange={e => setTxnForm(f => ({ ...f, txn_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {['Purchase','Consumption','Adjustment','Return','Wastage'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input required type="number" step="1" min="1" value={txnForm.quantity}
                onChange={e => setTxnForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="Quantity (bottles) *"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={txnForm.notes}
                onChange={e => setTxnForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowTxn(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conditional table */}
      {activeCategory === 'Bottles' ? (
        <BottlesTable bottleItems={bottleItems} loading={loading} onTransaction={openTransaction} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-right">Reorder At</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : visibleItems.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No items in this category</td></tr>
              ) : visibleItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.item_code}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="mr-1">{CAT_ICON[item.category] || '📋'}</span>
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Number(item.quantity_on_hand).toFixed(0)} {item.unit}s
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {Number(item.reorder_level).toFixed(0)} {item.unit}s
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {item.unit_cost ? INR(item.unit_cost) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge label={item.is_low_stock ? 'Low Stock' : 'OK'} variant={item.is_low_stock ? 'red' : 'green'} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openTransaction(item)}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                      + Transaction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
