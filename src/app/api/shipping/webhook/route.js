import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/shipping/webhook
 *
 * Webhook endpoint for J&T Express push tracking updates.
 * J&T calls this URL when shipment status changes.
 *
 * Expected body (J&T push format):
 * {
 *   billCode: "JT123456789",
 *   details: [
 *     { scanTime: "2026-04-10 10:00:00", desc: "Picked up", scanType: "PICKUP" }
 *   ]
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { billCode, details } = body;

    if (!billCode) {
      return NextResponse.json({ code: '0', msg: 'Missing billCode' });
    }

    const supabase = await createClient();

    // Find the order by waybill
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('jt_waybill', billCode)
      .single();

    if (orderError || !order) {
      // Return success to J&T anyway to avoid retries for unknown waybills
      console.warn(`Webhook: no order found for waybill ${billCode}`);
      return NextResponse.json({ code: '1', msg: 'OK' });
    }

    // Map J&T scan types to our order statuses
    const latestEvent = details?.[0];
    const scanType = latestEvent?.scanType?.toUpperCase?.() || '';

    let newStatus = null;
    if (scanType === 'DELIVERY' || scanType === 'SIGNED' || scanType === 'DELIVERED') {
      newStatus = 'delivered';
    } else if (scanType === 'PICKUP' || scanType === 'SHIPPING' || scanType === 'TRANSIT') {
      newStatus = 'shipped';
    }

    if (newStatus && newStatus !== order.status) {
      await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
    }

    // Store tracking event in notes (append)
    if (latestEvent) {
      const { data: current } = await supabase
        .from('orders')
        .select('notes')
        .eq('id', order.id)
        .single();

      const existingNotes = current?.notes || '';
      const newNote = `[${latestEvent.scanTime}] ${latestEvent.desc || scanType}`;

      // Avoid duplicate entries
      if (!existingNotes.includes(newNote)) {
        await supabase
          .from('orders')
          .update({
            notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote,
          })
          .eq('id', order.id);
      }
    }

    // J&T expects { code: "1" } for success acknowledgment
    return NextResponse.json({ code: '1', msg: 'OK' });
  } catch (err) {
    console.error('Webhook error:', err);
    // Still return 200 to prevent J&T retries on server errors
    return NextResponse.json({ code: '0', msg: 'Error processing webhook' });
  }
}
