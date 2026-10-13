import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, MessageSquareText, TrendingUp, AlertCircle, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ListingCard from '../components/ListingCard';

export default function HomeFarmer() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyListings();
      setListings(data);
    } catch (err) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleMarkSold = async (id) => {
    try {
      await api.updateListing(id, { status: 'sold' });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const totalEnquiries = listings.reduce((sum, item) => sum + (item.enquiry_count || 0), 0);
  const activeCount = listings.filter(l => l.status === 'active').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 pb-24 sm:pb-12 space-y-5">
      {/* Farmer Greeting Banner */}
      <div className="bg-gradient-to-r from-agri-800 via-agri-700 to-agri-900 rounded-3xl p-5 sm:p-6 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold">
                👨‍🌾
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {user ? user.name : 'Farmer Partner'}
                </h1>
                <p className="text-xs text-agri-200 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-agri-300" />
                  <span>{user?.village || 'Nashik'}, {user?.taluka || 'Niphad'}</span>
                </p>
              </div>
            </div>

            <Link
              to="/farmer/add"
              className="min-h-[48px] px-4 py-2.5 bg-harvest-500 hover:bg-harvest-600 active:scale-95 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-harvest-500/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('farmer.add_button')}</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
              <span className="text-[11px] text-agri-200 uppercase font-bold tracking-wider block">
                {t('farmer.total_listings')}
              </span>
              <span className="text-xl font-black text-white">{activeCount} / {listings.length}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
              <span className="text-[11px] text-agri-200 uppercase font-bold tracking-wider block">
                {t('farmer.total_enquiries')}
              </span>
              <span className="text-xl font-black text-white">{totalEnquiries}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 col-span-2 sm:col-span-1 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-agri-200 uppercase font-bold tracking-wider block">
                  APMC Benchmark
                </span>
                <span className="text-xs font-bold text-agri-100">Lasalgaon & Nashik</span>
              </div>
              <Link to="/mandi-prices" className="text-xs text-harvest-300 font-bold hover:underline">
                View →
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative background leaf */}
        <div className="absolute -right-6 -bottom-8 opacity-10 text-white pointer-events-none text-9xl">
          🌾
        </div>
      </div>

      {/* Section Title & Add produce CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {t('farmer.my_listings_title')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Directly visible to retail shops, hotels & hostels across Nashik
          </p>
        </div>

        <button
          onClick={fetchMyListings}
          className="p-2 text-slate-500 hover:text-agri-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMyListings}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-agri-50 text-agri-700 mx-auto flex items-center justify-center text-3xl">
            🌱
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              {t('farmer.empty_listings')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('farmer.empty_cta')}
            </p>
          </div>
          <Link
            to="/farmer/add"
            className="inline-flex min-h-[48px] px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-2xl text-xs items-center gap-2 shadow-lg shadow-agri-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t('farmer.add_button')}</span>
          </Link>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              isOwner={true}
              onViewDetails={() => navigate(`/farmer/enquiries?listing_id=${item.id}`)}
              onMarkSold={handleMarkSold}
            />
          ))}
        </div>
      )}
    </div>
  );
}
