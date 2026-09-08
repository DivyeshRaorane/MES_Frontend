import { useState, useMemo } from 'react';
import {
  ArrowLeft, Loader2, Search, PackageSearch, AlertCircle,
  Inbox, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { showError } from '../../../../utils/toastService';
import { queryMaterialStock } from '../services/stock_search.api';

/* Inventory Stock Type options */
const STOCK_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: '01', label: 'Unrestricted (01)' },
  { value: '02', label: 'Quality (02)' },
  { value: '03', label: 'Blocked (03)' },
];

const STOCK_TYPE_LABEL = {
  '01': 'Unrestricted',
  '02': 'Quality',
  '03': 'Blocked',
};

/* Table columns: key = row property, numeric = right aligned */
const COLUMNS = [
  { key: 'StorageLocation', label: 'Storage Location' },
  { key: 'Batch', label: 'Batch' },
  { key: 'MatlWrhsStkQtyInMatlBaseUnit', label: 'Quantity', numeric: true },
  { key: 'MaterialBaseUnit', label: 'UOM' },
  { key: 'InventoryStockType', label: 'Inventory Stock Type' },
  { key: 'InventorySpecialStockType', label: 'Special Stock Type' },
  { key: 'Supplier', label: 'Supplier' },
  { key: 'Customer', label: 'Customer' },
];

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const StockSearchPanel = ({ onBack }) => {
  const [form, setForm] = useState({ Material: '', Plant: '1200', InventoryStockType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { message, count, data, meta }

  const [filter, setFilter] = useState('');
  const [hideZero, setHideZero] = useState(false);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const canSearch = form.Material.trim() && form.Plant.trim() && !loading;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!form.Material.trim() || !form.Plant.trim()) {
      setError('Material and Plant are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await queryMaterialStock(form);
      if (res?.success) {
        setResult({
          message: res.message,
          count: res.count ?? (res.data?.length || 0),
          data: Array.isArray(res.data) ? res.data : [],
          meta: { Material: form.Material.trim(), Plant: form.Plant.trim() },
        });
        // reset view controls on a fresh query
        setSort({ key: null, dir: 'asc' });
      } else {
        setResult(null);
        setError(res?.message || 'Stock query failed.');
      }
    } catch (err) {
      setResult(null);
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setError(msg);
      showError(msg);
    }
    setLoading(false);
  };

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  /* Filtered + sorted rows */
  const rows = useMemo(() => {
    let list = result?.data || [];

    if (hideZero) {
      list = list.filter((r) => toNumber(r.MatlWrhsStkQtyInMatlBaseUnit) !== 0);
    }

    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.Batch || '').toLowerCase().includes(q) ||
          (r.StorageLocation || '').toLowerCase().includes(q)
      );
    }

    if (sort.key) {
      const col = COLUMNS.find((c) => c.key === sort.key);
      const numeric = !!col?.numeric;
      list = [...list].sort((a, b) => {
        let av = a[sort.key];
        let bv = b[sort.key];
        if (numeric) {
          av = toNumber(av);
          bv = toNumber(bv);
          return sort.dir === 'asc' ? av - bv : bv - av;
        }
        av = (av ?? '').toString().toLowerCase();
        bv = (bv ?? '').toString().toLowerCase();
        if (av < bv) return sort.dir === 'asc' ? -1 : 1;
        if (av > bv) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [result, filter, hideZero, sort]);

  const totalQty = useMemo(
    () => rows.reduce((sum, r) => sum + toNumber(r.MatlWrhsStkQtyInMatlBaseUnit), 0),
    [rows]
  );

  const hasResult = !!result;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sky-600 bg-sky-100">
              <PackageSearch size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Stock Search</span>
            {hasResult && (
              <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                {result.count} rows
              </span>
            )}
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch}
          className="px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-0.5 flex-1 min-w-[160px]">
              <label className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">Material <span className="text-rose-500">*</span></label>
              <input value={form.Material} onChange={handleChange('Material')}
                placeholder="e.g. SMFG652D250"
                className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-0.5 w-28">
              <label className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">Plant <span className="text-rose-500">*</span></label>
              <input value={form.Plant} onChange={handleChange('Plant')}
                placeholder="1200"
                className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-0.5 w-44">
              <label className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">Inventory Stock Type</label>
              <select value={form.InventoryStockType} onChange={handleChange('InventoryStockType')}
                className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                {STOCK_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!canSearch}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              {loading ? 'Fetching...' : 'Fetch Stock'}
            </button>
          </div>
        </form>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex-shrink-0">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span className="text-[11px] font-semibold">{error}</span>
          </div>
        )}

        {/* Summary + view controls */}
        {hasResult && !error && (
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Material</span>
                <span className="text-xs font-bold font-mono text-slate-700">{result.meta.Material}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Plant</span>
                <span className="text-xs font-bold font-mono text-slate-700">{result.meta.Plant}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total Rows</span>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{result.count}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total Qty</span>
                <span className="text-xs font-bold text-emerald-700">{totalQty.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 cursor-pointer select-none">
                <input type="checkbox" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)}
                  className="accent-blue-600 w-3 h-3" />
                Hide zero qty
              </label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={filter} onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter batch / location..."
                  className="pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-52" />
              </div>
            </div>
          </div>
        )}

        {/* Table / states */}
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
              <span className="text-xs text-slate-500">Fetching stock...</span>
            </div>
          ) : !hasResult ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
              <PackageSearch size={32} className="opacity-40" />
              <p className="text-xs font-semibold">Enter a material and plant, then Fetch Stock.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
              <Inbox size={32} className="opacity-40" />
              <p className="text-xs font-semibold">
                {result.data.length === 0 ? 'No stock found for this query.' : 'No rows match the current filter.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {COLUMNS.map((c) => {
                    const active = sort.key === c.key;
                    const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                    return (
                      <th key={c.key}
                        onClick={() => toggleSort(c.key)}
                        className={`px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0 cursor-pointer select-none hover:text-white ${c.numeric ? 'text-right' : ''}`}>
                        <span className={`inline-flex items-center gap-1 ${c.numeric ? 'flex-row-reverse' : ''}`}>
                          {c.label}
                          <SortIcon size={10} className={active ? 'text-blue-300' : 'text-slate-500'} />
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => {
                  const qty = toNumber(r.MatlWrhsStkQtyInMatlBaseUnit);
                  const isZero = qty === 0;
                  return (
                    <tr key={`${r.StorageLocation}-${r.Batch}-${i}`}
                      className={`hover:bg-blue-50/30 transition-colors ${isZero ? 'bg-slate-50/60 text-slate-400' : ''}`}>
                      <td className="px-4 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{r.StorageLocation || '—'}</td>
                      <td className="px-4 py-2 text-xs font-mono text-slate-700 border-r border-slate-100">{r.Batch || '—'}</td>
                      <td className={`px-4 py-2 text-xs font-mono border-r border-slate-100 text-right ${isZero ? '' : 'font-bold text-slate-800'}`}>
                        {qty.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600 border-r border-slate-100">{r.MaterialBaseUnit || '—'}</td>
                      <td className="px-4 py-2 border-r border-slate-100">
                        <span className="text-[9px] font-semibold text-slate-600">
                          {STOCK_TYPE_LABEL[r.InventoryStockType] || r.InventoryStockType || '—'}
                          {r.InventoryStockType ? ` (${r.InventoryStockType})` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600 border-r border-slate-100">{r.InventorySpecialStockType || '—'}</td>
                      <td className="px-4 py-2 text-xs text-slate-600 border-r border-slate-100">{r.Supplier || '—'}</td>
                      <td className="px-4 py-2 text-xs text-slate-600">{r.Customer || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearchPanel;
