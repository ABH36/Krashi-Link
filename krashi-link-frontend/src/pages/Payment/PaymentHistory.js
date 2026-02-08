import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import paymentService from "../../services/paymentService";
import Loader from '../../components/common/Loader';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getUserTransactions();
      if (response.success) {
        setPayments(response.data.transactions);
      } else {
        setError('Failed to load payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600 bg-green-50', icon: CheckCircleIcon, label: 'Success' };
      case 'pending': return { color: 'text-yellow-600 bg-yellow-50', icon: ClockIcon, label: 'Pending' };
      case 'failed': return { color: 'text-red-600 bg-red-50', icon: XCircleIcon, label: 'Failed' };
      default: return { color: 'text-gray-600 bg-gray-50', icon: ClockIcon, label: status };
    }
  };

  if (loading) return <Loader text="Loading transactions..." />;

  // Stats Calculation
  const totalSpent = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter(p => p.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Stats */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h1>
        
        {/* Wallet-like Stats Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Spent</p>
                    <h2 className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-blue-100">
                <span>• {successCount} Successful Transactions</span>
                <span>• {payments.length} Total</span>
            </div>
        </div>
      </div>

      {/* Filters (Pills) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'completed', 'pending', 'failed'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
              filter === type
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No transactions found.</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const statusStyle = getStatusConfig(payment.status);
            const StatusIcon = statusStyle.icon;

            return (
              <div key={payment._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${statusStyle.color} bg-opacity-20`}>
                        <ArrowUpRightIcon className={`w-5 h-5 ${statusStyle.color.split(' ')[0]}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">
                            {payment.bookingId?.machineId?.name || 'Machine Rental'}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-2">
                            <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3 h-3" />
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                            <span>• ID: #{payment._id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Amount & Status */}
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{payment.amount}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.color}`}>
                        {statusStyle.label}
                    </span>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;