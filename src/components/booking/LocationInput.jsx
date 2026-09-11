import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { getSuggestions } from '../../api/mapsApi';

const LocationInput = ({
  label,
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'Enter location...',
  iconColor = 'text-cabgo-500',
  enableCurrentLocation = false,
  onUseCurrentLocation,
  error,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced autocomplete suggestions from backend
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await getSuggestions(value.trim());
        setSuggestions(results || []);
        setIsOpen(results && results.length > 0);
      } catch (err) {
        console.warn('Suggestions fetch failed:', err.message);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <div className={`absolute left-3.5 pointer-events-none ${iconColor}`}>
          <MapPin className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-20 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none focus:ring-2
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-200 focus:border-cabgo-500 focus:ring-cabgo-200'
            }
          `}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoadingSuggestions && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-1" />
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {enableCurrentLocation && onUseCurrentLocation && (
            <button
              type="button"
              onClick={onUseCurrentLocation}
              title="Use current location"
              className="p-1.5 rounded-lg text-cabgo-600 hover:text-cabgo-700 hover:bg-cabgo-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700 transition-colors border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
