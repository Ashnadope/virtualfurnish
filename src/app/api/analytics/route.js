import { NextResponse } from 'next/server';
import { fetchAnalyticsData } from '@/lib/analytics';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30days';
  try {
    const data = await fetchAnalyticsData(range);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/analytics] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
