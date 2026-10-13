import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, PlusCircle, MessageSquareText, TrendingUp, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ enquiryBadge = 0 }) {
  const { t } = useTranslation();
  const { isFarmer, isBuyer } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
        {isFarmer ? (
          <>
            {/* Farmer Tab 1: My Produce */}
            <NavLink
              to="/farmer"
              end
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.my_listings')}</span>
            </NavLink>

            {/* Farmer Tab 2: Add Produce (Accent Hero Button) */}
            <NavLink
              to="/farmer/add"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-600 font-medium hover:text-slate-900'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-md shadow-agri-600/30 -mt-2">
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 font-bold text-agri-800">{t('nav.add_produce')}</span>
            </NavLink>

            {/* Farmer Tab 3: Enquiries */}
            <NavLink
              to="/farmer/enquiries"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 relative transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <MessageSquareText className="w-5 h-5 mb-0.5" />
                {enquiryBadge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {enquiryBadge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight">{t('nav.my_enquiries')}</span>
            </NavLink>

            {/* Farmer Tab 4: Mandi Rates */}
            <NavLink
              to="/mandi-prices"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.mandi_prices')}</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* Buyer Tab 1: Marketplace */}
            <NavLink
              to="/buyer"
              end
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.browse')}</span>
            </NavLink>

            {/* Buyer Tab 2: My Sent Enquiries */}
            <NavLink
              to="/buyer/enquiries"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <MessageSquareText className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.my_enquiries')}</span>
            </NavLink>

            {/* Buyer Tab 3: Mandi Rates */}
            <NavLink
              to="/mandi-prices"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.mandi_prices')}</span>
            </NavLink>

            {/* Buyer Tab 4: Account / Switch */}
            <NavLink
              to="/login"
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-agri-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold mb-0.5">
                🛒
              </div>
              <span className="text-[11px] leading-tight">{t('nav.profile')}</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
