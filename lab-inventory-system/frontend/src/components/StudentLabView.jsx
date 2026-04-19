import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, AlertTriangle, RotateCcw, Calendar } from 'lucide-react';
import api from '../services/api';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useNotification } from '../contexts/NotificationContext';
import BookingCalendar from './BookingCalendar';

const StudentLabView = () => {
  const { labName } = useParams();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [showItemActions, setShowItemActions] = useState(false);
  const [qrItem, setQrItem] = useState(null);
  const [calendarItem, setCalendarItem] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchBookings();
  }, [labName]);

  const fetchItems = async () => {
    try {
      const res = await api.get(`/api/labs/${labName}/items`);
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/my-bookings');
      // Filter bookings by the selected lab
      const labBookings = res.data.filter(booking => booking.lab_name === labName);
      setBookings(labBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const requestBooking = async (itemId, quantity = 1) => {
    try {
      await api.post('/api/request-item', { item_id: itemId, quantity });
      fetchItems();
      showSuccess('Booking request sent to admin');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request booking';
      showError(`Error: ${message}`);
    }
  };

  const returnItem = async (bookingId) => {
    try {
      await api.post('/api/return-item', { booking_id: bookingId });
      fetchItems();
      fetchBookings();
      showSuccess('Item returned successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to return item';
      showError(`Error: ${message}`);
    }
  };

  const reportDamage = async (itemId) => {
    try {
      const description = prompt('Describe the damage:');
      if (!description) return;
      await api.post('/api/report-damage', { item_id: itemId, description });
      fetchItems();
      showSuccess('Damage report submitted');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to report damage';
      showError(`Error: ${message}`);
    }
  };

  const handleScannedAction = async (action) => {
    if (!scannedItem) return;

    switch (action) {
      case 'borrow':
        await requestBooking(scannedItem.id);
        break;
      case 'return':
        // Find the booking for this item that belongs to current user
        const userBooking = bookings.find(b => b.item_name === scannedItem.name && b.status === 'borrowed');
        if (userBooking) {
          await returnItem(userBooking.id);
        } else {
          showError('You have not borrowed this item');
        }
        break;
      case 'damage':
        await reportDamage(scannedItem.id);
        break;
      case 'view':
        // Just show item details - already handled by modal
        break;
    }
    setShowItemActions(false);
    setScannedItem(null);
  };

  const scanQR = () => {
    setShowScanner(true);
    const scanner = new Html5QrcodeScanner('qr-reader', { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE],
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true
    });
    scanner.render((decodedText) => {
      // Add vibration feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      const item = items.find(i => i.unique_id === decodedText);
      if (item) {
        setScannedItem(item);
        setShowItemActions(true);
        scanner.clear();
        setShowScanner(false);
      } else {
        showError('Item not found in this lab');
        scanner.clear();
        setShowScanner(false);
      }
    }, (error) => {
      // Handle scan errors silently
      console.log('QR scan error:', error);
    });
  };

  const getStatusColor = (status) => {
    if (status === 'available') return 'bg-green-100 text-green-800';
    if (status === 'borrowed') return 'bg-blue-100 text-blue-800';
    if (status === 'damaged') return 'bg-red-100 text-red-800';
    if (status === 'maintenance') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const borrowedBookings = bookings.filter(b => b.status === 'borrowed');
  const deniedBookings = bookings.filter(b => b.status === 'denied');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white/90 border border-slate-200 rounded-3xl shadow-sm p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Student Lab Access</p>
              <h1 className="text-3xl font-semibold text-slate-900">{labName.charAt(0).toUpperCase() + labName.slice(1)} Lab</h1>
              <p className="text-sm text-slate-600 mt-1">Book equipment, track your borrowed items, and send requests for approval.</p>
            </div>
            <div>
              <button
                onClick={scanQR}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition"
              >
                <QrCode className="w-4 h-4" /> Scan QR Code
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Available Items</p>
              <p className="text-3xl font-semibold text-slate-900">{items.reduce((sum, item) => sum + item.available_quantity, 0)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-amber-50 p-4">
              <p className="text-sm text-slate-500">Pending Requests</p>
              <p className="text-3xl font-semibold text-amber-900">{pendingBookings.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-blue-50 p-4">
              <p className="text-sm text-slate-500">Borrowed Items</p>
              <p className="text-3xl font-semibold text-blue-900">{borrowedBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white/90 border border-slate-200 rounded-3xl shadow-sm p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">My Booking Requests</h2>
                  <p className="text-sm text-slate-500">Pending approval from the admin.</p>
                </div>
              </div>
              <div className="space-y-4">
                {pendingBookings.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">No pending requests yet. Use the calendar or request button to send a booking request.</div>
                ) : (
                  pendingBookings.map(booking => (
                    <div key={booking.id} className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.item_name}</p>
                          <p className="text-sm text-slate-600">{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'No date'} • {booking.time_slot || 'No slot selected'}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Pending approval</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white/90 border border-slate-200 rounded-3xl shadow-sm p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Borrowed Items</h2>
                  <p className="text-sm text-slate-500">Items currently checked out by you.</p>
                </div>
              </div>
              <div className="space-y-4">
                {borrowedBookings.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">No borrowed items right now. Your approved requests will appear here.</div>
                ) : (
                  borrowedBookings.map(booking => (
                    <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.item_name}</p>
                          <p className="text-sm text-slate-600">Borrowed at: {booking.time_borrowed ? new Date(booking.time_borrowed).toLocaleString() : 'Unknown'}</p>
                        </div>
                        <button
                          onClick={() => returnItem(booking.id)}
                          className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white/90 border border-slate-200 rounded-3xl shadow-sm p-6 backdrop-blur-md">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Available Items</h2>
              <div className="grid grid-cols-1 gap-4">
                {items.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-600">No items found for this lab.</div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                          <p className="text-sm text-slate-500 mt-2">Available: {item.available_quantity}/{item.quantity}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => requestBooking(item.id)}
                          className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                          disabled={item.available_quantity === 0}
                        >
                          Request
                        </button>
                        <button
                          onClick={() => setCalendarItem(item)}
                          className="rounded-2xl bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
                        >
                          Calendar
                        </button>
                        <button
                          onClick={() => setQrItem(item)}
                          className="col-span-2 rounded-2xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR Code
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {qrItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Item QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrItem.unique_id} size={180} />
            </div>
            <p className="text-sm text-slate-600 mb-4">Item: {qrItem.name}</p>
            <button
              onClick={() => setQrItem(null)}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Scan QR Code</h3>
                <p className="text-sm text-slate-500">Point your camera at the item QR code to select it.</p>
              </div>
              <button
                onClick={() => setShowScanner(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
            <div id="qr-reader" className="h-[380px] rounded-3xl border border-slate-200 bg-slate-50"></div>
          </div>
        </div>
      )}

      {showItemActions && scannedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Scanned Item</h3>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <p className="text-lg font-semibold text-slate-900">{scannedItem.name}</p>
              <p className="text-sm text-slate-600 mb-2">{scannedItem.description}</p>
              <p className="text-sm text-slate-500">Category: {scannedItem.category}</p>
              <p className="text-sm text-slate-500">Available: {scannedItem.available_quantity}/{scannedItem.quantity}</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(scannedItem.status)}`}>
                {scannedItem.status}
              </span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleScannedAction('borrow')}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                disabled={scannedItem.available_quantity === 0}
              >
                Borrow Item
              </button>
              <button
                onClick={() => handleScannedAction('return')}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Return Item
              </button>
              <button
                onClick={() => handleScannedAction('damage')}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Report Damage
              </button>
              <button
                onClick={() => {
                  setShowItemActions(false);
                  setScannedItem(null);
                }}
                className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {calendarItem && (
        <BookingCalendar
          item={calendarItem}
          onClose={() => setCalendarItem(null)}
          onBookingConfirmed={() => {
            fetchItems();
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default StudentLabView;

