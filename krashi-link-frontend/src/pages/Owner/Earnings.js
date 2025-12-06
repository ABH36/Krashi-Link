import React from 'react';
import EarningsTile from '../../components/owner/EarningsTile';

const Earnings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <p className="text-gray-600">Track your revenue and payment history</p>
      </div>
      <EarningsTile />
    </div>
  );
};

export default Earnings;