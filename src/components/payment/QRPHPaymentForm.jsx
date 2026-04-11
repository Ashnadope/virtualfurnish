'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { paymentService } from '@/services/payment.service';

export default function QRPHPaymentForm({
  amount,
  currency = 'PHP',
  orderData,
  customerInfo,
  onSuccess,
  onError,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');  // base64 QR image from PayMongo
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(''); // awaiting_payment | processing | succeeded
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback((oid) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const result = await paymentService.checkQRPHStatus(oid);
        if (!mountedRef.current) return;

        setPollingStatus(result.status);

        if (result.status === 'succeeded') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setShowSuccess(true);

          setTimeout(() => {
            if (!mountedRef.current) return;
            setShowSuccess(false);
            onSuccess?.({
              orderId: result.orderId,
              orderNumber: result.orderNumber,
            });
          }, 3000);
        }
      } catch (err) {
        console.error('QRPH polling error:', err);
        // Don't stop polling on transient errors
      }
    }, 5000); // poll every 5 seconds
  }, [onSuccess]);

  const handleInitiate = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await paymentService.processQRPHPayment(orderData, customerInfo);

      if (!mountedRef.current) return;

      // PayMongo QRPH returns base64 QR image at result.qrImageUrl
      if (result.qrImageUrl) {
        setQrImageUrl(result.qrImageUrl);
      }
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
      }
      setOrderId(result.orderId);
      setOrderNumber(result.orderNumber);
      setPollingStatus('awaiting_payment');

      // Start polling for payment completion
      startPolling(result.orderId);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('QRPH initiation error:', err);
      setErrorMessage(err.message || 'Failed to initiate QRPH payment. Please try again.');
      onError?.(err);
    } finally {
      if (mountedRef.current) setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-600">
              QRPH Payment Successful!
            </h3>
            <p className="text-green-700 font-medium">
              Your order has been confirmed
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-lg font-semibold text-green-800">
              {paymentService.formatAmount(amount, currency)} Paid
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6.75 6.75h.75v.75h-.75zM6.75 16.5h.75v.75h-.75zM16.5 6.75h.75v.75H16.5zM13.5 13.5h.75v.75h-.75zM13.5 19.5h.75v.75h-.75zM19.5 13.5h.75v.75h-.75zM19.5 19.5h.75v.75h-.75zM16.5 16.5h.75v.75H16.5z" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Pay with QRPH
          </h3>
          <p className="text-sm text-gray-600">
            Scan the QR code with any QRPH-enabled banking app
          </p>
        </div>

        {/* Amount */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-xl font-bold text-gray-900">
              {paymentService.formatAmount(amount, currency)}
            </span>
          </div>
        </div>

        {/* Before initiation — show button */}
        {!pollingStatus && (
          <>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                How QRPH works:
              </h4>
              <ol className="text-xs text-indigo-800 space-y-1 list-decimal list-inside">
                <li>Click the button below to generate a QR code</li>
                <li>Scan the QR code with your banking or e-wallet app</li>
                <li>Confirm the payment in your app</li>
                <li>Wait for confirmation — this page will update automatically</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={handleInitiate}
              disabled={isProcessing}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating QR Code...
                </>
              ) : (
                `Generate QRPH Code — ${paymentService.formatAmount(amount, currency)}`
              )}
            </button>
          </>
        )}

        {/* After initiation — show QR code image + polling status */}
        {pollingStatus && (
          <>
            {/* Inline QR code image from PayMongo */}
            {qrImageUrl ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-white p-3 rounded-xl border-2 border-indigo-200 shadow-md">
                  <img
                    src={qrImageUrl}
                    alt="QRPH Payment QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with any QRPH-enabled banking or e-wallet app
                </p>
                <p className="text-xs text-gray-400">
                  QR code expires in 30 minutes
                </p>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-indigo-900">
                  Payment initiated — complete payment in your banking app.
                </p>
              </div>
            )}

            {/* Polling indicator */}
            <div className="flex items-center justify-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <svg className="animate-spin h-5 w-5 text-yellow-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Waiting for payment...
                </p>
                <p className="text-xs text-yellow-700">
                  This page will update automatically once your payment is confirmed.
                </p>
              </div>
            </div>

            {pollingStatus === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Payment is being processed...
              </div>
            )}
          </>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Security footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Powered by PayMongo • BSP-supervised payment</span>
        </div>
      </div>
    </div>
  );
}
