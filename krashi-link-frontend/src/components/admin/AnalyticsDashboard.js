import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import Loader from '../common/Loader';
import {
  UsersIcon,
  CogIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics();

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <Loader text="Loading analytics..." />;
  }

  if (!analytics) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600">Unable to load platform analytics at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(analytics.totals.users)}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-xs text-green-600 mt-1">
            +{analytics.growth.recentUsers} this month
          </div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CogIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(analytics.totals.machines)}
          </div>
          <div className="text-sm text-gray-600">Total Machines</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <CalendarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(analytics.totals.bookings)}
          </div>
          <div className="text-sm text-gray-600">Total Bookings</div>
          <div className="text-xs text-green-600 mt-1">
            +{analytics.growth.recentBookings} this month
          </div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.revenue.total)}
          </div>
          <div className="text-sm text-gray-600">Platform Revenue</div>
          <div className="text-xs text-green-600 mt-1">
            +{formatCurrency(analytics.growth.recentRevenue)} this month
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Farmers</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{analytics.totals.farmers}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.totals.farmers / analytics.totals.users) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Owners</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{analytics.totals.owners}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.totals.owners / analytics.totals.users) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admins</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{analytics.totals.admins}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.totals.admins / analytics.totals.users) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Bookings</span>
                <span className="font-medium">{analytics.activeBookings}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Dispute Rate</span>
                <span className="font-medium">{analytics.disputeRate}%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Booking Duration</span>
                <span className="font-medium">{analytics.averageBookingDuration} mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Machines */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Machines</h3>
        {analytics.topMachines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No booking data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.topMachines.map((machine, index) => (
              <div key={machine.machineId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{machine.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{machine.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{machine.count} bookings</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geo Heatmap Info */}
      {analytics.geoHeatmapReady && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center text-sm text-blue-700">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              <span>
                Heatmap data available for {analytics.machineLocations.length} machine locations
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchAnalytics}
          className="btn-primary"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;