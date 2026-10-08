import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, AlertTriangle, Users, Clock, CheckCircle, XCircle, TrendingUp, Activity, Check } from 'lucide-react';
import api from '../services/api';
import SmartLabDashboard from './SmartLabDashboard';

const formatTimeGMT = (iso) => iso ? new Date(iso).toUTCString() : 'N/A';

const TeacherDashboard = () => {
  const location = useLocation();
  const [usageLogs, setUsageLogs] = useState([]);
  const [damageReports, setDamageReports] = useState([]);

  const query = new URLSearchParams(location.search);
  const view = query.get('view') || 'dashboard';

  useEffect(() => {
    if (view === 'dashboard') {
      // SmartLabDashboard handles its own data fetching
    }
    if (view === 'usage') {
      fetchUsageLogs();
    }
    if (view === 'damage') {
      fetchDamageReports();
    }
  }, [view]);

  const fetchUsageLogs = async () => {
    try {
      const res = await api.get('/api/usage-logs');
      setUsageLogs(res.data);
    } catch (error) {
      console.error('Error fetching usage logs:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                Teacher Lab Monitor
              </h1>
              <p className="text-lg text-slate-600">Real-time lab equipment management and analytics dashboard</p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-3 shadow-lg border border-emerald-200">
              <Activity className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">Teacher View</span>
            </div>
          </div>
        </div>

        {view === 'dashboard' && (
          <div className="mb-6 mt-6">
            <SmartLabDashboard />
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Equipment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Student</th>
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
                      <div className="flex items-center gap-3 mb-4">
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
      </div>
    </div>
  );
};

export default TeacherDashboard;

