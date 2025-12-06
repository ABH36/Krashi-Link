import React from 'react';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600">Comprehensive overview of platform performance</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;