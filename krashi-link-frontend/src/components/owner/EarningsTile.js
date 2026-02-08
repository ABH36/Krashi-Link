import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import paymentService from '../../services/paymentService';
import Loader from '../common/Loader';
import { 
  CurrencyRupeeIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowDownLeftIcon, // Income
  ArrowUpRightIcon,  // Refund/Payout
  CalendarDaysIcon,
  DocumentArrowDownIcon // For Report
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
      const response = await paymentService.getUserTransactions(timeRange); // Assuming API accepts timeRange
      if (response.success) {
        setTransactions(response.data.transactions);
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

  const getTotalEarnings = () => totals['released'] || 0;
  const getPendingAmount = () => totals['pending'] || 0;
  const getRecentTransactions = () => transactions.slice(0, 5);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(date);
  };

  if (loading) return (
      <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded-2xl"></div>
          <div className="h-60 bg-gray-100 rounded-xl"></div>
      </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 🟢 Hero Section: Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Earnings Card - Gradient Style */}
        <div className="md:col-span-2 bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-green-100 text-sm font-medium mb-1 flex items-center gap-1">
                        <BanknotesIcon className="w-4 h-4" /> Total Earnings
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight">
                        {formatAmount(getTotalEarnings())}
                    </h2>
                    <p className="text-xs text-green-200 mt-2 bg-white/20 inline-block px-2 py-1 rounded">
                        +15% from last {timeRange} (Trend)
                    </p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <CurrencyRupeeIcon className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>

        {/* Pending Payout Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-2 -mt-2"></div>
             <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-orange-500" /> Pending
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {formatAmount(getPendingAmount())}
                </h3>
             </div>
             <div className="mt-4">
                 <button className="text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-full w-full hover:bg-orange-100 transition-colors">
                    View Schedule
                 </button>
             </div>
        </div>
      </div>

      {/* 🎛️ Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Pill Filter for Mobile Friendliness */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['week', 'month', 'year'].map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        timeRange === range 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Year'}
                </button>
            ))}
        </div>

        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
            <DocumentArrowDownIcon className="w-4 h-4" /> Download Report
        </button>
      </div>

      {/* 📄 Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">Last 5</span>
        </div>

        <div className="divide-y divide-gray-50">
          {getRecentTransactions().length === 0 ? (
            <div className="text-center py-10">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarDaysIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No transactions found for this period</p>
            </div>
          ) : (
            getRecentTransactions().map((tx) => {
              const isIncome = tx.type === 'release'; // Assuming 'release' is income
              return (
                <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {isIncome ? <ArrowDownLeftIcon className="w-5 h-5" /> : <ArrowUpRightIcon className="w-5 h-5" />}
                    </div>
                    
                    <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {tx.type === 'release' ? 'Payment Received' : tx.type === 'hold' ? 'Amount on Hold' : 'Refund Processed'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatDate(tx.createdAt)} • ID: {tx._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
                        {isIncome ? '+' : '-'}{formatAmount(tx.amount)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        tx.status === 'released' ? 'bg-green-50 text-green-700' : 
                        tx.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {transactions.length > 5 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    View All Transactions
                </button>
            </div>
        )}
      </div>

    </div>
  );
};

export default EarningsTile;