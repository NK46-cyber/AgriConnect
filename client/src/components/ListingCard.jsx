import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, MessageCircle, Calendar, ShieldCheck, Scale, ArrowRight, CheckCircle } from 'lucide-react';
import CropIcon from './CropIcon';
import MandiBadge from './MandiBadge';

export default function ListingCard({
  listing,
  isOwner = false,
  onEnquire,
  onViewDetails,
  onMarkSold,
  onDelete
}) {
  const { t, i18n } = useTranslation();

  // Localized crop name
  const cropName = (() => {
    if (i18n.language === 'mr') return listing.crop_name_mr || listing.crop_name_en;
    if (i18n.language === 'hi') return listing.crop_name_hi || listing.crop_name_en;
    return listing.crop_name_en;
  })();

  const phoneHref = `tel:${listing.farmer_mobile || ''}`;
  const whatsappMsg = encodeURIComponent(
    `Namaskar ${listing.farmer_name}, I saw your listing for ${listing.crop_name_en} (${listing.quantity} ${listing.unit} @ ₹${listing.asking_price}/${listing.price_unit}) from ${listing.village}, ${listing.taluka} on AgriConnect. Is it still available?`
  );
  const whatsappHref = `https://wa.me/91${listing.farmer_mobile}?text=${whatsappMsg}`;

  // Calculate saving vs mandi if modal price exists
  const modalPrice = listing.mandi_modal_price;
  const isBelowMandi = listing.mandi_comparison?.comparison === 'below';
  const savingAmount = modalPrice ? (modalPrice - listing.asking_price) : 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-floating transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
      listing.status === 'sold' ? 'opacity-70 grayscale-[30%]' : ''
    }`}>
      {/* Top Banner if Sold */}
      {listing.status === 'sold' && (
        <div className="bg-slate-800 text-white text-[11px] font-bold text-center py-1 tracking-wider uppercase">
          {t('farmer.status_sold')}
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header: Crop Icon, Name, Location */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <CropIcon cropId={listing.crop_id} size="md" />
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {cropName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                <span>{listing.village ? `${listing.village}, ` : ''}{listing.taluka}</span>
              </div>
            </div>
          </div>

          {/* Quantity Badge */}
          <div className="text-right shrink-0">
            <span className="inline-block bg-agri-50 text-agri-900 border border-agri-200 font-extrabold px-3 py-1 rounded-xl text-sm">
              {listing.quantity} <span className="text-xs font-semibold">{listing.unit}</span>
            </span>
          </div>
        </div>

        {/* Pricing Matrix & Mandi Comparison (Core Differentiator) */}
        <div className="bg-gradient-to-br from-slate-50 to-agri-50/40 rounded-xl p-3 border border-slate-100 my-3">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('farmer.asking_price')}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-agri-950 font-sans tracking-tight">
                  ₹{listing.asking_price}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  / {listing.price_unit}
                </span>
              </div>
            </div>

            {/* Mandi Benchmark Modal rate */}
            {modalPrice && (
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-600 flex items-center justify-end gap-1">
                  <Scale className="w-3 h-3 text-slate-500" />
                  <span>{t('farmer.modal_rate')}</span>
                </p>
                <p className="text-sm font-bold text-slate-700">
                  ₹{modalPrice} <span className="text-[10px] font-medium">/{listing.price_unit}</span>
                </p>
                <p className="text-[9px] text-slate-500 truncate max-w-[120px]">
                  {listing.mandi_market_name || 'APMC Nashik'}
                </p>
              </div>
            )}
          </div>

          {/* Mandi Comparison Pill */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
            <MandiBadge
              comparison={listing.mandi_comparison}
              modalPrice={modalPrice}
              askingPrice={listing.asking_price}
              unit={listing.price_unit}
            />

            {isBelowMandi && savingAmount > 0 && (
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Save ₹{Math.round(savingAmount)}/{listing.price_unit}!
              </span>
            )}
          </div>
        </div>

        {/* Farmer Information / Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
              👨‍🌾
            </span>
            <span className="truncate max-w-[120px] font-semibold">{listing.farmer_name}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-agri-600" title={t('common.verified_mobile')} />
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{listing.available_until ? `${listing.available_until}` : ''}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center gap-2">
        {isOwner ? (
          // Farmer Owner Controls
          <div className="w-full flex items-center gap-2">
            <button
              onClick={() => onViewDetails && onViewDetails(listing)}
              className="flex-1 min-h-[44px] px-3 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>{t('farmer.enquiries_received')}</span>
              {listing.enquiry_count > 0 && (
                <span className="bg-white text-agri-800 rounded-full px-1.5 py-0.2 text-[10px] font-black">
                  {listing.enquiry_count}
                </span>
              )}
            </button>

            {listing.status === 'active' && onMarkSold && (
              <button
                onClick={() => onMarkSold(listing.id)}
                className="min-h-[44px] px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                title="Mark as sold"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{t('farmer.status_sold')}</span>
              </button>
            )}
          </div>
        ) : (
          // Buyer View Controls: Enquiry Button + Quick Call + WhatsApp
          <div className="w-full flex items-center gap-2">
            <button
              onClick={() => onEnquire && onEnquire(listing)}
              className="flex-1 min-h-[48px] px-3 py-2 bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-agri-700/20 transition-colors"
            >
              <span>{t('buyer.send_enquiry_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Direct Call Button (Min 48px touch target) */}
            <a
              href={phoneHref}
              className="min-w-[48px] min-h-[48px] p-2 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl flex items-center justify-center shadow-sm transition-colors"
              title={t('common.call')}
              aria-label={t('common.call')}
            >
              <Phone className="w-4 h-4 text-agri-700" />
            </a>

            {/* Direct WhatsApp Button (Min 48px touch target) */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[48px] min-h-[48px] p-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-center shadow-sm transition-colors"
              title={t('common.whatsapp')}
              aria-label={t('common.whatsapp')}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
