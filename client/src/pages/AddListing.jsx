import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Scale, Info, Sparkles, MapPin, Calendar, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import CropIcon from '../components/CropIcon';
import MandiBadge from '../components/MandiBadge';

const NASHIK_TALUKAS = [
  'Niphad', 'Nashik', 'Sinnar', 'Dindori', 'Igatpuri', 
  'Kalwan', 'Yeola', 'Baglan', 'Chandwad', 'Deola', 
  'Malegaon', 'Nandgaon', 'Surgana', 'Trimbakeshwar', 'Peth'
];

export default function AddListing() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(1); // Default Onion (Demo script)
  const [quantity, setQuantity] = useState('500'); // Default 500 kg (matches demo script step 1!)
  const [unit, setUnit] = useState('kg');
  const [askingPrice, setAskingPrice] = useState('18'); // Default Rs 18/kg (matches demo script step 1!)
  const [taluka, setTaluka] = useState(user?.taluka || 'Niphad');
  const [village, setVillage] = useState(user?.village || 'Kundewadi');
  const [availableDays, setAvailableDays] = useState(7);
  const [mandiPrice, setMandiPrice] = useState(null);
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load crops
  useEffect(() => {
    api.getCrops()
      .then(data => {
        setCrops(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch benchmark mandi price for selected crop
  useEffect(() => {
    if (!selectedCropId) return;
    setLoadingMandi(true);
    api.getMandiPriceForCrop(selectedCropId, 'Nashik')
      .then(price => {
        setMandiPrice(price);
        if (price) {
          setUnit(price.unit || 'kg');
        }
      })
      .catch(() => setMandiPrice(null))
      .finally(() => setLoadingMandi(false));
  }, [selectedCropId]);

  // Compute live price comparison
  const modalPrice = mandiPrice?.modal_price;
  const numPrice = Number(askingPrice);
  const comparison = (() => {
    if (!modalPrice || !numPrice || numPrice <= 0) {
      return { comparison: 'unknown', diffPercent: 0, label: 'Enter price' };
    }
    const diff = ((numPrice - modalPrice) / modalPrice) * 100;
    if (diff < -5) {
      return { comparison: 'below', diffPercent: Math.round(diff * 10) / 10, label: 'Below mandi price' };
    } else if (diff > 5) {
      return { comparison: 'above', diffPercent: Math.round(diff * 10) / 10, label: 'Above mandi price' };
    } else {
      return { comparison: 'near', diffPercent: Math.round(diff * 10) / 10, label: 'Near mandi price' };
    }
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCropId || !quantity || !askingPrice || !taluka) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    const availableDate = new Date(Date.now() + availableDays * 86400000).toISOString().split('T')[0];

    try {
      await api.createListing({
        crop_id: Number(selectedCropId),
        quantity: Number(quantity),
        unit,
        asking_price: Number(askingPrice),
        price_unit: unit,
        village: village.trim() || 'Village Center',
        taluka,
        available_until: availableDate
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      navigate('/farmer');
    } catch (err) {
      setError(err.message || 'Failed to list produce');
    } finally {
      setSubmitting(false);
    }
  };

  const getCropLocalizedName = (crop) => {
    if (i18n.language === 'mr') return crop.name_mr;
    if (i18n.language === 'hi') return crop.name_hi;
    return crop.name_en;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-24 sm:pb-12 space-y-5">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {t('farmer.form_title')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            List in under 60 seconds with live APMC benchmark comparison
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Crop Picker with Large Visual Icons (Low Literacy UX) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-3">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
            1. {t('farmer.select_crop')} *
          </label>

          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {crops.map((c) => {
              const isSelected = Number(selectedCropId) === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCropId(c.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-agri-600 bg-agri-50 shadow-md scale-102 ring-2 ring-agri-500/20'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100'
                  }`}
                >
                  <CropIcon cropId={c.id} size="sm" />
                  <span className={`text-[11px] font-bold mt-1 text-center truncate w-full ${
                    isSelected ? 'text-agri-950 font-black' : 'text-slate-700'
                  }`}>
                    {getCropLocalizedName(c)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Live Mandi Benchmark & Asking Price Comparison Box */}
        <div className="bg-gradient-to-br from-agri-50 via-emerald-50/50 to-blue-50/40 rounded-3xl p-4 sm:p-5 border border-agri-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-agri-950">
              <Scale className="w-4 h-4 text-agri-700" />
              <span>{t('farmer.mandi_comparison_box')}</span>
            </div>
            <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {mandiPrice?.market_name || 'APMC Lasalgaon/Nashik'}
            </span>
          </div>

          {/* Mandi Rate details */}
          <div className="grid grid-cols-2 gap-3 bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-agri-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('farmer.modal_rate')}
              </span>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                ₹{mandiPrice ? mandiPrice.modal_price : '...'}
                <span className="text-xs font-semibold text-slate-500"> /{unit}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('farmer.min_max')}
              </span>
              <div className="text-xs font-bold text-slate-700 mt-1">
                ₹{mandiPrice?.min_price || '-'} - ₹{mandiPrice?.max_price || '-'} /{unit}
              </div>
            </div>
          </div>

          {/* Asking Price Input */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              2. {t('farmer.asking_price')} ({unit}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="18"
                required
                className="w-full min-h-[52px] pl-10 pr-20 rounded-2xl border-2 border-agri-300 focus:border-agri-600 focus:ring-4 focus:ring-agri-500/20 text-xl font-black text-agri-950 bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">
                / {unit}
              </span>
            </div>
          </div>

          {/* Live Dynamic Price Comparison Feedback */}
          {modalPrice && numPrice > 0 && (
            <div className="p-3 bg-white rounded-2xl border border-agri-100 flex items-center justify-between animate-in fade-in duration-150">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Buyer Comparison:</span>
                <MandiBadge
                  comparison={comparison}
                  modalPrice={modalPrice}
                  askingPrice={numPrice}
                  unit={unit}
                  size="normal"
                />
              </div>

              <div className="text-right text-[11px] font-bold text-slate-700">
                {comparison.comparison === 'below' && (
                  <span className="text-emerald-700">Attractive rate! Buyers save ₹{Math.round(modalPrice - numPrice)}/{unit}</span>
                )}
                {comparison.comparison === 'near' && (
                  <span className="text-blue-700">Fair APMC market benchmark</span>
                )}
                {comparison.comparison === 'above' && (
                  <span className="text-amber-700">Premium rate (+{comparison.diffPercent}%)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Quantity & Location */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-4">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
            3. Quantity & Farm Location
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {t('farmer.quantity')} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {t('auth.taluka')} *
              </label>
              <select
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              >
                {NASHIK_TALUKAS.map((tk) => (
                  <option key={tk} value={tk}>{tk}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {t('auth.village')}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Kundewadi"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Available For
              </label>
              <select
                value={availableDays}
                onChange={(e) => setAvailableDays(Number(e.target.value))}
                className="w-full min-h-[48px] px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              >
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Big Submit Button (Accessible 48px+ touch target) */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[52px] py-3.5 bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white rounded-2xl text-base font-black flex items-center justify-center gap-2 shadow-xl shadow-agri-700/30 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-harvest-300" />
          <span>{submitting ? t('farmer.updating') : t('farmer.submit_listing')}</span>
        </button>
      </form>
    </div>
  );
}
