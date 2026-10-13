import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Phone, MessageCircle, ArrowLeft, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../api';
import CropIcon from '../components/CropIcon';

export default function BuyerEnquiries() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyEnquiries();
      setEnquiries(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getCropLocalizedName = (item) => {
    if (i18n.language === 'mr') return item.crop_name_mr || item.crop_name_en;
    if (i18n.language === 'hi') return item.crop_name_hi || item.crop_name_en;
    return item.crop_name_en;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-24 sm:pb-12 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/buyer')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {t('buyer.my_enquiries_title')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Track your direct procurement requests with farmers
            </p>
          </div>
        </div>

        <button
          onClick={fetchEnquiries}
          className="p-2 text-slate-500 hover:text-agri-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse h-24"></div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && enquiries.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center text-3xl">
            📋
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {t('buyer.no_sent_enquiries')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse fresh crops in Nashik and tap "Send Enquiry" to contact farmers directly.
          </p>
          <button
            onClick={() => navigate('/buyer')}
            className="inline-flex min-h-[44px] px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl text-xs"
          >
            Browse Marketplace
          </button>
        </div>
      )}

      {/* Enquiries List */}
      {!loading && !error && enquiries.length > 0 && (
        <div className="space-y-3.5">
          {enquiries.map((enquiry) => {
            const cropName = getCropLocalizedName(enquiry);
            const phoneHref = `tel:${enquiry.farmer_mobile}`;
            const whatsappMsg = encodeURIComponent(
              `Namaskar ${enquiry.farmer_name}, I am following up on my enquiry for ${cropName} on AgriConnect.`
            );
            const whatsappHref = `https://wa.me/91${enquiry.farmer_mobile}?text=${whatsappMsg}`;

            return (
              <div
                key={enquiry.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CropIcon cropId={enquiry.crop_id} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {cropName}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          enquiry.status === 'contacted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enquiry.status === 'closed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {enquiry.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Farmer: {enquiry.farmer_name} ({enquiry.farmer_village}, {enquiry.farmer_taluka})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-agri-950 block">
                      {enquiry.quantity_wanted} {enquiry.listing_unit}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      ₹{enquiry.listing_price}/{enquiry.listing_price_unit}
                    </span>
                  </div>
                </div>

                {enquiry.message && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-medium text-slate-700 italic">
                    "{enquiry.message}"
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Sent: {new Date(enquiry.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={phoneHref}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('common.call')}</span>
                    </a>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
