import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import { 
  CogIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  PlusIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeMachines: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    happyFarmers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Fetching
        const [machineRes, bookingRes, paymentRes] = await Promise.all([
            machineService.getMyMachines(1, 100),
            bookingService.getOwnerBookings({ limit: 100 }),
            paymentService.getUserTransactions()
        ]);

        const machines = machineRes.success ? machineRes.data.machines : [];
        const bookings = bookingRes.success ? bookingRes.data.bookings : [];
        const pending = bookings.filter(b => b.status === 'requested').length;
        const uniqueFarmers = new Set(bookings.filter(b => b.status === 'paid').map(b => b.farmerId?._id)).size;
        
        let earnings = 0;
        if (paymentRes.success && paymentRes.data.stats) {
           earnings = paymentRes.data.stats.totalEarnings || 0;
        }

        setStats({
          activeMachines: machines.length,
          pendingRequests: pending,
          totalEarnings: earnings,
          happyFarmers: uniqueFarmers
        });

      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text={t('common.loading')} />;

  const statCards = [
    { name: 'Total Revenue', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, icon: CurrencyRupeeIcon, color: 'text-green-600', bg: 'bg-green-100', link: '/owner/earnings', trend: '+15% this month' },
    { name: 'Machines Listed', value: stats.activeMachines, icon: CogIcon, color: 'text-blue-600', bg: 'bg-blue-100', link: '/owner/my-machines' },
    { name: 'Pending Requests', value: stats.pendingRequests, icon: ClockIcon, color: 'text-orange-600', bg: 'bg-orange-100', link: '/owner/requests', alert: stats.pendingRequests > 0 },
    { name: 'Farmers Served', value: stats.happyFarmers, icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header with Add Machine CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
        </div>
        
        <button 
            onClick={() => navigate('/owner/my-machines')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
            <PlusIcon className="w-5 h-5" />
            Add New Machine
        </button>
      </div>

      {/* 🚨 Action Alert (Only if requests pending) */}
      {stats.pendingRequests > 0 && (
          <div 
            onClick={() => navigate('/owner/requests')}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
          >
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-200 rounded-full text-orange-700 animate-pulse">
                      <ExclamationCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="font-bold text-orange-900">Action Required</h3>
                      <p className="text-sm text-orange-700">You have {stats.pendingRequests} new booking requests waiting.</p>
                  </div>
              </div>
              <span className="text-sm font-bold text-orange-800 bg-white px-3 py-1 rounded-lg shadow-sm">View</span>
          </div>
      )}

      {/* 📊 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
            <div 
                key={idx} 
                onClick={() => stat.link && navigate(stat.link)}
                className={`bg-white p-5 rounded-xl border transition-all cursor-pointer ${stat.alert ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        {stat.trend && (
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                                <ArrowTrendingUpIcon className="w-3 h-3" /> {stat.trend}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* 🚀 Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Management</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                      { label: 'My Machines', icon: CogIcon, path: '/owner/my-machines', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Booking Requests', icon: ClockIcon, path: '/owner/requests', color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Earnings & Payouts', icon: CurrencyRupeeIcon, path: '/owner/earnings', color: 'text-green-600', bg: 'bg-green-50' }
                  ].map((action, i) => (
                      <button 
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
                      >
                          <div className={`p-3 rounded-full mb-3 ${action.bg} group-hover:scale-110 transition-transform`}>
                              <action.icon className={`w-6 h-6 ${action.color}`} />
                          </div>
                          <span className="font-semibold text-sm text-gray-700">{action.label}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Promo / Tip Card */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white flex flex-col justify-between">
              <div>
                  <h3 className="text-xl font-bold mb-2">Grow Business 🚀</h3>
                  <p className="text-purple-100 text-sm opacity-90">
                      Add clear photos and competitive rates to get 3x more bookings this season.
                  </p>
              </div>
              <button 
                onClick={() => navigate('/owner/my-machines')}
                className="mt-6 bg-white text-purple-700 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-gray-50 transition-colors"
              >
                  Optimize Listings
              </button>
          </div>
      </div>

    </div>
  );
};

export default OwnerDashboard;