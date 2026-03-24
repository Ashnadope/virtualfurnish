'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

// Coordinates for common Philippine cities / municipalities.
// Used to drop a pin on the map when a city row is clicked.
const CITY_COORDS = {
  'manila':           [14.5995, 120.9842],
  'quezon city':      [14.6760, 121.0437],
  'makati':           [14.5547, 121.0244],
  'pasig':            [14.5764, 121.0851],
  'taguig':           [14.5176, 121.0509],
  'caloocan':         [14.6499, 120.9700],
  'las piñas':        [14.4453, 120.9839],
  'las pinas':        [14.4453, 120.9839],
  'mandaluyong':      [14.5794, 121.0359],
  'marikina':         [14.6507, 121.1029],
  'muntinlupa':       [14.4158, 121.0465],
  'parañaque':        [14.4793, 121.0198],
  'paranaque':        [14.4793, 121.0198],
  'pasay':            [14.5378, 120.9979],
  'san juan':         [14.6006, 121.0271],
  'valenzuela':       [14.7011, 120.9830],
  'antipolo':         [14.5862, 121.1762],
  'cebu city':        [10.3157, 123.8854],
  'cebu':             [10.3157, 123.8854],
  'davao city':       [7.1907,  125.4553],
  'davao':            [7.1907,  125.4553],
  'cagayan de oro':   [8.4542,  124.6319],
  'zamboanga city':   [6.9214,  122.0790],
  'zamboanga':        [6.9214,  122.0790],
  'bacolod':          [10.6713, 122.9511],
  'iloilo city':      [10.7202, 122.5621],
  'iloilo':           [10.7202, 122.5621],
  'baguio':           [16.4023, 120.5960],
  'general santos':   [6.1164,  125.1716],
  'lapu-lapu':        [10.3119, 124.0025],
  'lapu lapu':        [10.3119, 124.0025],
  'tarlac':           [15.4755, 120.5963],
  'angeles':          [15.1450, 120.5887],
  'olongapo':         [14.8292, 120.2829],
  'calamba':          [14.2117, 121.1653],
  'santa rosa':       [14.3122, 121.1114],
  'bacoor':           [14.4580, 120.9360],
  'imus':             [14.4297, 120.9367],
  'dasmariñas':       [14.3294, 120.9367],
  'dasmarinas':       [14.3294, 120.9367],
  'biñan':            [14.3406, 121.0819],
  'binan':            [14.3406, 121.0819],
  'san pedro':        [14.3590, 121.0469],
  'cabuyao':          [14.2742, 121.1253],
  'unknown':          [12.8797, 121.7740], // PH center fallback
};

const DEFAULT_MAP = 'https://www.google.com/maps?q=Philippines&z=6&output=embed';

function buildMapUrl(cityName) {
  const key = cityName.toLowerCase().trim();
  const coords = CITY_COORDS[key];
  if (coords) {
    return `https://www.google.com/maps?q=${coords[0]},${coords[1]}&z=12&output=embed`;
  }
  // Fallback: let Google geocode the city name with "Philippines" appended
  return `https://www.google.com/maps?q=${encodeURIComponent(cityName + ', Philippines')}&z=11&output=embed`;
}

export default function GeographicDistribution({ regions }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const maxValue = Math.max(...(regions ?? []).map(r => r?.orders));

  const handleCityClick = (city) => {
    setSelectedCity(prev => prev === city ? null : city);
  };

  const mapSrc = selectedCity ? buildMapUrl(selectedCity) : DEFAULT_MAP;

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Geographic Sales Distribution</h3>
      <p className="font-body text-xs text-muted-foreground mb-5">Click a city to pin it on the map</p>
      <div className="space-y-4">
        {(regions ?? []).map((region) => {
          const percentage = maxValue > 0 ? (region?.orders / maxValue) * 100 : 0;
          const isSelected = selectedCity === region?.name;

          return (
            <button
              key={region?.id}
              onClick={() => handleCityClick(region?.name)}
              className={`w-full text-left rounded-lg px-3 py-2 transition-fast ${
                isSelected
                  ? 'bg-primary/8 ring-1 ring-primary/30'
                  : 'hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-destructive" aria-hidden="true">📍</span>
                  )}
                  <span className={`font-body text-sm font-medium ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}>
                    {region?.name}
                  </span>
                </div>
                <span className="font-body text-sm text-muted-foreground">{region?.orders} orders</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-primary' : 'bg-primary/60'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-body text-xs text-muted-foreground">Revenue: ₱{region?.revenue}</span>
                <span className="font-body text-xs text-muted-foreground">{region?.percentage}% of total</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        {selectedCity && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm font-medium text-foreground flex items-center gap-1">
              <span className="text-destructive">📍</span>{selectedCity}
            </span>
            <button
              onClick={() => setSelectedCity(null)}
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-fast"
            >
              Show all Philippines
            </button>
          </div>
        )}
        <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
          <iframe
            key={mapSrc}
            width="100%"
            height="100%"
            loading="lazy"
            title={selectedCity ? `${selectedCity} location map` : 'Philippines Sales Distribution Map'}
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

GeographicDistribution.propTypes = {
  regions: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      orders: PropTypes?.number?.isRequired,
      revenue: PropTypes?.string?.isRequired,
      percentage: PropTypes?.string?.isRequired
    })
  )?.isRequired
};