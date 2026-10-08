import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, TrendingDown, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const EquipmentHealth = ({ labId }) => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchEquipmentHealth();
  }, []);

  const fetchEquipmentHealth = async () => {
    try {
      const res = await api.get('/api/items/health');
      setHealthData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment health:', error);
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getHealthStatus = (score) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const handleMaintenance = async () => {
    if (!selectedItem) return;
    setMaintenanceLoading(true);

    try {
      await api.post(`/api/items/${selectedItem.id}/maintenance`, {
        description: maintenanceDescription || 'General maintenance',
      });
      showSuccess('Maintenance completed! Health score reset to 100%');
      setShowMaintenanceModal(false);
      setMaintenanceDescription('');
      fetchEquipmentHealth();
    } catch (error) {
      console.error('Error performing maintenance:', error);
      showError('Failed to perform maintenance');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading equipment health data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-lg shadow hover:shadow-lg transition border-l-4 ${
              item.health_score >= 80
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100'
                : item.health_score >= 60
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100'
                : 'border-red-500 bg-gradient-to-br from-red-50 to-red-100'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              {item.health_score < 60 && (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="mb-4 space-y-3">
              {/* Health Score */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">Health Score</label>
                  <span className={`text-lg font-bold ${getHealthColor(item.health_score)}`}>
                    {item.health_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-300">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      item.health_score >= 80
                        ? 'bg-green-500'
                        : item.health_score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${item.health_score}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 font-semibold ${getHealthColor(item.health_score)}`}>
                  {getHealthStatus(item.health_score)}
                </p>
              </div>

              {/* Usage Count */}
              <div className="flex items-center space-x-2 text-gray-700">
                <RotateCcw className="w-4 h-4 text-blue-500" />
                <span>
                  <strong>Usage Count:</strong> {item.usage_count} times
                </span>
              </div>

              {/* Last Maintenance */}
              <div className="flex items-center space-x-2 text-gray-700">
                <Wrench className="w-4 h-4 text-purple-500" />
                <span>
                  <strong>Last Maintenance:</strong>{' '}
                  {item.last_maintenance_date
                    ? new Date(item.last_maintenance_date).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getHealthBgColor(
                item.health_score
              )} ${getHealthColor(item.health_score)}`}
            >
              {getHealthStatus(item.health_score)}
            </div>

            {/* Maintenance Button */}
            {item.health_score < 70 && (
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setShowMaintenanceModal(true);
                }}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <Wrench className="w-4 h-4" />
                <span>Perform Maintenance</span>
              </button>
            )}

            {item.health_score < 50 && (
              <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs text-center font-semibold">
                Maintenance Recommended
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Perform Maintenance</h2>
              <p className="text-gray-600 mt-1">{selectedItem.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Current Health:</strong> {selectedItem.health_score}%
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  After maintenance, health will reset to <strong>100%</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Description
                </label>
                <textarea
                  value={maintenanceDescription}
                  onChange={(e) => setMaintenanceDescription(e.target.value)}
                  placeholder="Description of maintenance performed (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setMaintenanceDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMaintenance}
                  disabled={maintenanceLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{maintenanceLoading ? 'Processing...' : 'Complete Maintenance'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentHealth;

