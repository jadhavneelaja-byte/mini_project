import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, TrendingUp, Zap, Activity, BarChart3 } from 'lucide-react';
import api from '../services/api';

const sampleStats = {
  equipment_stats: {
    total: 52,
    available: 38,
    borrowed: 9,
    maintenance: 3,
    damaged: 2,
  },
  top_requested: [
    { id: 1, name: 'Microscope', requests: 28, percentage: 100 },
    { id: 2, name: 'Projector', requests: 21, percentage: 75 },
    { id: 3, name: 'Oscilloscope', requests: 17, percentage: 61 },
    { id: 4, name: '3D Printer', requests: 14, percentage: 50 },
    { id: 5, name: 'VR Kit', requests: 12, percentage: 43 },
  ],
  damage_stats: {
    pending: 2,
    resolved: 9,
    total: 11,
  },
  health_alerts: [
    { id: 1, name: 'Laser Cutter', health_score: 48, status: 'Critical' },
    { id: 2, name: 'Spectrometer', health_score: 63, status: 'Warning' },
  ],
};

const SmartLabDashboard = () => {
  const [stats, setStats] = useState(sampleStats);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/api/dashboard-stats');
      if (res?.data) {
        setStats(res.data);
        setUsingSample(false);
      } else {
        setUsingSample(true);
        setStats(sampleStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setUsingSample(true);
      setStats(sampleStats);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = stats?.equipment_stats?.total || 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in px-2 sm:px-0">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-sky-500/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Smart Lab Dashboard
              </h1>
              <p className="text-slate-300 text-lg font-medium">Advanced analytics and equipment management</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live Data</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Real-time Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {usingSample && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-200 text-sm">⚠️ Showing sample data - connect to backend for live statistics</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {[
          {
            label: 'Total Equipment',
            value: stats.equipment_stats.total,
            icon: <Package className="w-5 h-5 text-slate-700" />,
            barColor: 'from-slate-400 to-slate-500',
            accent: 'text-slate-700',
            subtitle: 'Overall inventory count',
            bg: 'from-white to-slate-50',
          },
          {
            label: 'Available',
            value: stats.equipment_stats.available,
            icon: <CheckCircle className="w-5 h-5 text-white" />,
            barColor: 'from-emerald-400 to-green-600',
            accent: 'text-emerald-700',
            subtitle: `${Math.round((stats.equipment_stats.available / totalCount) * 100)}% ready to use`,
            bg: 'from-emerald-50 to-green-100',
          },
          {
            label: 'Borrowed',
            value: stats.equipment_stats.borrowed,
            icon: <TrendingUp className="w-5 h-5 text-white" />,
            barColor: 'from-amber-400 to-orange-600',
            accent: 'text-amber-700',
            subtitle: `${Math.round((stats.equipment_stats.borrowed / totalCount) * 100)}% in use`,
            bg: 'from-amber-50 to-orange-100',
          },
          {
            label: 'Maintenance',
            value: stats.equipment_stats.maintenance,
            icon: <Clock className="w-5 h-5 text-white" />,
            barColor: 'from-sky-400 to-blue-600',
            accent: 'text-sky-700',
            subtitle: 'Under maintenance',
            bg: 'from-sky-50 to-blue-100',
          },
          {
            label: 'Damaged',
            value: stats.equipment_stats.damaged,
            icon: <AlertTriangle className="w-5 h-5 text-white" />,
            barColor: 'from-rose-400 to-red-600',
            accent: 'text-rose-700',
            subtitle: 'Needs repair',
            bg: 'from-rose-50 to-red-100',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border border-slate-200/70 bg-gradient-to-br ${card.bg} p-6 shadow-sm transition duration-300 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`font-semibold ${card.accent}`}>{card.label}</p>
              <div className="p-2 rounded-2xl bg-slate-100">{card.icon}</div>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">{card.value}</p>
            <p className="text-sm text-slate-500 mb-4">{card.subtitle}</p>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full bg-gradient-to-r ${card.barColor}`} style={{ width: `${Math.round((card.value / totalCount) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-sm transition duration-300 hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="p-3 bg-slate-100 rounded-2xl">
            <TrendingUp className="w-7 h-7 text-slate-700" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Top Requested Equipment</h2>
        </div>
        <div className="space-y-4">
          {stats.top_requested.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 font-semibold">{index + 1}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{item.requests} requests</span>
                  </div>
                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-sm transition duration-300 hover:shadow-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-rose-100 rounded-2xl">
              <AlertTriangle className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Damage Reports</h2>
              <p className="text-sm text-slate-500">Keep track of pending and resolved issues.</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-rose-700">Pending</p>
                <p className="text-3xl font-bold text-rose-800">{stats.damage_stats.pending}</p>
              </div>
              <p className="text-sm text-rose-600">
                {stats.damage_stats.pending > 0
                  ? `${stats.damage_stats.pending} item${stats.damage_stats.pending === 1 ? '' : 's'} need attention`
                  : 'No pending damage reports'}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-emerald-700">Resolved</p>
                <p className="text-3xl font-bold text-emerald-800">{stats.damage_stats.resolved}</p>
              </div>
              <p className="text-sm text-emerald-600">Issues repaired during this period</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-sm transition duration-300 hover:shadow-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Zap className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Equipment Health Alerts</h2>
              <p className="text-sm text-slate-500">Monitor equipment health before it impacts labs.</p>
            </div>
          </div>
          {stats.health_alerts.length > 0 ? (
            <div className="space-y-4">
              {stats.health_alerts.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border-l-4 p-6 shadow-sm transition hover:shadow-md ${
                    item.status === 'Critical'
                      ? 'border-rose-400 bg-rose-50/90'
                      : 'border-amber-400 bg-amber-50/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-1">{item.name}</p>
                      <p className={`text-sm font-semibold ${item.status === 'Critical' ? 'text-rose-700' : 'text-amber-700'}`}>
                        {item.status} • {item.health_score}% health
                      </p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === 'Critical'
                              ? 'bg-gradient-to-r from-rose-400 to-red-600'
                              : 'bg-gradient-to-r from-amber-400 to-orange-600'
                          }`}
                          style={{ width: `${item.health_score}%` }}
                        />
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {item.status === 'Critical' ? '🚨 Critical' : '⚠️ Warning'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-semibold text-emerald-700">All equipment in good condition!</p>
                  <p className="text-sm text-emerald-600">No health alerts at this time.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-8 shadow-sm transition duration-300 hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="p-3 bg-slate-100 rounded-2xl">
            <Package className="w-7 h-7 text-slate-700" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">Lab Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-700 mb-2">Utilization Rate</p>
            <p className="text-3xl font-bold text-blue-800">{Math.round(((stats.equipment_stats.borrowed + stats.equipment_stats.maintenance) / totalCount) * 100)}%</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700 mb-2">Available</p>
            <p className="text-3xl font-bold text-emerald-800">{Math.round((stats.equipment_stats.available / totalCount) * 100)}%</p>
          </div>
          <div className="rounded-2xl border border-purple-200/70 bg-violet-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-purple-700 mb-2">Top Item Requests</p>
            <p className="text-3xl font-bold text-purple-800">{stats.top_requested[0]?.requests || 0}</p>
          </div>
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-rose-700 mb-2">Action Items</p>
            <p className="text-3xl font-bold text-rose-800">{stats.damage_stats.pending + stats.health_alerts.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLabDashboard;
