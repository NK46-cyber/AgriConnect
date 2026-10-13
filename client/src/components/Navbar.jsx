import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Globe, User, LogOut, RotateCcw, ChevronDown, Check, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Navbar({ onResetDemo }) {
  const { t, i18n } = useTranslation();
  const { user, logout, quickLoginAs, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const languages = [
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' }
  ];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('agriconnect_language', code);
    setLangOpen(false);
  };

  const handleQuickSwitch = async (account) => {
    setDemoOpen(false);
    await quickLoginAs(account.mobile);
    if (account.role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/buyer');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset database to original demo state? All crops, 12 listings, and benchmark prices will be restored.')) return;
    setResetting(true);
    try {
      await api.resetDemo();
      if (onResetDemo) onResetDemo();
      alert('Demo data successfully reset!');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-agri-100 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Pilot badge */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-600 to-agri-700 flex items-center justify-center text-white shadow-md shadow-agri-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-agri-950 font-sans">
                Agri<span className="text-agri-600">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-agri-100 text-agri-800 border border-agri-200">
                Nashik
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t('common.tagline')}
            </p>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setDemoOpen(false); }}
              className="min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-agri-500"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-agri-700" />
              <span>{languages.find(l => l.code === i18n.language)?.label || 'मराठी'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-agri-50 ${
                      i18n.language === l.code ? 'text-agri-700 font-bold bg-agri-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    {i18n.language === l.code && <Check className="w-3.5 h-3.5 text-agri-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => { setDemoOpen(!demoOpen); setLangOpen(false); }}
              className="min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-harvest-50 hover:bg-harvest-100 border border-harvest-200 text-harvest-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Quickly switch demo persona"
            >
              <User className="w-3.5 h-3.5 text-harvest-700" />
              <span className="hidden sm:inline font-bold">
                {user ? user.name.split(' ')[0] : 'Demo User'}
              </span>
              <span className="sm:hidden font-bold">
                {user?.role ? (user.role === 'farmer' ? '👨‍🌾' : '🛒') : 'Demo'}
              </span>
              <ChevronDown className="w-3 h-3 text-harvest-700" />
            </button>

            {demoOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t('auth.quick_demo_login')}
                  </p>
                </div>

                <div className="space-y-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.mobile}
                      onClick={() => handleQuickSwitch(acc)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        user?.mobile === acc.mobile ? 'bg-agri-50 border border-agri-200 text-agri-950 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{acc.role === 'farmer' ? '👨‍🌾' : '🛒'}</span>
                          <span className="font-bold">{acc.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 ml-5">
                          {acc.taluka} • {acc.cropDesc}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        acc.role === 'farmer' ? 'bg-agri-100 text-agri-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
                    <span>Reset Data</span>
                  </button>
                  {user && (
                    <button
                      onClick={logout}
                      className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
