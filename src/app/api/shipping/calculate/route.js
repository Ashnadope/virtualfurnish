import { NextResponse } from 'next/server';
import {
  calculateShippingRate,
  estimateWeight,
  STORE_ADDRESS,
} from '@/services/shipping.service';

/**
 * POST /api/shipping/calculate
 *
 * Calculate shipping cost based on destination postal code and cart items.
 *
 * Body: { destinationPostalCode: string, items: [{ weight?, quantity }] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { destinationPostalCode, items } = body;

    if (!destinationPostalCode) {
      return NextResponse.json(
        { error: 'destinationPostalCode is required' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(destinationPostalCode)) {
      return NextResponse.json(
        { error: 'Invalid Philippine postal code (must be 4 digits)' },
        { status: 400 }
      );
    }

    const weightKg = items?.length ? estimateWeight(items) : 5;

    const result = calculateShippingRate({
      originPostalCode: STORE_ADDRESS.postalCode,
      destinationPostalCode,
      weightKg,
    });

    return NextResponse.json({
      shippingCost: result.cost,
      ...result,
    });
  } catch (err) {
    console.error('Shipping calculate error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
