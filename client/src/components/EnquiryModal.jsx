import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Phone, MessageCircle, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api';
import CropIcon from './CropIcon';
import MandiBadge from './MandiBadge';

export default function EnquiryModal({ listing, isOpen, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [quantityWanted, setQuantityWanted] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !listing) return null;

  const cropName = (() => {
    if (i18n.language === 'mr') return listing.crop_name_mr || listing.crop_name_en;
    if (i18n.language === 'hi') return listing.crop_name_hi || listing.crop_name_en;
    return listing.crop_name_en;
  })();

  const phoneHref = `tel:${listing.farmer_mobile || ''}`;
  const whatsappMsg = encodeURIComponent(
    `Namaskar ${listing.farmer_name}, I am enquiring about ${listing.crop_name_en} (${listing.quantity} ${listing.unit} @ ₹${listing.asking_price}/${listing.price_unit}) from ${listing.village}, ${listing.taluka} on AgriConnect.`
  );
  const whatsappHref = `https://wa.me/91${listing.farmer_mobile}?text=${whatsappMsg}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantityWanted || Number(quantityWanted) <= 0) {
      setError(t('buyer.enquiry_qty_needed') + ' is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.sendEnquiry(listing.id, {
        quantity_wanted: Number(quantityWanted),
        message: message.trim() || undefined
      });

      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQty = (qty) => {
    setQuantityWanted(String(qty));
  };

  const quickMessages = [
    'Can pick up directly from farm',
    'Require morning delivery to mess',
    'Need wholesale crate packaging'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <CropIcon cropId={listing.crop_id} size="sm" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {t('buyer.enquiry_modal_title')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {cropName} • ₹{listing.asking_price}/{listing.price_unit}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('buyer.enquiry_success')}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Farmer {listing.farmer_name} has been notified with your requirements. You can also connect directly right now:
              </p>

              {/* Instant Call / WhatsApp options */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <a
                  href={phoneHref}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-agri-700/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('common.call')} ({listing.farmer_mobile})</span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('common.whatsapp')}</span>
                </a>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="min-h-[44px] px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Farmer and Price Overview Card */}
              <div className="bg-agri-50/60 rounded-2xl p-3.5 border border-agri-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span>👨‍🌾 {listing.farmer_name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {listing.village}, {listing.taluka} • Available: {listing.quantity} {listing.unit}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-agri-950">₹{listing.asking_price}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">/{listing.price_unit}</span>
                  <div className="mt-0.5">
                    <MandiBadge comparison={listing.mandi_comparison} size="normal" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('buyer.enquiry_qty_needed')} ({listing.unit}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={listing.quantity}
                    value={quantityWanted}
                    onChange={(e) => setQuantityWanted(e.target.value)}
                    placeholder={`e.g. 100`}
                    required
                    className="w-full min-h-[50px] px-4 rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-2 focus:ring-agri-500/20 text-base font-bold text-slate-900 placeholder:text-slate-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {listing.unit}
                  </span>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Quick:</span>
                  {[50, 100, 200, listing.quantity].filter(q => q <= listing.quantity).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQuickQty(q)}
                      className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        quantityWanted === String(q)
                          ? 'bg-agri-600 text-white border-agri-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {q === listing.quantity ? `All (${q})` : `${q} ${listing.unit}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('buyer.enquiry_message_opt')}
                </label>
                <textarea
                  rows="2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('buyer.enquiry_message_placeholder')}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-2 focus:ring-agri-500/20 text-xs font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                />

                {/* Quick message chips */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {quickMessages.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMessage(msg)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-medium"
                    >
                      "{msg}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] min-h-[48px] px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-agri-700/25 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? t('farmer.updating') : t('buyer.submit_enquiry')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
