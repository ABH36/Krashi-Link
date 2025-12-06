import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import WeatherWidget from '../../components/common/WeatherWidget';
import { 
  CogIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

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
        const machineRes = await machineService.getMyMachines(1, 100);
        const machines = machineRes.success ? machineRes.data.machines : [];
        const active = machines.filter(m => m.availability).length;

        const bookingRes = await bookingService.getOwnerBookings({ limit: 100 });
        const bookings = bookingRes.success ? bookingRes.data.bookings : [];
        const pending = bookings.filter(b => b.status === 'requested').length;
        const completedUniqueFarmers = new Set(
            bookings.filter(b => b.status === 'paid').map(b => b.farmerId?._id)
        ).size;

        const paymentRes = await paymentService.getUserTransactions();
        let earnings = 0;
        if (paymentRes.success && paymentRes.data.stats) {
           earnings = paymentRes.data.stats.totalEarnings || 0;
        }

        setStats({
          activeMachines: active,
          pendingRequests: pending,
          totalEarnings: earnings,
          happyFarmers: completedUniqueFarmers
        });

      } catch (error) {
        console.error("Error fetching owner dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader text={t('common.loading')} />;

  const statCards = [
    {
      name: t('owner.activeMachines'),
      value: stats.activeMachines,
      icon: CogIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Available for rental'
    },
    {
      name: t('owner.pendingRequests'),
      value: stats.pendingRequests,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Awaiting confirmation'
    },
    {
      name: t('owner.totalEarnings'),
      value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Lifetime revenue'
    },
    {
      name: t('owner.uniqueCustomers'),
      value: stats.happyFarmers,
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Farmers served'
    }
  ];

  const quickActions = [
    {
      title: t('owner.myMachines'),
      description: 'Manage your machinery inventory',
      icon: CogIcon,
      action: () => navigate('/owner/my-machines'),
      color: 'bg-blue-500'
    },
    {
      title: t('owner.rentalRequests'),
      description: 'View and confirm booking requests',
      icon: ClockIcon,
      action: () => navigate('/owner/requests'),
      color: 'bg-yellow-500'
    },
    {
      title: t('owner.earnings'),
      description: 'Track your revenue and payouts',
      icon: CurrencyRupeeIcon,
      action: () => navigate('/owner/earnings'),
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          {t('common.welcome')}, {user?.name}!
        </h1>
        <p className="opacity-90">
          {t('owner.growBusiness')}
        </p>
      </div>

      <WeatherWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card hover:shadow-lg transition-all duration-300 hover:scale-105">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('owner.growBusiness')}</h2>
          <p className="text-gray-500 mb-4">{t('owner.addMachineText')}</p>
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={() => navigate('/owner/my-machines')}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('owner.addMachine')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;