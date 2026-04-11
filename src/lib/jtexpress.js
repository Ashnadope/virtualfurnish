/**
 * J&T Express Philippines Open API Client
 *
 * Endpoints (sandbox / demo):
 *   Create Order   POST /api/order/addOrder
 *   Cancel Order   POST /api/order/cancelOrder
 *   Order Inquiry  POST /api/order/getOrders
 *   Print AWB      POST /api/order/printOrder
 *   Track Query    POST /api/logistics/trace
 *
 * Authentication uses HMAC-MD5 digest:
 *   digest = Base64( MD5( requestBody + apiKey ) )
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Config — read once from env
// ---------------------------------------------------------------------------
const JT_API_ACCOUNT = process.env.JT_API_ACCOUNT || '';
const JT_API_KEY = process.env.JT_API_KEY || '';

// Toggle between demo and production endpoints
const JT_BASE_URL =
  process.env.JT_API_BASE_URL ||
  'https://demoopenapi.jtexpress.ph/webopenplatformapi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate HMAC-MD5 digest required by J&T Open API */
function generateDigest(bodyString) {
  if (!JT_API_KEY) throw new Error('JT_API_KEY is not configured');
  const hash = crypto
    .createHash('md5')
    .update(bodyString + JT_API_KEY)
    .digest('base64');
  return hash;
}

/** Low-level POST to J&T Open API */
async function jtPost(path, payload) {
  const url = `${JT_BASE_URL}${path}`;
  const bodyString = JSON.stringify(payload);
  const digest = generateDigest(bodyString);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiAccount: JT_API_ACCOUNT,
      digest,
    },
    body: bodyString,
  });

  const data = await res.json();

  if (!res.ok || (data.code !== '1' && data.code !== 1)) {
    const msg =
      data.msg || data.message || `J&T API error (HTTP ${res.status})`;
    const err = new Error(msg);
    err.jtResponse = data;
    throw err;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/**
 * Create a shipping order with J&T Express.
 *
 * @param {Object} params
 * @param {string} params.orderNumber      Your internal order number (customerTxId)
 * @param {string} params.serviceType      "EZ" (standard) or "SUPER" default "EZ"
 * @param {number} params.weight           Total weight in kg
 * @param {number} params.itemCount        Number of items
 * @param {string} params.goodsDescription Short description
 * @param {number} params.declaredValue    Declared value in PHP
 * @param {Object} params.sender           { name, phone, address, city, province, postalCode }
 * @param {Object} params.receiver         { name, phone, address, city, province, postalCode }
 * @returns {Object} J&T response with waybill/tracking number
 */
export async function createOrder({
  orderNumber,
  serviceType = 'EZ',
  weight = 1,
  itemCount = 1,
  goodsDescription = 'Furniture',
  declaredValue = 0,
  sender,
  receiver,
}) {
  const payload = {
    serviceType,
    orderType: 1, // 1 = pickup
    expressType: 1,
    deliveryType: 1,
    customerTxId: orderNumber,
    goodsType: 2, // 2 = parcel
    weight: String(weight),
    totalQuantity: String(itemCount),
    itemsValue: String(declaredValue),
    remark: goodsDescription,
    sender: {
      name: sender.name,
      mobile: sender.phone,
      address: sender.address,
      city: sender.city,
      area: sender.province,
      postCode: sender.postalCode,
    },
    receiver: {
      name: receiver.name,
      mobile: receiver.phone,
      address: receiver.address,
      city: receiver.city,
      area: receiver.province,
      postCode: receiver.postalCode,
    },
  };

  return jtPost('/api/order/addOrder', payload);
}

/**
 * Cancel a J&T Express order.
 *
 * @param {string} orderNumber  The customerTxId used when creating the order
 * @returns {Object} J&T response
 */
export async function cancelOrder(orderNumber) {
  return jtPost('/api/order/cancelOrder', {
    customerTxId: orderNumber,
  });
}

/**
 * Query order details from J&T.
 *
 * @param {string} billCode  J&T waybill number
 * @returns {Object} Order details
 */
export async function getOrder(billCode) {
  return jtPost('/api/order/getOrders', {
    billCodes: billCode,
  });
}

/**
 * Query tracking / logistics trace by waybill number.
 *
 * @param {string} billCode  J&T waybill number
 * @returns {Object} Tracking events
 */
export async function getTracking(billCode) {
  return jtPost('/api/logistics/trace', {
    billCodes: billCode,
  });
}

/**
 * Get AWB (airway bill / waybill) PDF URL for printing.
 *
 * @param {string} billCode  J&T waybill number
 * @returns {Object} Contains URL / base64 for the AWB label
 */
export async function printAWB(billCode) {
  return jtPost('/api/order/printOrder', {
    billCodes: billCode,
  });
}

export default {
  createOrder,
  cancelOrder,
  getOrder,
  getTracking,
  printAWB,
};
