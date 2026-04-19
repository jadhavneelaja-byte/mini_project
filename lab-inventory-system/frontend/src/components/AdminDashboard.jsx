import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash, QrCode, AlertTriangle, TrendingUp, BarChart3, Clock, CheckCircle, AlertCircle, X, Check, ClipboardList, Wrench, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import EquipmentHealth from './EquipmentHealth';
import EquipmentDemand from './EquipmentDemand';

const formatTimeGMT = (iso) => iso ? new Date(iso).toUTCString() : 'N/A';

const AddItemModal = ({ onAdd, onClose, editingItem }) => {
  const [name, setName] = useState(editingItem?.name || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [category, setCategory] = useState(editingItem?.category || 'General');
  const [uniqueId, setUniqueId] = useState(editingItem?.unique_id || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity ?? 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      name,
      description,
      category,
      unique_id: uniqueId,
      quantity: Number(quantity) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 hover:scale-105">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-slate-50 focus:bg-white shadow-sm"
              placeholder="Enter item name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-slate-50 focus:bg-white shadow-sm resize-none"
              rows="3"
              placeholder="Enter item description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-slate-50 focus:bg-white shadow-sm"
            >
              <option value="General">General</option>
              <option value="Equipment">Equipment</option>
              <option value="Apparatus">Apparatus</option>
              <option value="Tools">Tools</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Unique ID
            </label>
            <input
              type="text"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-slate-50 focus:bg-white shadow-sm"
              placeholder="Enter unique identifier"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-slate-50 focus:bg-white shadow-sm"
              min="1"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [qrItem, setQrItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const query = new URLSearchParams(location.search);
  const view = query.get('view') || 'dashboard';

  const fetchPendingBookings = async () => {
    try {
      const res = await api.get('/api/pending-requests');
      setPendingBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchDamageReports = async () => {
    try {
      const res = await api.get('/api/damage-reports');
      setDamageReports(res.data);
    } catch (error) {
      console.error('Error fetching damage reports:', error);
    }
  };

  const fetchItems = async () => {
    try {
      let url = '/api/items';
      if (searchQuery || selectedCategory) {
        url = `/api/items/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}&lab_id=${selectedLabId || ''}`;
      }
      const res = await api.get(url);
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchLabs = async () => {
    try {
      const res = await api.get('/api/labs');
      setLabs(res.data);
      if (res.data.length > 0 && !selectedLabId) {
        setSelectedLabId(res.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    }
  };

  const fetchUsageLogs = async () => {
    try {
      const res = await api.get('/api/usage-logs');
      setUsageLogs(res.data);
    } catch (error) {
      console.error('Error fetching usage logs:', error);
    }
  };

  const approveBooking = async (id) => {
    try {
      await api.post('/api/admin/approve-request', { booking_id: id });
      fetchPendingBookings();
      fetchItems();
      fetchUsageLogs();
    } catch (error) {
      console.error('Error approving booking:', error.response?.data || error);
    }
  };

  const denyBooking = async (id) => {
    try {
      await api.post('/api/deny-request', { booking_id: id });
      fetchPendingBookings();
      fetchItems();
      fetchUsageLogs();
    } catch (error) {
      console.error('Error denying booking:', error);
    }
  };

  const resolveDamage = async (id) => {
    try {
      await api.post(`/api/admin/resolve-damage/${id}`);
      fetchDamageReports();
    } catch (error) {
      console.error('Error resolving damage report:', error);
    }
  };

  const addItem = async (itemData) => {
    if (!selectedLabId) {
      showError('Please select a lab first');
      return;
    }
    try {
      if (editingItem) {
        // Edit existing item
        await api.put(`/api/items/${editingItem.id}`, { ...itemData, lab_id: selectedLabId });
      } else {
        // Add new item
        await api.post('/api/items', { ...itemData, lab_id: selectedLabId });
      }
      fetchItems();
      setShowAddItem(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      showError('Failed to save item');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/items/${id}`);
        showSuccess('Item deleted successfully');
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete item';
        showError('Error: ' + errorMessage);
      }
    }
  };

  const editItem = (item) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  useEffect(() => {
    if (view === 'inventory') {
      fetchItems();
    }
  }, [view, selectedLabId, searchQuery, selectedCategory]);

  useEffect(() => {
    if (view === 'pending') {
      fetchPendingBookings();
    }
    if (view === 'damage') {
      fetchDamageReports();
    }
    if (view === 'inventory') {
      fetchLabs();
      fetchItems();
    }
    if (view === 'usage') {
      fetchUsageLogs();
    }
    if (view === 'health') {
      // EquipmentHealth component handles its own data fetching
    }
    if (view === 'demand') {
      // EquipmentDemand component handles its own data fetching
    }
    if (view === 'dashboard') {
      fetchItems();
      fetchPendingBookings();
      fetchDamageReports();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'inventory' && selectedLabId) {
      fetchItems();
    }
  }, [selectedLabId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 mb-8 shadow-2xl border border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-sky-500/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
                    <Package className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-slate-300 text-lg font-medium">Advanced inventory management suite</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">System Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Real-time Updates</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-300 text-sm font-medium">Welcome back,</p>
                <p className="text-2xl font-bold text-white">{user?.name || 'Admin'}</p>
                <p className="text-slate-300 text-sm mt-1 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </div>

      {view === 'dashboard' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-800">{items.length}</p>
                  <p className="text-sm text-blue-600">Total Items</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <Check className="w-8 h-8 text-green-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-800">{items.filter(item => item.status === 'available').length}</p>
                  <p className="text-sm text-green-600">Available Items</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(items.filter(item => item.status === 'available').length / items.length) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <ClipboardList className="w-8 h-8 text-yellow-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-yellow-800">{pendingBookings.length}</p>
                  <p className="text-sm text-yellow-600">Pending Requests</p>
                </div>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${Math.min(pendingBookings.length * 10, 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-800">{damageReports.length}</p>
                  <p className="text-sm text-red-600">Damage Reports</p>
                </div>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.min(damageReports.length * 10, 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-yellow-500" />
                Recent Pending Requests
              </h3>
              <div className="space-y-4">
                {pendingBookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 hover:shadow-md transition-shadow duration-200">
                    <div>
                      <p className="font-semibold text-slate-800">{booking.item_name}</p>
                      <p className="text-sm text-slate-600">{booking.student} - {booking.lab}</p>
                      {booking.booking_date && <p className="text-sm text-slate-500">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>}
                      {booking.time_slot && <p className="text-sm text-slate-500">Time: {booking.time_slot}</p>}
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full shadow-sm">Pending</span>
                  </div>
                ))}
                {pendingBookings.length === 0 && (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No pending requests</p>
                    <p className="text-sm text-slate-400">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Recent Damage Reports
              </h3>
              <div className="space-y-4">
                {damageReports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 hover:shadow-md transition-shadow duration-200">
                    <div>
                      <p className="font-semibold text-slate-800">{report.item_name}</p>
                      <p className="text-sm text-slate-600">{report.user}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full shadow-sm">{report.status}</span>
                  </div>
                ))}
                {damageReports.length === 0 && (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No damage reports</p>
                    <p className="text-sm text-slate-400">Equipment in great condition!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'usage' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            Usage Logs
          </h2>
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Borrowed</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Returned</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs.map(log => (
                  <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-slate-800 font-medium">{log.item_name}</td>
                    <td className="px-6 py-4 text-slate-600">{log.user}</td>
                    <td className="px-6 py-4 text-slate-600">{log.quantity}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{formatTimeGMT(log.time_borrowed)}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{formatTimeGMT(log.time_returned)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                        log.status === 'returned' ? 'bg-green-100 text-green-800' :
                        log.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {usageLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No usage logs found</p>
                      <p className="text-sm text-slate-400">Usage data will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'pending' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-yellow-500" />
            Pending Requests
          </h2>
          <div className="space-y-6">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="bg-white/95 backdrop-blur-sm border border-yellow-200 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-bold text-slate-800">{booking.item_name}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full">Pending</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600"><strong className="text-slate-800">Student:</strong> {booking.student}</p>
                        <p className="text-slate-600"><strong className="text-slate-800">Lab:</strong> {booking.lab}</p>
                      </div>
                      <div>
                        <p className="text-slate-600"><strong className="text-slate-800">Requested:</strong> {new Date(booking.time_requested).toLocaleString()}</p>
                        {booking.booking_date && <p className="text-slate-600"><strong className="text-slate-800">Booking Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>}
                        {booking.time_slot && <p className="text-slate-600"><strong className="text-slate-800">Time Slot:</strong> {booking.time_slot}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 ml-6">
                    <button
                      onClick={() => approveBooking(booking.id)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => denyBooking(booking.id)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingBookings.length === 0 && (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
                <p className="text-slate-500">No pending requests at the moment</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'damage' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            Damage Reports
          </h2>
          <div className="space-y-6">
            {damageReports.map(report => (
              <div key={report.id} className="bg-white/95 backdrop-blur-sm border border-red-200 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-bold text-slate-800">{report.item_name}</h3>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                        report.status === 'reported' ? 'bg-red-100 text-red-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-600"><strong className="text-slate-800">Reported by:</strong> {report.user}</p>
                      <p className="text-slate-600"><strong className="text-slate-800">Description:</strong> {report.description}</p>
                      <p className="text-slate-600"><strong className="text-slate-800">Reported:</strong> {new Date(report.time_reported).toLocaleString()}</p>
                    </div>
                  </div>
                  {report.status === 'reported' && (
                    <button
                      onClick={() => resolveDamage(report.id)}
                      className="ml-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
            {damageReports.length === 0 && (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Damage Reports</h3>
                <p className="text-slate-500">All equipment is in good condition</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'health' && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wrench className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold">Equipment Health Monitoring</h2>
          </div>
          <p className="text-gray-600 mb-4">Track equipment health, usage counts, and schedule maintenance for better lab management.</p>
          <EquipmentHealth labId={selectedLabId} />
        </div>
      )}

      {view === 'demand' && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold">Predictive Equipment Demand Analytics</h2>
          </div>
          <p className="text-gray-600 mb-4">AI-powered insights on equipment demand patterns, bookings, and predictions for better inventory management.</p>
          <EquipmentDemand />
        </div>
      )}

      {view === 'inventory' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-7 h-7 text-blue-500" />
              Inventory Management
            </h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
              >
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Equipment">Equipment</option>
                <option value="Apparatus">Apparatus</option>
                <option value="Tools">Tools</option>
                <option value="Electronics">Electronics</option>
              </select>
              <select
                value={selectedLabId || ''}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
              >
                <option value="">Select Lab</option>
                {labs.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddItem(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedLabId}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.filter(item => item.lab_id == selectedLabId).map(item => (
              <div key={item.id} className="bg-white/95 backdrop-blur-sm border border-slate-200 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3>
                    <p className="text-slate-600 text-sm mb-3">{item.description}</p>
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
                        <span className="text-slate-600">Quantity</span>
                        <span className="font-semibold text-slate-800">{item.available_quantity}/{item.quantity}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(item.available_quantity / item.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => editItem(item)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setQrItem(item)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    QR
                  </button>
                </div>
              </div>
            ))}
            {items.filter(item => item.lab_id == selectedLabId).length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Items Found</h3>
                <p className="text-slate-500">Add your first item to get started</p>
              </div>
            )}
          </div>
        </div>
      )}


      {qrItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-500" />
                QR Code for {qrItem.name}
              </h3>
              <button
                onClick={() => setQrItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <QRCodeSVG value={qrItem.unique_id} size={200} />
              </div>
              <p className="text-sm text-slate-500 mt-3">Scan with mobile device</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Item ID:</span>
                <span className="font-mono bg-slate-100 px-2 py-1 rounded">{qrItem.unique_id}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Encoded URL:</span>
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">/equipment?id={qrItem.unique_id}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Download QR code as PNG
                  const svg = document.querySelector('.bg-slate-50 p-4 rounded-2xl svg');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg.querySelector('svg'));
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.fillStyle = 'white';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0);
                      const link = document.createElement('a');
                      link.download = `${qrItem.name}-QR.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={() => {
                  // Print QR code
                  const printContent = `
                    <html>
                      <head>
                        <title>QR Code - ${qrItem.name}</title>
                        <style>
                          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                          .qr-container { margin: 20px auto; }
                          .details { margin-top: 20px; font-size: 14px; color: #666; }
                        </style>
                      </head>
                      <body>
                        <h2>QR Code for ${qrItem.name}</h2>
                        <div class="qr-container">
                          ${document.querySelector('.bg-slate-50 p-4 rounded-2xl').innerHTML}
                        </div>
                        <div class="details">
                          <p><strong>Item ID:</strong> ${qrItem.unique_id}</p>
                          <p><strong>Lab:</strong> ${qrItem.lab_name}</p>
                          <p><strong>Category:</strong> ${qrItem.category}</p>
                        </div>
                      </body>
                    </html>
                  `;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <AddItemModal 
          onAdd={addItem} 
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }} 
          editingItem={editingItem}
        />
      )}
    </div>
  </div>
  );
};


export default AdminDashboard;

