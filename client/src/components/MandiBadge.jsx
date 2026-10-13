import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MandiBadge({ comparison, modalPrice, askingPrice, unit = 'kg', size = 'normal' }) {
  const { t } = useTranslation();

  if (!comparison || comparison.comparison === 'unknown') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        <AlertCircle className="w-3.5 h-3.5" />
        {t('indicators.no_mandi')}
      </span>
    );
  }

  const { comparison: type, diffPercent, savingOrPremium } = comparison;

  if (type === 'below') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm transition-all ${
        size === 'lg' ? 'px-4 py-2 text-sm bg-emerald-100 text-emerald-800 border border-emerald-300' : 'px-3 py-1 text-xs bg-emerald-100 text-emerald-800 border border-emerald-200'
      }`}>
        <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
        <TrendingDown className={size === 'lg' ? 'w-4 h-4 text-emerald-700' : 'w-3.5 h-3.5 text-emerald-700'} />
        <span>{t('indicators.below_mandi')}</span>
        {diffPercent !== 0 && (
          <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded text-[11px] font-extrabold text-emerald-900">
            {Math.abs(diffPercent)}% {t('buyer.saving_label').split(' ')[0]}
          </span>
        )}
      </div>
    );
  }

  if (type === 'above') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm transition-all ${
        size === 'lg' ? 'px-4 py-2 text-sm bg-amber-100 text-amber-800 border border-amber-300' : 'px-3 py-1 text-xs bg-amber-100 text-amber-800 border border-amber-200'
      }`}>
        <TrendingUp className={size === 'lg' ? 'w-4 h-4 text-amber-700' : 'w-3.5 h-3.5 text-amber-700'} />
        <span>{t('indicators.above_mandi')}</span>
        {diffPercent !== 0 && (
          <span className="bg-amber-200/80 px-1.5 py-0.5 rounded text-[11px] font-extrabold text-amber-900">
            +{diffPercent}%
          </span>
        )}
      </div>
    );
  }

  // Near mandi price
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm transition-all ${
      size === 'lg' ? 'px-4 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-300' : 'px-3 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      <CheckCircle2 className={size === 'lg' ? 'w-4 h-4 text-blue-700' : 'w-3.5 h-3.5 text-blue-700'} />
      <span>{t('indicators.near_mandi')}</span>
      <span className="bg-blue-200/80 px-1.5 py-0.5 rounded text-[11px] font-semibold text-blue-900">
        ±5%
      </span>
    </div>
  );
}
