/**
 * pages/MilkCollection.jsx — Milk entry form + daily summary + offline sync.
 */
import { useState, useEffect } from 'react';
import { milkAPI, cattleAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import { openDB } from 'idb';

const DB_NAME  = 'dairypro_offline';
const DB_STORE = 'pending_milk';

async function getOfflineDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(DB_STORE, { autoIncrement: true }); }
  });
}

const gradeColor = (g) => ({ A: 'green', B: 'blue', C: 'yellow', Rejected: 'red' }[g] || 'gray');

export default function MilkCollection() {
  const [cattle, setCattle]               = useState([]);
  const [summary, setSummary]             = useState(null);
  const [collections, setCollections]     = useState([]);
  const [cattleSummary, setCattleSummary] = useState([]);
  const [grandTotal, setGrandTotal]       = useState(0);
  const [monthlyData, setMonthlyData]     = useState({ months: [], cattle: [] });
  const [form, setForm] = useState({ cattle_id: '', shift: 'Morning', quantity_litres: '' });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline]     = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  // Inline-edit (daily table)
  const [editingId, setEditingId]   = useState(null);
  const [editVals, setEditVals]     = useState({ quantity_litres: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, label: '', source: 'inline' });
  const [deleting, setDeleting]           = useState(false);

  // Modal edit (summary / monthly tables)
  const [editModal, setEditModal] = useState({
    open: false, cattleId: null, cattleName: '', monthFilter: null,
    entries: [], loadingEntries: false, editingId: null,
    editVals: { quantity_litres: '' }, saving: false,
  });

  useEffect(() => {
    cattleAPI.list({ is_active: true }).then(r => setCattle(r.data?.results || r.data.data?.results || []));
    milkAPI.dailySummary(selectedDate).then(r => setSummary(r.data.data)).catch(() => {});
    milkAPI.list({ collection_date: selectedDate }).then(r => setCollections(r.data?.results || r.data.data?.results || []));
    milkAPI.cattleSummary().then(r => { const d = r.data.data; setCattleSummary(d.cattle_summary || []); setGrandTotal(d.grand_total || 0); }).catch(() => {});
    milkAPI.monthlySummary().then(r => setMonthlyData(r.data.data)).catch(() => {});
    const onOnline  = () => { setIsOnline(true); handleSync(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    checkPending();
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [selectedDate]);

  async function checkPending() {
    const db = await getOfflineDB();
    setPendingCount(await db.count(DB_STORE));
  }

  function refreshAll() {
    milkAPI.dailySummary(selectedDate).then(r => setSummary(r.data.data)).catch(() => {});
    milkAPI.list({ collection_date: selectedDate }).then(r => setCollections(r.data?.results || r.data.data?.results || []));
    milkAPI.cattleSummary().then(r => { const d = r.data.data; setCattleSummary(d.cattle_summary || []); setGrandTotal(d.grand_total || 0); }).catch(() => {});
    milkAPI.monthlySummary().then(r => setMonthlyData(r.data.data)).catch(() => {});
  }

  function startEdit(mc) {
    setEditingId(mc.id);
    setEditVals({ quantity_litres: mc.quantity_litres });
  }

  async function saveEdit(id) {
    setSavingEdit(true);
    try {
      await milkAPI.update(id, {
        quantity_litres: +editVals.quantity_litres,
      });
      toast.success('Entry updated!');
      setEditingId(null);
      refreshAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    finally { setSavingEdit(false); }
  }

  async function openEditModal(cattleId, cattleName, monthFilter) {
    setEditModal(m => ({ ...m, open: true, cattleId, cattleName, monthFilter, entries: [], loadingEntries: true, editingId: null }));
    try {
      const res = await milkAPI.list({ cattle: cattleId });
      let entries = res.data?.results || res.data.data?.results || [];
      if (monthFilter) {
        entries = entries.filter(e => {
          const d = new Date(e.collection_date);
          return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }) === monthFilter;
        });
      }
      entries.sort((a, b) => a.collection_date > b.collection_date ? -1 : 1);
      setEditModal(m => ({ ...m, entries, loadingEntries: false }));
    } catch { setEditModal(m => ({ ...m, loadingEntries: false })); }
  }

  function startModalEdit(mc) {
    setEditModal(m => ({ ...m, editingId: mc.id, editVals: { quantity_litres: mc.quantity_litres } }));
  }

  async function saveModalEdit(id) {
    setEditModal(m => ({ ...m, saving: true }));
    try {
      await milkAPI.update(id, {
        quantity_litres: +editModal.editVals.quantity_litres,
      });
      toast.success('Entry updated!');
      setEditModal(m => ({
        ...m, saving: false, editingId: null,
        entries: m.entries.map(e => e.id === id ? { ...e, quantity_litres: +m.editVals.quantity_litres } : e),
      }));
      refreshAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); setEditModal(m => ({ ...m, saving: false })); }
  }

  function askDelete(id, label, source = 'inline') {
    setDeleteConfirm({ open: true, id, label, source });
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await milkAPI.delete(deleteConfirm.id);
      toast.success('Entry deleted.');
      if (deleteConfirm.source === 'modal') {
        setEditModal(m => ({ ...m, entries: m.entries.filter(e => e.id !== deleteConfirm.id) }));
      }
      setDeleteConfirm({ open: false, id: null, label: '', source: 'inline' });
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleSync() {
    const db = await getOfflineDB();
    const keys = await db.getAllKeys(DB_STORE);
    const entries = await db.getAll(DB_STORE);
    if (!entries.length) return;
    try {
      await milkAPI.syncOffline({ entries });
      for (const key of keys) await db.delete(DB_STORE, key);
      setPendingCount(0);
      toast.success(`${entries.length} offline entries synced!`);
    } catch { toast.error('Sync failed. Will retry when online.'); }
  }

  const validate = () => {
    const e = {};
    if (!form.cattle_id) e.cattle_id = 'Select a cattle.';
    if (!form.quantity_litres || isNaN(form.quantity_litres) || +form.quantity_litres <= 0) e.quantity_litres = 'Enter a valid quantity (> 0).';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = { cattle: form.cattle_id, collection_date: today, shift: form.shift, quantity_litres: +form.quantity_litres };
    if (!isOnline) {
      const db = await getOfflineDB();
      await db.add(DB_STORE, payload);
      setPendingCount(c => c + 1);
      toast('Entry saved offline. Will sync when connected.', { icon: '📶' });
      setForm(f => ({ ...f, quantity_litres: '' }));
      setSubmitting(false);
      return;
    }
    try {
      await milkAPI.create(payload);
      toast.success('Milk entry recorded!');
      setForm(f => ({ ...f, quantity_litres: '' }));
      refreshAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to record entry.'); }
    finally { setSubmitting(false); }
  };

  const morningTotal = collections.filter(mc => mc.shift === 'Morning').reduce((s, mc) => s + Number(mc.quantity_litres), 0);
  const eveningTotal = collections.filter(mc => mc.shift === 'Evening').reduce((s, mc) => s + Number(mc.quantity_litres), 0);
  const fullDayTotal = morningTotal + eveningTotal;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🥛 Milk Collection</h1>
        <div className="flex items-center gap-3">
          {!isOnline && <Badge label="Offline Mode" variant="red" />}
          {pendingCount > 0 && (
            <button onClick={handleSync} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-200">
              Sync {pendingCount} pending
            </button>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Date:</label>
            <input type="date" value={selectedDate} max={today} onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500" />
            {selectedDate !== today && (
              <button onClick={() => setSelectedDate(today)} className="text-xs text-primary-600 hover:underline">Today</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Entry form — compact */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-3 self-start">
          <h2 className="font-semibold text-gray-800 text-sm mb-2">Record Entry — {selectedDate}</h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-600">Cattle *</label>
              <select value={form.cattle_id} onChange={e => setForm(f => ({ ...f, cattle_id: e.target.value }))}
                className={`mt-0.5 w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 ${errors.cattle_id ? 'border-red-400' : 'border-gray-300'}`}>
                <option value="">Select cattle…</option>
                {cattle.map(c => <option key={c.id} value={c.id}>{c.tag_number} — {c.name || 'Unnamed'}</option>)}
              </select>
              {errors.cattle_id && <p className="text-red-500 text-xs mt-0.5">{errors.cattle_id}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Shift *</label>
              <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                className="mt-0.5 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary-500">
                <option>Morning</option><option>Evening</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Quantity (Litres) *</label>
              <input type="number" step="0.01" value={form.quantity_litres} onChange={e => setForm(f => ({ ...f, quantity_litres: e.target.value }))}
                className={`mt-0.5 w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 ${errors.quantity_litres ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="e.g. 12.5" />
              {errors.quantity_litres && <p className="text-red-500 text-xs mt-0.5">{errors.quantity_litres}</p>}
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {submitting ? 'Recording…' : (isOnline ? 'Record Entry' : 'Save Offline')}
            </button>
          </form>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">

          {summary && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Summary — {selectedDate}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-700">{Number(summary.total_litres).toFixed(1)} L</div>
                  <div className="text-xs text-gray-500 mt-1">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{summary.cattle_count}</div>
                  <div className="text-xs text-gray-500 mt-1">Cattle</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-700">{Number(summary.avg_fat_pct).toFixed(1)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Fat</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-700">{summary.grade_breakdown?.A || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Grade A</div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE 1: Daily Entries — grouped by cattle, Morning/Evening as columns */}
          {(() => {
            // Build one row per cattle: { name, morning: mc|null, evening: mc|null }
            const cattleMap = {};
            collections.forEach(mc => {
              const key = mc.cattle_detail?.name || mc.cattle_detail?.tag_number || String(mc.cattle);
              if (!cattleMap[key]) cattleMap[key] = { name: key, morning: null, evening: null };
              if (mc.shift === 'Morning') cattleMap[key].morning = mc;
              else cattleMap[key].evening = mc;
            });
            const cattleRows = Object.values(cattleMap);

            const ShiftCell = ({ mc, shift }) => {
              if (!mc) return <td className="px-3 py-2.5 text-center text-gray-300 border border-gray-300">—</td>;
              const isEdit = editingId === mc.id;
              const label = `${mc.cattle_detail?.name || mc.cattle_detail?.tag_number || mc.cattle} — ${shift} ${mc.collection_date}`;
              return (
                <td className={`px-3 py-2 border border-gray-300 ${isEdit ? 'bg-yellow-50' : ''}`}>
                  {isEdit ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input type="number" step="0.01" min="0" value={editVals.quantity_litres}
                        onChange={e => setEditVals(v => ({ ...v, quantity_litres: e.target.value }))}
                        className="w-20 border border-blue-400 rounded px-2 py-1 text-sm text-right" />
                      <button onClick={() => saveEdit(mc.id)} disabled={savingEdit}
                        className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50">
                        {savingEdit ? '…' : '✓'}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-800">{Number(mc.quantity_litres).toFixed(2)}</span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(mc)} className="text-blue-500 hover:text-blue-700 text-sm" title="Edit">✏️</button>
                        <button onClick={() => askDelete(mc.id, label, 'inline')} className="text-red-400 hover:text-red-600 text-sm" title="Delete">🗑️</button>
                      </span>
                    </div>
                  )}
                </td>
              );
            };

            return (
              <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                <div className="p-4 border-b-2 border-gray-300">
                  <h2 className="font-semibold text-gray-800">Entries — {selectedDate}</h2>
                </div>
                <div className="overflow-x-auto" style={{ overflowY: 'clip' }}>
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left border border-gray-300">Cattle</th>
                        <th className="px-4 py-3 text-right border border-gray-300 bg-blue-50 text-blue-700">☀️ Morning (L)</th>
                        <th className="px-4 py-3 text-right border border-gray-300 bg-orange-50 text-orange-700">🌙 Evening (L)</th>
                        <th className="px-4 py-3 text-right border-2 border-gray-400 bg-gray-200">Total (L)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cattleRows.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 border border-gray-300">No entries for this date</td></tr>
                      ) : cattleRows.map((row, idx) => {
                        const rowTotal = (row.morning ? Number(row.morning.quantity_litres) : 0)
                                       + (row.evening ? Number(row.evening.quantity_litres) : 0);
                        return (
                          <tr key={row.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2.5 font-medium text-gray-900 border border-gray-300">{row.name}</td>
                            <ShiftCell mc={row.morning} shift="Morning" />
                            <ShiftCell mc={row.evening} shift="Evening" />
                            <td className="px-4 py-2.5 text-right font-bold text-gray-900 border-2 border-gray-400 bg-gray-50">{rowTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {cattleRows.length > 0 && (
                        <tr className="bg-green-50 font-bold">
                          <td className="px-4 py-2.5 text-green-900 border-2 border-green-400">Daily Total</td>
                          <td className="px-4 py-2.5 text-right text-blue-800 border-2 border-blue-300 bg-blue-50">{morningTotal.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-orange-800 border-2 border-orange-300 bg-orange-50">{eveningTotal.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-green-900 border-2 border-green-400 bg-green-100">{fullDayTotal.toFixed(2)} L</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* TABLE 2: Monthly Breakdown — full width */}
      <div className="mt-6 bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            <div className="p-4 border-b-2 border-gray-300">
              <h2 className="font-semibold text-gray-800">📅 Monthly Milk Production per Cattle (Litres)</h2>
              <p className="text-xs text-gray-400 mt-0.5">June 2025 onwards — click ✏️ to edit a cattle's entries</p>
            </div>
            <div className="overflow-x-auto" style={{ overflowY: 'clip' }}>
              <table className="w-full text-sm border-separate" style={{ borderSpacing: 0 }}>
                <thead className="text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-300 sticky top-0 left-0 bg-gray-100 z-30 whitespace-nowrap">Cattle</th>
                    {monthlyData.months.map(m => (
                      <th key={m} className="px-3 py-3 text-right border border-gray-300 whitespace-nowrap sticky top-0 bg-gray-100 z-20">{m}</th>
                    ))}
                    <th className="px-4 py-3 text-right border-2 border-gray-400 bg-gray-200 whitespace-nowrap sticky top-0 z-20">Total</th>
                    <th className="px-4 py-3 text-center border border-gray-300 bg-gray-100 whitespace-nowrap sticky top-0 z-20">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.cattle.length === 0 ? (
                    <tr><td colSpan={monthlyData.months.length + 3} className="px-4 py-8 text-center text-gray-400 border border-gray-300">No data yet</td></tr>
                  ) : monthlyData.cattle.map((cow, idx) => {
                    const rowTotal = monthlyData.months.reduce((s, m) => s + (cow.months[m] || 0), 0);
                    const bg = idx % 2 === 0 ? '#fff' : '#f9fafb';
                    return (
                      <tr key={cow.cattle_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2.5 font-medium text-gray-900 border border-gray-300 sticky left-0 whitespace-nowrap" style={{ backgroundColor: bg }}>{cow.cattle_name}</td>
                        {monthlyData.months.map(m => (
                          <td key={m} className="px-3 py-2.5 text-right border border-gray-300 text-gray-700">
                            {cow.months[m] ? cow.months[m].toFixed(2) : <span className="text-gray-300">—</span>}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900 border-2 border-gray-400 bg-gray-100">{rowTotal.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-center border border-gray-300" style={{ backgroundColor: bg }}>
                          <button onClick={() => openEditModal(cow.cattle_id, cow.cattle_name, null)} className="text-blue-600 hover:text-blue-800 text-base">✏️</button>
                        </td>
                      </tr>
                    );
                  })}
                  {monthlyData.cattle.length > 0 && (
                    <tr className="bg-green-50 font-bold">
                      <td className="px-4 py-2.5 text-green-900 border border-gray-300 sticky left-0 bg-green-50">Monthly Total</td>
                      {monthlyData.months.map(m => {
                        const colTotal = monthlyData.cattle.reduce((s, cow) => s + (cow.months[m] || 0), 0);
                        return <td key={m} className="px-3 py-2.5 text-right text-green-800 border border-gray-300">{colTotal.toFixed(2)}</td>;
                      })}
                      <td className="px-4 py-2.5 text-right text-green-900 border-2 border-green-400 bg-green-100">
                        {monthlyData.cattle.reduce((s, cow) => s + monthlyData.months.reduce((ms, m) => ms + (cow.months[m] || 0), 0), 0).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 bg-green-50"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
      </div>

      {/* TABLE 3: All-Time Cattle Summary — full width */}
      <div className="mt-6 bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b-2 border-gray-300 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">🐄 Total Milk per Cattle — All Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click ✏️ to edit individual entries for a cattle</p>
          </div>
          <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            Grand Total: {grandTotal.toFixed(2)} L
          </span>
        </div>
        <div className="overflow-x-auto" style={{ overflowY: 'clip' }}>
          <table className="w-full text-sm border-separate" style={{ borderSpacing: 0 }}>
            <thead className="text-gray-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left border border-gray-300 sticky top-0 bg-gray-100 z-10">#</th>
                <th className="px-4 py-3 text-left border border-gray-300 sticky top-0 bg-gray-100 z-10">Cattle Name</th>
                <th className="px-4 py-3 text-left border border-gray-300 sticky top-0 bg-gray-100 z-10">Tag</th>
                <th className="px-4 py-3 text-right border border-gray-300 sticky top-0 bg-gray-100 z-10">Morning (L)</th>
                <th className="px-4 py-3 text-right border border-gray-300 sticky top-0 bg-gray-100 z-10">Evening (L)</th>
                <th className="px-4 py-3 text-right border border-gray-300 sticky top-0 bg-gray-100 z-10">Total (L)</th>
                <th className="px-4 py-3 text-right border border-gray-300 sticky top-0 bg-gray-100 z-10">Entries</th>
                <th className="px-4 py-3 text-center border border-gray-300 sticky top-0 bg-gray-100 z-10">Edit</th>
              </tr>
            </thead>
            <tbody>
              {cattleSummary.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 border border-gray-300">No data yet</td></tr>
              ) : cattleSummary.map((row, idx) => (
                <tr key={row.cattle_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-400 border border-gray-300">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900 border border-gray-300">{row.cattle_name || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs border border-gray-300">{row.tag_number}</td>
                  <td className="px-4 py-2.5 text-right text-blue-700 border border-gray-300">{row.morning_litres.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-orange-700 border border-gray-300">{row.evening_litres.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-900 border border-gray-300">{row.total_litres.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500 border border-gray-300">{row.total_entries}</td>
                  <td className="px-3 py-2.5 text-center border border-gray-300">
                    <button onClick={() => openEditModal(row.cattle_id, row.cattle_name, null)} className="text-blue-600 hover:text-blue-800 text-base">✏️</button>
                  </td>
                </tr>
              ))}
              {cattleSummary.length > 0 && (
                <tr className="bg-green-50 font-bold">
                  <td className="px-4 py-2.5 border border-gray-300"></td>
                  <td className="px-4 py-2.5 text-green-900 border border-gray-300" colSpan={2}>Grand Total</td>
                  <td className="px-4 py-2.5 text-right text-blue-800 border border-gray-300">{cattleSummary.reduce((s, r) => s + r.morning_litres, 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-orange-800 border border-gray-300">{cattleSummary.reduce((s, r) => s + r.evening_litres, 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-green-900 border-2 border-green-400">{grandTotal.toFixed(2)} L</td>
                  <td className="px-4 py-2.5 text-right text-gray-700 border border-gray-300">{cattleSummary.reduce((s, r) => s + r.total_entries, 0)}</td>
                  <td className="border border-gray-300"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl flex-shrink-0">🗑️</div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Entry?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-800 font-medium">
              {deleteConfirm.label}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null, label: '', source: 'inline' })}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4">
            <div className="flex items-center justify-between p-5 border-b-2 border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">✏️ Edit Entries — {editModal.cattleName}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editModal.monthFilter ? `Showing: ${editModal.monthFilter}` : 'All entries — most recent first'}</p>
              </div>
              <button onClick={() => setEditModal(m => ({ ...m, open: false }))} className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">✕</button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {editModal.loadingEntries ? (
                <div className="text-center py-12 text-gray-400">Loading entries…</div>
              ) : editModal.entries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No entries found.</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-xs uppercase sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left border border-gray-300">Date</th>
                      <th className="px-3 py-3 text-left border border-gray-300">Shift</th>
                      <th className="px-3 py-3 text-right border border-gray-300">Qty (L)</th>
                      <th className="px-3 py-3 text-center border border-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editModal.entries.map((mc, idx) => {
                      const isRowEdit = editModal.editingId === mc.id;
                      const label = `${editModal.cattleName} — ${mc.shift} ${mc.collection_date}`;
                      return (
                        <tr key={mc.id} className={isRowEdit ? 'bg-yellow-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 border border-gray-300 font-medium whitespace-nowrap">{mc.collection_date}</td>
                          <td className="px-3 py-2 border border-gray-300 text-gray-600">{mc.shift}</td>
                          <td className="px-2 py-1 border border-gray-300 text-right">
                            {isRowEdit
                              ? <input type="number" step="0.01" min="0" value={editModal.editVals.quantity_litres} onChange={e => setEditModal(m => ({ ...m, editVals: { ...m.editVals, quantity_litres: e.target.value } }))} className="w-24 border border-blue-400 rounded px-2 py-1 text-sm text-right" />
                              : Number(mc.quantity_litres).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-center whitespace-nowrap">
                            {isRowEdit ? (
                              <span className="flex items-center justify-center gap-1">
                                <button onClick={() => saveModalEdit(mc.id)} disabled={editModal.saving} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50">{editModal.saving ? '…' : '✓ Save'}</button>
                                <button onClick={() => setEditModal(m => ({ ...m, editingId: null }))} className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500">✕</button>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <button onClick={() => startModalEdit(mc)} className="text-blue-600 hover:text-blue-800 text-base" title="Edit">✏️</button>
                                <button onClick={() => askDelete(mc.id, label, 'modal')} className="text-red-500 hover:text-red-700 text-base" title="Delete">🗑️</button>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
              <span>{editModal.entries.length} entries shown</span>
              <button onClick={() => setEditModal(m => ({ ...m, open: false }))} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
