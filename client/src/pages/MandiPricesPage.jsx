import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Info, RefreshCw, AlertCircle, ArrowUpRight, TrendingUp, Calendar, MapPin } from 'lucide-react';
import api from '../api';
import CropIcon from '../components/CropIcon';

export default function MandiPricesPage() {
  const { t, i18n } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMandiPrices('Nashik');
      setPrices(data);
    } catch (err) {
      setError(err.message || 'Failed to load mandi prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const getCropLocalizedName = (item) => {
    if (i18n.language === 'mr') return item.name_mr || item.name_en;
    if (i18n.language === 'hi') return item.name_hi || item.name_en;
    return item.name_en;
  };

  const filteredPrices = categoryFilter === 'all'
    ? prices
    : prices.filter(p => p.category === categoryFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-24 sm:pb-12 space-y-5">
      {/* Page Title & Mandatory Sample Data Notice */}
      <div className="bg-gradient-to-r from-slate-900 to-agri-950 rounded-3xl p-5 sm:p-6 text-white shadow-card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-harvest-500/20 text-harvest-300 border border-harvest-500/30">
                {t('common.sample_data')}
              </span>
              <span className="text-xs text-slate-400">Nashik District APMCs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t('mandi.title')}
            </h1>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-medium">
              {t('mandi.subtitle')}
            </p>
          </div>

          <button
            onClick={fetchPrices}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh rates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Explicit Sample Data Disclaimer */}
        <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 flex items-start gap-2.5 text-[11px] text-amber-200">
          <Info className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
          <span>
            {t('common.sample_data_disclaimer')}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'vegetable', 'fruit', 'grain'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-agri-700 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Commodities' : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm animate-pulse h-20"></div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Prices Grid / Table */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredPrices.map((item) => {
            const cropName = getCropLocalizedName(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card hover:border-agri-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header: Crop Icon, Name, Market Yard */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CropIcon cropId={item.crop_id} size="sm" />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {cropName}
                        </h3>
                        <p className="text-[11px] font-semibold text-agri-800 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-agri-600" />
                          <span>{item.market_name}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.unit}
                    </span>
                  </div>

                  {/* Price Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t('mandi.min_price')}
                      </span>
                      <span className="text-sm font-bold text-slate-700">₹{item.min_price}</span>
                    </div>

                    <div className="bg-white rounded-lg py-1 shadow-xs border border-agri-100">
                      <span className="text-[10px] font-extrabold text-agri-800 block uppercase">
                        {t('mandi.modal_price')}
                      </span>
                      <span className="text-base font-black text-agri-950">₹{item.modal_price}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t('mandi.max_price')}
                      </span>
                      <span className="text-sm font-bold text-slate-700">₹{item.max_price}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated: {item.price_date}</span>
                  </span>
                  <span className="truncate max-w-[150px] font-semibold text-slate-500">
                    {item.source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
