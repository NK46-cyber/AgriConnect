import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sprout, Phone, ShieldCheck, ArrowRight, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const NASHIK_TALUKAS = [
  'Nashik', 'Niphad', 'Sinnar', 'Dindori', 'Igatpuri', 
  'Kalwan', 'Yeola', 'Baglan', 'Chandwad', 'Deola', 
  'Malegaon', 'Nandgaon', 'Surgana', 'Trimbakeshwar', 'Peth'
];

export default function Login() {
  const { t } = useTranslation();
  const { loginWithSession, quickLoginAs, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('farmer'); // 'farmer' | 'buyer'
  const [buyerType, setBuyerType] = useState('hostel');
  const [name, setName] = useState('');
  const [taluka, setTaluka] = useState('Niphad');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      setError(t('auth.mobile_placeholder'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.requestOtp(mobile.trim());
      setStep('otp');
      setOtp('123456'); // Pre-fill mock OTP for smooth demo
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError(t('auth.enter_otp'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp({
        mobile: mobile.trim(),
        otp: otp.trim(),
        role,
        name: name.trim() || undefined,
        buyer_type: role === 'buyer' ? buyerType : undefined,
        taluka,
        village: village.trim() || undefined
      });

      loginWithSession(res.user, res.token);
      if (res.user.role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account) => {
    setLoading(true);
    try {
      await quickLoginAs(account.mobile);
      if (account.role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-agri-50/60 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* App Hero Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-agri-700 to-agri-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-agri-600/30">
            <Sprout className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.welcome_title')}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t('auth.welcome_sub')}
          </p>
        </div>

        {/* 1-Tap Quick Demo Personas (Crucial for live judging / evaluation) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl p-3.5 border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('auth.quick_demo_login')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.mobile}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                className="min-h-[48px] p-2 bg-white hover:bg-amber-100/50 active:scale-98 rounded-xl border border-amber-200 text-left transition-all shadow-xs"
              >
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900 truncate">
                  <span>{acc.role === 'farmer' ? '👨‍🌾' : '🛒'}</span>
                  <span className="truncate">{acc.name}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-0.5">
                  <span className="capitalize">{acc.role}</span>
                  <span className="text-agri-700 font-bold">{acc.taluka}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Step 1: Mobile Input */}
        {step === 'mobile' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {t('auth.mobile_number')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9822011111"
                  required
                  className="w-full min-h-[50px] pl-14 pr-4 rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-2 focus:ring-agri-500/20 text-base font-bold text-slate-900 tracking-wider placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                <span>{t('auth.otp_hint')}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-agri-700/25 transition-all disabled:opacity-50"
            >
              <span>{loading ? t('common.loading') : t('auth.send_otp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification & Role Details */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t('auth.enter_otp')}
                </label>
                <button
                  type="button"
                  onClick={() => setStep('mobile')}
                  className="text-xs text-agri-700 font-bold hover:underline"
                >
                  Change Number ({mobile})
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full min-h-[50px] pl-11 pr-4 rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-2 focus:ring-agri-500/20 text-lg font-black tracking-widest text-slate-900 text-center"
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                ✓ {t('auth.otp_hint')}
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {t('auth.select_role')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`min-h-[48px] p-2.5 rounded-xl border-2 text-left transition-all ${
                    role === 'farmer'
                      ? 'border-agri-600 bg-agri-50/80 text-agri-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span>👨‍🌾</span>
                    <span>{t('roles.farmer')}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {t('auth.farmer_desc')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`min-h-[48px] p-2.5 rounded-xl border-2 text-left transition-all ${
                    role === 'buyer'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span>🛒</span>
                    <span>{t('roles.buyer')}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {t('auth.buyer_desc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Extra details for sign-up */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {t('auth.full_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {t('auth.taluka')}
                </label>
                <select
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  {NASHIK_TALUKAS.map((tk) => (
                    <option key={tk} value={tk}>{tk}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buyer Type if buyer selected */}
            {role === 'buyer' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {t('auth.buyer_category')}
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="hostel">{t('buyer_types.hostel')}</option>
                  <option value="hotel">{t('buyer_types.hotel')}</option>
                  <option value="retailer">{t('buyer_types.retailer')}</option>
                  <option value="bulk">{t('buyer_types.bulk')}</option>
                  <option value="household">{t('buyer_types.household')}</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-agri-700/25 transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? t('common.loading') : t('auth.verify_and_login')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
