import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import WeatherWidget from '../../components/common/WeatherWidget';
import MandiRates from '../../components/common/MandiRates';
import { 
  TruckIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeBookings: 0,
    completedJobs: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching for speed
        const [bookingRes, paymentRes] = await Promise.all([
            bookingService.getUserBookings(),
            paymentService.getUserTransactions()
        ]);

        const bookings = bookingRes.success ? bookingRes.data.bookings : [];
        const active = bookings.filter(b => ['requested', 'owner_confirmed', 'arrived_otp_verified', 'in_progress'].includes(b.status)).length;
        const completed = bookings.filter(b => ['paid', 'completed_pending_payment'].includes(b.status)).length;
        
        let spent = 0;
        if (paymentRes.success && paymentRes.data.stats) {
           spent = paymentRes.data.stats.totalEarnings || 0;
        }

        setStats({ activeBookings: active, completedJobs: completed, totalSpent: spent });
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
      if(e.key === 'Enter') {
          navigate(`/farmer/machines?search=${searchTerm}`);
      }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  const statCards = [
    { name: 'Active Bookings', value: stats.activeBookings, icon: ClockIcon, color: 'text-blue-600', bg: 'bg-blue-50', link: '/farmer/bookings' },
    { name: 'Completed Jobs', value: stats.completedJobs, icon: TruckIcon, color: 'text-green-600', bg: 'bg-green-50', link: '/farmer/bookings?tab=history' },
    { name: 'Total Spent', value: `₹${stats.totalSpent}`, icon: CurrencyRupeeIcon, color: 'text-orange-600', bg: 'bg-orange-50', link: '#' },
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Welcome & Search Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">{t('common.welcome')}, {user?.name}!</h1>
            <p className="opacity-90 text-sm mb-6">{t('app.tagline')}</p>

            {/* Embedded Search Bar */}
            <div className="relative max-w-md">
                <input 
                    type="text" 
                    placeholder="Search machines (e.g. Tractor, Rotavator)..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-300 outline-none shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
        </div>
      </div>

      {/* 🌦️ Weather & Mandi Grid (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
              <WeatherWidget />
          </div>
          <div className="lg:col-span-2 h-full">
              <MandiRates />
          </div>
      </div>

      {/* 📊 Stats Grid */}
      <h2 className="text-lg font-bold text-gray-800">Your Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
            <div 
                key={idx} 
                onClick={() => navigate(stat.link)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
            >
                <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
            </div>
        ))}
      </div>

      {/* 🚀 Quick Actions */}
      <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button onClick={() => navigate('/farmer/machines')} className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-800 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
              <TruckIcon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm">Book Machine</span>
          </button>

          <button onClick={() => navigate('/farmer/machines', { state: { view: 'map' } })} className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
              <MapPinIcon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm">Nearby Map</span>
          </button>

          <button onClick={() => navigate('/farmer/bookings')} className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-800 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
              <TicketIcon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm">My Bookings</span>
          </button>

          {/* Placeholder for future feature */}
          <button className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-500 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <CurrencyRupeeIcon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-sm">Payments</span>
          </button>

      </div>
    </div>
  );
};

export default FarmerDashboard;