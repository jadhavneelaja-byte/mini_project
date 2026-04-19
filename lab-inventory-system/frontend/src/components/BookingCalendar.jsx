import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const BookingCalendar = ({ item, onClose, onBookingConfirmed }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState('calendar'); // 'calendar' or 'slot-selection'
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Time slots available for booking (9 AM to 5 PM in 2-hour intervals)
  const timeSlots = [
    { start: '9:00 AM', end: '11:00 AM', label: '9 AM – 11 AM' },
    { start: '11:00 AM', end: '1:00 PM', label: '11 AM – 1 PM' },
    { start: '1:00 PM', end: '3:00 PM', label: '1 PM – 3 PM' },
    { start: '3:00 PM', end: '5:00 PM', label: '3 PM – 5 PM' },
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isAvailable = (day) => {
    // Check if date is in the past
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      return false;
    }

    // Mock availability - alternate pattern for demo
    const dayOfWeek = dateObj.getDay();
    // Don't allow bookings on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // Simple pattern: alternate availability
    return day % 3 !== 0;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day);
    setBookingStep('slot-selection');
  };

  const handleTimeSlotSelect = async (slot) => {
    setSelectedTimeSlot(slot);
    setLoading(true);

    try {
      // Create the booking with the selected date and time slot
      const bookingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
      await api.post('/api/request-item', {
        item_id: item.id,
        quantity: 1,
        booking_date: bookingDate.toISOString().split('T')[0],
        time_slot: `${slot.start} - ${slot.end}`,
      });

      showSuccess('Request sent successfully. Pending admin approval.');
      onBookingConfirmed();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to confirm booking';
      showError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  // Create calendar grid: empty cells for days before month starts, then days of month
  const calendarDays = [];
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800">{item.name} - Booking Calendar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {bookingStep === 'calendar' && (
            <div className="space-y-6">
              {/* Item Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Item:</span>
                    <p className="text-gray-800">{item.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Available:</span>
                    <p className="text-gray-800">{item.available_quantity}/{item.quantity}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Category:</span>
                    <p className="text-gray-800">{item.category}</p>
                  </div>
                </div>
              </div>

              {/* Calendar Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevMonth}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-bold text-gray-800">{monthName}</h3>
                <button
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center py-3 font-semibold text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day ? (
                      <button
                        onClick={() => handleDateSelect(day)}
                        disabled={!isAvailable(day)}
                        className={`w-full h-full flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                          isAvailable(day)
                            ? 'bg-green-50 hover:bg-green-100 text-green-800 border-2 border-green-200 hover:border-green-300 hover:shadow-md'
                            : 'bg-red-100 text-red-400 border-2 border-red-200 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-lg font-bold">{day}</span>
                        <span className="text-xs mt-1">
                          {isAvailable(day) ? '✓' : '✗'}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Availability Legend</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded mr-2"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded mr-2"></div>
                    <span className="text-gray-700">Unavailable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span className="text-gray-500">Past Date / Weekend</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 'slot-selection' && selectedDate && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setBookingStep('calendar')}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Calendar
              </button>

              {/* Selected Date Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-bold text-gray-800 mb-2">Select Time Slot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-800">{selectedDate} {monthName.split(' ')[0]} {currentDate.getFullYear()}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Equipment:</span>
                    <p className="text-gray-800">{item.name}</p>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-lg">Available Time Slots</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSlotSelect(slot)}
                      disabled={loading}
                      className={`p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                        selectedTimeSlot === slot
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className={`w-5 h-5 ${selectedTimeSlot === slot ? 'text-blue-600' : 'text-gray-500'}`} />
                          <div>
                            <p className={`font-semibold ${selectedTimeSlot === slot ? 'text-blue-800' : 'text-gray-800'}`}>
                              {slot.label}
                            </p>
                            <p className="text-sm text-gray-500">2-hour slot</p>
                          </div>
                        </div>
                        {selectedTimeSlot === slot && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedTimeSlot && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setBookingStep('calendar')}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleTimeSlotSelect(selectedTimeSlot)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;

