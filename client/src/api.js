const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('agriconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  requestOtp: (mobile) => request('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile })
  }),
  verifyOtp: (payload) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Crops
  getCrops: () => request('/crops'),

  // Mandi Prices
  getMandiPrices: (district = 'Nashik') => request(`/mandi-prices?district=${district}`),
  getMandiPriceForCrop: (cropId, district = 'Nashik') => request(`/mandi-prices?crop_id=${cropId}&district=${district}`),
  compareMandi: (askingPrice, modalPrice) => request(`/mandi-prices/compare?asking_price=${askingPrice}&modal_price=${modalPrice}`),

  // Listings
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.crop_id) query.append('crop_id', params.crop_id);
    if (params.taluka && params.taluka !== 'all') query.append('taluka', params.taluka);
    if (params.sort) query.append('sort', params.sort);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request(`/listings${qs ? `?${qs}` : ''}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (data) => request('/listings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateListing: (id, data) => request(`/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteListing: (id) => request(`/listings/${id}`, {
    method: 'DELETE'
  }),
  sendEnquiry: (listingId, data) => request(`/listings/${listingId}/enquiries`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Me
  getMyProfile: () => request('/me/profile'),
  getMyListings: () => request('/me/listings'),
  getMyEnquiries: () => request('/me/enquiries'),
  updateEnquiryStatus: (id, status) => request(`/me/enquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Admin / Reset
  resetDemo: () => request('/admin/reset-demo', {
    method: 'POST'
  })
};

export default api;
