import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../../services/paymentService';
import Loader from '../common/Loader';
import { 
  CurrencyRupeeIcon,
  BanknotesIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EarningsTile = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getUserTransactions();

      if (response.success) {
        setTransactions(response.data.transactions);
        
        // Calculate totals from API response
        const totalsData = {};
        response.data.totals?.forEach(item => {
          totalsData[item._id] = item.totalAmount;
        });
        setTotals(totalsData);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalEarnings = () => {
    return totals['released'] || 0;
  };

  const getPendingAmount = () => {
    return totals['pending'] || 0;
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <Loader text="Loading earnings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(getTotalEarnings())}
          </div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(getPendingAmount())}
          </div>
          <div className="text-sm text-gray-600">Pending Payouts</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {transactions.length}
          </div>
          <div className="text-sm text-gray-600">Total Transactions</div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        
        {getRecentTransactions().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CurrencyRupeeIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Your earnings will appear here after completed bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getRecentTransactions().map(transaction => (
              <div key={transaction._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'release' ? 'bg-green-100' : 
                    transaction.type === 'hold' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <CurrencyRupeeIcon className={`w-5 h-5 ${
                      transaction.type === 'release' ? 'text-green-600' : 
                      transaction.type === 'hold' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {transaction.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'release' ? 'text-green-600' : 
                    transaction.type === 'refund' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {transaction.type === 'refund' ? '-' : ''}{formatAmount(transaction.amount)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'released' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View All Transactions
            </button>
          </div>
        )}
      </div>

      {/* Payout Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Payout Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Payouts are processed within 24 hours of payment verification</li>
          <li>• You'll receive notifications for all payout activities</li>
          <li>• Contact admin for any payout-related queries</li>
        </ul>
      </div>
    </div>
  );
};

export default EarningsTile;