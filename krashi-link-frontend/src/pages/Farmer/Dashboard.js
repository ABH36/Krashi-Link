import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import WeatherWidget from '../../components/common/WeatherWidget';
import MandiRates from '../../components/common/MandiRates'; // Mandi Rates bhi added hai
import { 
  TruckIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  MapPinIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeBookings: 0,
    completedJobs: 0,
    totalSpent: 0,
    machinesNearby: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRes = await bookingService.getUserBookings();
        const bookings = bookingRes.success ? bookingRes.data.bookings : [];

        const active = bookings.filter(b => 
          ['requested', 'owner_confirmed', 'arrived_otp_verified', 'in_progress'].includes(b.status)
        ).length;

        const completed = bookings.filter(b => 
          ['paid', 'completed_pending_payment'].includes(b.status)
        ).length;

        const paymentRes = await paymentService.getUserTransactions();
        let spent = 0;
        if (paymentRes.success && paymentRes.data.stats) {
           spent = paymentRes.data.stats.totalEarnings || 0;
        }

        setStats({
          activeBookings: active,
          completedJobs: completed,
          totalSpent: spent,
          machinesNearby: 0 
        });
      } catch (error) {
        console.error("Error fetching farmer dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader text={t('common.loading')} />;

  const statCards = [
    {
      name: t('farmer.activeBookings'), // Translated
      value: stats.activeBookings,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: t('booking.inProgress') // Translated
    },
    {
      name: t('farmer.completedJobs'),
      value: stats.completedJobs,
      icon: TruckIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: t('booking.completed')
    },
    {
      name: t('farmer.totalSpent'),
      value: `₹${stats.totalSpent.toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Total rental cost'
    },
    {
      name: t('farmer.findNearby'),
      value: 'Map View',
      icon: MapPinIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Click to explore'
    }
  ];

  const quickActions = [
    {
      title: t('farmer.findMachines'),
      description: t('farmer.browseText'),
      icon: TruckIcon,
      action: () => navigate('/farmer/machines'),
      color: 'bg-blue-500'
    },
    {
      title: t('farmer.findOnMap'),
      description: 'View machines on live map',
      icon: MapPinIcon,
      action: () => navigate('/farmer/machines', { state: { view: 'map' } }), 
      color: 'bg-purple-500'
    },
    {
      title: t('farmer.bookingHistory'),
      description: 'View past and current bookings',
      icon: ClockIcon,
      action: () => navigate('/farmer/bookings'),
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          {t('common.welcome')}, {user?.name}!
        </h1>
        <p className="opacity-90">
          {t('app.tagline')}
        </p>
      </div>

      <WeatherWidget />
      <MandiRates />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="card hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => {
                if(stat.name === t('farmer.findNearby')) navigate('/farmer/machines', { state: { view: 'map' } });
                if(stat.name === t('farmer.activeBookings')) navigate('/farmer/bookings');
            }}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('farmer.needMachine')}</h2>
          <p className="text-gray-500 mb-4">{t('farmer.browseText')}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/farmer/machines')}
            className="w-full md:w-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('farmer.bookNow')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;