import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, AlertTriangle, RotateCcw, Calendar, Camera } from 'lucide-react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useNotification } from '../contexts/NotificationContext';
import BookingCalendar from './BookingCalendar';

const StudentDashboard = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [qrItem, setQrItem] = useState(null);
  const [calendarItem, setCalendarItem] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchBookings();
  }, [labId]);

  const fetchItems = async () => {
    try {
      const res = await api.get(`/api/labs/${labId}/items`);
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchBookings = async () => {
    // Fetch user's bookings - need to add endpoint
    try {
      const res = await api.get('/api/my-bookings');
      setBookings(res.data);
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
      console.error('Error requesting booking:', error);
    }
  };

  const returnItem = async (bookingId) => {
    try {
      await api.post(`/api/return-item/${bookingId}`);
      fetchItems();
      fetchBookings();
    } catch (error) {
      console.error('Error returning item:', error);
    }
  };

  const reportDamage = async (itemId) => {
    try {
      await api.post('/api/report-damage', { itemId, description: 'Damage reported' });
      fetchItems();
    } catch (error) {
      console.error('Error reporting damage:', error);
    }
  };


  const getStatusColor = (status) => {
    if (status === 'available') return 'bg-green-100 text-green-800';
    if (status === 'borrowed') return 'bg-blue-100 text-blue-800';
    if (status === 'damaged') return 'bg-red-100 text-red-800';
    if (status === 'maintenance') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const borrowedBookings = bookings.filter(b => b.status === 'borrowed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
                    <QrCode className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Student Dashboard
                    </h1>
                    <p className="text-slate-300 text-lg font-medium">Browse equipment, request bookings, and track your items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Quick Booking Available</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/qr-scanner')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:shadow-green-500/30 hover:from-green-600 hover:to-blue-700 transform transition-all duration-300 hover:scale-105"
                >
                  <Camera className="w-5 h-5" />
                  Open QR Scanner
                </button>
              </div>
            </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <RotateCcw className="w-6 h-6 text-blue-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-800">{borrowedBookings.length}</p>
                  <p className="text-sm text-blue-600">Borrowed Items</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((borrowedBookings.length / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-800">{pendingBookings.length}</p>
                  <p className="text-sm text-emerald-600">Pending Requests</p>
                </div>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min((pendingBookings.length / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <QrCode className="w-6 h-6 text-sky-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-sky-800">{items.reduce((sum, item) => sum + item.available_quantity, 0)}</p>
                  <p className="text-sm text-sky-600">Available Items</p>
                </div>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2">
                <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${(items.reduce((sum, item) => sum + item.available_quantity, 0) / items.reduce((sum, item) => sum + item.quantity, 0)) * 100}%` }}></div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle className="w-6 h-6 text-slate-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-800">{items.length}</p>
                  <p className="text-sm text-slate-600">Total Items</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-slate-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <section className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    My Bookings
                  </h2>
                  <p className="text-sm text-slate-500">Track booking status and return dates</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No bookings yet</p>
                  <p className="text-sm text-slate-500">Request an item or scan a QR code to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-slate-900 mb-1">{booking.item_name}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'No booking date'}</span>
                            <span>{booking.time_slot || 'No time slot'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                            booking.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'returned' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'borrowed' && (
                            <button
                              onClick={() => returnItem(booking.id)}
                              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-green-500" />
                    Available Items
                  </h2>
                  <p className="text-sm text-slate-500">Select equipment and send a booking request</p>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                  <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No items available</p>
                  <p className="text-sm text-slate-500">This lab doesn't have any items yet</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map(item => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{item.name}</h3>
                          <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{item.category}</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'damaged' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600">Available</span>
                              <span className="font-semibold text-slate-800">{item.available_quantity}/{item.quantity}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(item.available_quantity / item.quantity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        {/* QR Code Preview */}
                        <div className="flex-shrink-0 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <QRCodeSVG value={item.unique_id} size={60} level="M" />
                        </div>
                      </div>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => requestBooking(item.id)}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.available_quantity === 0}
                          >
                            Request Booking
                          </button>
                          <button
                            onClick={() => setCalendarItem(item)}
                            className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-sm"
                          >
                            View Calendar
                          </button>
                          <button
                            onClick={() => reportDamage(item.id)}
                            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Report Damage
                          </button>
                          <button
                            onClick={() => setQrItem(item)}
                            className="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-sm flex items-center justify-center gap-2"
                          >
                            <QrCode className="w-4 h-4" />
                            Show QR Code
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  💡
                </div>
                Quick Tips
              </h2>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <QrCode className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Use the QR code scanner for faster booking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pending requests will be approved by admin</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Report damage immediately if equipment is faulty</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {qrItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/20 transform transition-all duration-300 scale-100 hover:scale-105">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Scan QR Code</h3>
              <p className="text-slate-600 mb-6">Scan this code to book the item instantly</p>
              <div className="flex justify-center mb-6 p-4 bg-slate-50 rounded-2xl">
                <QRCodeSVG value={qrItem.unique_id} size={180} className="shadow-lg rounded-xl" />
              </div>
              <p className="text-sm text-slate-600 mb-6">
                <strong className="text-slate-800">Item:</strong> {qrItem.name}
              </p>
              <button
                onClick={() => setQrItem(null)}
                className="w-full rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 text-sm font-semibold text-white hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg"
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

export default StudentDashboard;

