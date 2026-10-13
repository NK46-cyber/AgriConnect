import React from 'react';

// Vivid colored visual SVG crop icons designed for low-literacy recognition
export default function CropIcon({ cropId, iconName, size = 'md' }) {
  const sizeMap = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl'
  };

  const getCropStyle = (id) => {
    switch (Number(id)) {
      case 1: // Onion
        return { emoji: '🧅', bg: 'bg-red-50 border-red-200 text-red-600', label: 'Onion' };
      case 2: // Tomato
        return { emoji: '🍅', bg: 'bg-rose-50 border-rose-200 text-rose-600', label: 'Tomato' };
      case 3: // Grapes
        return { emoji: '🍇', bg: 'bg-purple-50 border-purple-200 text-purple-600', label: 'Grapes' };
      case 4: // Pomegranate
        return { emoji: '🫐', bg: 'bg-pink-50 border-pink-200 text-pink-600', label: 'Pomegranate' };
      case 5: // Potato
        return { emoji: '🥔', bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Potato' };
      case 6: // Cabbage
        return { emoji: '🥬', bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', label: 'Cabbage' };
      case 7: // Cauliflower
        return { emoji: '🥦', bg: 'bg-lime-50 border-lime-200 text-lime-700', label: 'Cauliflower' };
      case 8: // Brinjal
        return { emoji: '🍆', bg: 'bg-indigo-50 border-indigo-200 text-indigo-600', label: 'Brinjal' };
      case 9: // Soybean
        return { emoji: '🫘', bg: 'bg-yellow-50 border-yellow-200 text-yellow-700', label: 'Soybean' };
      case 10: // Wheat
        return { emoji: '🌾', bg: 'bg-amber-100/70 border-amber-300 text-amber-800', label: 'Wheat' };
      default:
        return { emoji: '🌱', bg: 'bg-green-50 border-green-200 text-green-700', label: 'Produce' };
    }
  };

  const style = getCropStyle(cropId);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border ${style.bg} ${sizeMap[size] || sizeMap.md} shadow-sm shrink-0 select-none transition-transform hover:scale-105`}
      title={style.label}
    >
      <span role="img" aria-label={style.label} className="leading-none drop-shadow-sm">
        {style.emoji}
      </span>
    </div>
  );
}
