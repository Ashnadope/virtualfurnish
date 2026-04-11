/**
 * Shipping Service — J&T Express Philippines
 *
 * Handles:
 *  - Shipping rate calculation (based on J&T published rate card)
 *  - Zone detection from postal code
 *  - Weight estimation for furniture products
 */

// ---------------------------------------------------------------------------
// J&T Express PH Rate Card (as of 2026)
// Rates are per kg, rounded up. Minimum 1 kg.
//
// Zone definitions:
//   Metro Manila (MM)  — postal codes 0400-1899
//   Luzon (LUZ)        — postal codes 2000-4599
//   Visayas (VIS)      — postal codes 5000-6699
//   Mindanao (MIN)     — postal codes 7000-9899
//
// Standard Shipping (EZ):
//   Within zone  (e.g. MM→MM, LUZ→LUZ): base ₱89 first 1 kg + ₱20/additional kg
//   Cross-zone close (e.g. MM→LUZ):     base ₱109 first 1 kg + ₱25/additional kg
//   Cross-zone far   (e.g. MM→VIS/MIN): base ₱139 first 1 kg + ₱30/additional kg
//   Inter-island      (VIS↔MIN):        base ₱139 first 1 kg + ₱30/additional kg
//
// Oversize surcharge: +₱50 for items > 50 kg
// ---------------------------------------------------------------------------

const ZONES = {
  MM: { min: 400, max: 1899, label: 'Metro Manila' },
  LUZ: { min: 2000, max: 4599, label: 'Luzon' },
  VIS: { min: 5000, max: 6699, label: 'Visayas' },
  MIN: { min: 7000, max: 9899, label: 'Mindanao' },
};

const RATE_TIERS = {
  same: { base: 89, perKg: 20, label: 'Within zone' },
  close: { base: 109, perKg: 25, label: 'Adjacent zone' },
  far: { base: 139, perKg: 30, label: 'Inter-island / far zone' },
};

// Zone-pair → tier mapping
const ZONE_TIER_MAP = {
  'MM-MM': 'same',
  'MM-LUZ': 'close',
  'MM-VIS': 'far',
  'MM-MIN': 'far',
  'LUZ-LUZ': 'same',
  'LUZ-MM': 'close',
  'LUZ-VIS': 'far',
  'LUZ-MIN': 'far',
  'VIS-VIS': 'same',
  'VIS-MM': 'far',
  'VIS-LUZ': 'far',
  'VIS-MIN': 'far',
  'MIN-MIN': 'same',
  'MIN-MM': 'far',
  'MIN-LUZ': 'far',
  'MIN-VIS': 'far',
};

/**
 * Detect shipping zone from a Philippine 4-digit postal code.
 * @param {string|number} postalCode
 * @returns {string|null} Zone key (MM, LUZ, VIS, MIN) or null
 */
export function getZone(postalCode) {
  const code = parseInt(postalCode, 10);
  if (isNaN(code)) return null;
  for (const [key, { min, max }] of Object.entries(ZONES)) {
    if (code >= min && code <= max) return key;
  }
  return null;
}

/**
 * Calculate the shipping cost.
 *
 * @param {Object} params
 * @param {string} params.originPostalCode     Sender postal code
 * @param {string} params.destinationPostalCode Receiver postal code
 * @param {number} params.weightKg              Total weight in kg (will be rounded up)
 * @returns {{ cost: number, zone: string, tier: string, breakdown: Object }}
 */
export function calculateShippingRate({
  originPostalCode,
  destinationPostalCode,
  weightKg,
}) {
  const originZone = getZone(originPostalCode);
  const destZone = getZone(destinationPostalCode);

  if (!originZone || !destZone) {
    throw new Error(
      `Invalid postal code. Origin zone: ${originZone}, Dest zone: ${destZone}`
    );
  }

  const tierKey = ZONE_TIER_MAP[`${originZone}-${destZone}`] || 'far';
  const tier = RATE_TIERS[tierKey];

  const roundedWeight = Math.max(1, Math.ceil(weightKg));
  const additionalKg = Math.max(0, roundedWeight - 1);
  let cost = tier.base + additionalKg * tier.perKg;

  // Oversize surcharge
  if (roundedWeight > 50) {
    cost += 50;
  }

  return {
    cost,
    originZone,
    destinationZone: destZone,
    tier: tierKey,
    tierLabel: tier.label,
    weightKg: roundedWeight,
    breakdown: {
      base: tier.base,
      additionalKg,
      perKgRate: tier.perKg,
      oversizeSurcharge: roundedWeight > 50 ? 50 : 0,
    },
  };
}

/**
 * Estimate weight for cart items. Uses product weight if available,
 * otherwise falls back to a default estimate for furniture (5 kg).
 *
 * @param {Array} items  Array of { weight, quantity } objects.
 *                       weight can be a string like "5 kg" or a number.
 * @returns {number} Total weight in kg
 */
export function estimateWeight(items) {
  const DEFAULT_FURNITURE_WEIGHT_KG = 5;

  return items.reduce((total, item) => {
    let itemWeight = DEFAULT_FURNITURE_WEIGHT_KG;

    if (item.weight) {
      const parsed = parseFloat(String(item.weight).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        itemWeight = parsed;
      }
    }

    return total + itemWeight * (item.quantity || 1);
  }, 0);
}

// Default store/warehouse address (update with your actual address)
export const STORE_ADDRESS = {
  name: 'VirtualFurnish Store',
  phone: '09171234567',
  address: '32nd Street corner 9th Avenue, Bonifacio Global City',
  city: 'Taguig City',
  province: 'Metro Manila',
  postalCode: '1634',
};

export default {
  calculateShippingRate,
  getZone,
  estimateWeight,
  STORE_ADDRESS,
  ZONES,
  RATE_TIERS,
};
