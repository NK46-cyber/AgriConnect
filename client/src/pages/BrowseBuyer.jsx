import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ListingCard from '../components/ListingCard';
import EnquiryModal from '../components/EnquiryModal';

const NASHIK_TALUKAS = [
  'All', 'Niphad', 'Nashik', 'Sinnar', 'Dindori', 'Igatpuri', 
  'Kalwan', 'Yeola', 'Baglan', 'Chandwad'
];

export default function BrowseBuyer() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedListingForEnquiry, setSelectedListingForEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Crops
  useEffect(() => {
    api.getCrops()
      .then(setCrops)
      .catch(console.error);
  }, []);

  // Fetch Listings with applied filters
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getListings({
        crop_id: selectedCropId || undefined,
        taluka: selectedTaluka !== 'All' ? selectedTaluka : undefined,
        sort: sortBy,
        search: searchQuery.trim() || undefined
      });
      setListings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch produce');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCropId, selectedTaluka, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setSelectedCropId('');
    setSelectedTaluka('All');
    setSortBy('newest');
    setSearchQuery('');
  };

  const handleOpenEnquiry = (listing) => {
    setSelectedListingForEnquiry(listing);
    setIsModalOpen(true);
  };

  const getCropLocalizedName = (crop) => {
    if (i18n.language === 'mr') return crop.name_mr;
    if (i18n.language === 'hi') return crop.name_hi;
    return crop.name_en;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 sm:pb-12 space-y-5">
      {/* Top Banner / Marketplace Header */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white shadow-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-agri-700/80 text-agri-100 border border-agri-600">
              Direct Farm Sourcing
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t('buyer.browse_title')}
            </h1>
            <p className="text-xs text-agri-200 font-medium">
              {t('buyer.browse_sub')}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-agri-200 block">Buyer Portal</span>
            <span className="text-sm font-black text-harvest-300">
              {user ? `${user.name} (${user.buyer_type || 'Buyer'})` : 'Guest Buyer'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-3.5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-full min-h-[48px] pl-11 pr-24 rounded-2xl border border-slate-200 focus:border-agri-600 focus:ring-2 focus:ring-agri-500/20 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50/60"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] px-3.5 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {t('roles.buyer') === 'खरेदीदार' ? 'शोधा' : 'Search'}
          </button>
        </form>

        {/* Crop Filter Horizontal Chips (Scrollable) */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setSelectedCropId('')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCropId === ''
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🌱 {t('common.all_crops')}
            </button>

            {crops.map((c) => {
              const active = String(selectedCropId) === String(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropId(active ? '' : c.id)}
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-agri-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{getCropLocalizedName(c)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Filters: Taluka & Sorting */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('auth.taluka')}:
            </span>
            <select
              value={selectedTaluka}
              onChange={(e) => setSelectedTaluka(e.target.value)}
              className="min-h-[38px] px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {NASHIK_TALUKAS.map((tk) => (
                <option key={tk} value={tk}>{tk === 'All' ? t('common.all_talukas') : tk}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('buyer.sort_by')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-[38px] px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="newest">{t('buyer.sort_newest')}</option>
              <option value="price_asc">{t('buyer.sort_price_low')}</option>
              <option value="price_desc">{t('buyer.sort_price_high')}</option>
              <option value="quantity_desc">{t('buyer.sort_qty_high')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
        <span>Found {listings.length} produce listings in Nashik</span>
        {(selectedCropId || selectedTaluka !== 'All' || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="text-agri-700 font-bold hover:underline"
          >
            {t('buyer.reset_filters')}
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-20 bg-slate-100 rounded-xl"></div>
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
            onClick={fetchListings}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center text-3xl">
            🔍
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {t('buyer.no_listings_found')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting filters or expanding your taluka search to view nearby farm lots.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex min-h-[44px] px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl text-xs"
          >
            {t('buyer.reset_filters')}
          </button>
        </div>
      )}

      {/* Listing Cards Grid */}
      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {listings.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              isOwner={false}
              onEnquire={handleOpenEnquiry}
            />
          ))}
        </div>
      )}

      {/* Buyer Enquiry Modal */}
      <EnquiryModal
        listing={selectedListingForEnquiry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchListings();
        }}
      />
    </div>
  );
}
