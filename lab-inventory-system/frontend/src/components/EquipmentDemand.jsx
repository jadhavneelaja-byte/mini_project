import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';

const EquipmentDemand = () => {
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemandData();
  }, []);

  const fetchDemandData = async () => {
    try {
      const res = await axios.get('/api/equipment-demand');
      setDemandData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demand data:', error);
      setLoading(false);
    }
  };

  const getDemandColor = (demand) => {
    if (demand >= 10) return 'bg-red-100 border-red-300';
    if (demand >= 5) return 'bg-orange-100 border-orange-300';
    if (demand >= 2) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getDemandTextColor = (demand) => {
    if (demand >= 10) return 'text-red-700';
    if (demand >= 5) return 'text-orange-700';
    if (demand >= 2) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getDemandBadgeColor = (status) => {
    if (status === 'High Demand') return 'bg-red-500 text-white';
    if (status === 'Medium Demand') return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  if (loading) {
    return <div className="text-center py-8">Loading demand analytics...</div>;
  }

  if (!demandData) {
    return <div className="text-center py-8 text-gray-500">No demand data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium text-sm uppercase tracking-wide">Total Bookings</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{demandData.total_bookings}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium text-sm uppercase tracking-wide">Average Demand</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{demandData.average_demand}</p>
              <p className="text-xs text-purple-600 mt-1">per item</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-600 font-medium text-sm uppercase tracking-wide">Most Demanded</p>
              <p className="text-2xl font-bold text-pink-900 mt-2 truncate">
                {demandData.top_demanded.length > 0 ? demandData.top_demanded[0].name : 'N/A'}
              </p>
              <p className="text-xs text-pink-600 mt-1">
                {demandData.top_demanded.length > 0 ? `${demandData.top_demanded[0].demand_score} bookings` : ''}
              </p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Most Requested Items Ranking */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Most Requested Items</h2>
        </div>
        <div className="space-y-4">
          {demandData.top_demanded.map((item, index) => (
            <div
              key={item.id}
              className={`p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getDemandColor(item.demand_score)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className={`text-2xl font-bold ${getDemandTextColor(item.demand_score)}`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getDemandTextColor(item.demand_score)}`}>
                    {item.demand_score}
                  </p>
                  <p className="text-xs text-gray-600">bookings</p>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      item.demand_score >= 10
                        ? 'bg-red-500'
                        : item.demand_score >= 5
                        ? 'bg-orange-500'
                        : item.demand_score >= 2
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.demand_score /
                          (demandData.top_demanded[0]?.demand_score || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDemandBadgeColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Predictions */}
      {demandData.predictions.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 mr-3 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">🤖 AI Demand Predictions</h2>
          </div>
          <div className="space-y-4">
            {demandData.predictions.map((pred, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                  pred.confidence === 'High'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <AlertCircle
                    className={`w-6 h-6 mt-1 flex-shrink-0 ${
                      pred.confidence === 'High'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-semibold text-gray-800 text-lg">{pred.item_name}</p>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          pred.confidence === 'High'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {pred.confidence} Confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{pred.prediction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border border-indigo-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Analytics Insights</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Most Popular:</strong>{' '}
              {demandData.top_demanded.length > 0
                ? `${demandData.top_demanded[0].name} with ${demandData.top_demanded[0].demand_score} bookings`
                : 'No data available'}
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Total Lab Activity:</strong> {demandData.total_bookings} equipment requests recorded
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>
              <strong>Recommendation:</strong> Prioritize inventory management for high-demand items to minimize
              shortages
            </span>
          </li>
          {demandData.top_demanded.length > 0 && demandData.top_demanded[0].demand_score < 2 && (
            <li className="flex items-start space-x-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>
                <strong>Notice:</strong> Low overall demand - monitor stock levels carefully
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EquipmentDemand;

