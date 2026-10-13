import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquareText, Phone, MessageCircle, CheckCircle, Clock, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api';
import CropIcon from '../components/CropIcon';

export default function FarmerEnquiries() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterListingId = searchParams.get('listing_id');

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

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await api.updateEnquiryStatus(enquiryId, newStatus);
      setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filtered = filterListingId
    ? enquiries.filter(e => String(e.listing_id) === String(filterListingId))
    : enquiries;

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
            onClick={() => navigate('/farmer')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {t('farmer.enquiries_received')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Direct enquiries from Nashik hotels, hostels & retailers
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

      {filterListingId && (
        <div className="flex items-center justify-between bg-agri-50 border border-agri-200 px-4 py-2.5 rounded-2xl text-xs font-semibold text-agri-900">
          <span>Filtering enquiries for Listing #{filterListingId}</span>
          <button
            onClick={() => navigate('/farmer/enquiries')}
            className="font-bold underline hover:text-agri-950"
          >
            Show All
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse h-28"></div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center text-3xl">
            📬
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {t('farmer.no_enquiries')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When buyers in Nashik express interest in your listed crops, their requests will appear here with instant call and WhatsApp access.
          </p>
        </div>
      )}

      {/* Enquiries List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3.5">
          {filtered.map((enquiry) => {
            const cropName = getCropLocalizedName(enquiry);
            const phoneHref = `tel:${enquiry.buyer_mobile}`;
            const whatsappMsg = encodeURIComponent(
              `Namaskar ${enquiry.buyer_name}, I am following up on your enquiry for ${cropName} (${enquiry.quantity_wanted} ${enquiry.listing_unit}) on AgriConnect.`
            );
            const whatsappHref = `https://wa.me/91${enquiry.buyer_mobile}?text=${whatsappMsg}`;

            return (
              <div
                key={enquiry.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-3 transition-all hover:border-agri-300"
              >
                {/* Header row: Buyer Name, Type, Crop Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-lg font-bold">
                      🛒
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {enquiry.buyer_name}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">
                          {enquiry.buyer_type || 'Buyer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Phone: {enquiry.buyer_mobile}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-agri-50 border border-agri-200 text-agri-950 font-extrabold px-2.5 py-1 rounded-xl text-xs">
                      {enquiry.quantity_wanted} {enquiry.listing_unit} wanted
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cropName} @ ₹{enquiry.listing_price}/{enquiry.listing_price_unit}
                    </p>
                  </div>
                </div>

                {/* Message note if present */}
                {enquiry.message && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-medium text-slate-700 italic">
                    "{enquiry.message}"
                  </div>
                )}

                {/* Actions: Direct Call & WhatsApp Buttons (Min 48px Touch Targets) */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Status:</span>
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                      className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        enquiry.status === 'contacted'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : enquiry.status === 'closed'
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct Call Buyer */}
                    <a
                      href={phoneHref}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 active:bg-agri-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('common.call_buyer')}</span>
                    </a>

                    {/* Direct WhatsApp Buyer */}
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
