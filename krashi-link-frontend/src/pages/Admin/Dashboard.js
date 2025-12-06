import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService'; // Import Service
import Loader from '../../components/common/Loader';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { 
  UsersIcon, 
  CogIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for dynamic data
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminService.getAnalytics();
      if (response.success) {
        setStatsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const stats = [
    {
      name: 'Total Users',
      value: statsData?.totals?.users || '0',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Machines',
      value: statsData?.totals?.machines || '0',
      icon: CogIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Platform Revenue',
      value: `₹${statsData?.revenue?.total || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Active Bookings',
      value: statsData?.activeBookings || '0',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      title: 'User Verification',
      description: 'Verify and manage platform users',
      icon: UsersIcon,
      action: () => navigate('/admin/verification'),
      color: 'bg-blue-500'
    },
    {
      title: 'Platform Analytics',
      description: 'View comprehensive platform metrics',
      icon: ChartBarIcon,
      action: () => navigate('/admin/analytics'),
      color: 'bg-green-500'
    },
    {
      title: 'Payout Management',
      description: 'Verify payments and release payouts',
      icon: CurrencyRupeeIcon,
      action: () => navigate('/admin/payouts'),
      color: 'bg-yellow-500'
    },
    {
      title: 'Dispute Resolution',
      description: 'Resolve booking disputes',
      icon: ExclamationTriangleIcon,
      action: () => navigate('/admin/disputes'),
      color: 'bg-red-500'
    },
    {
  title: 'Activity Logs',
  description: 'Monitor system events',
  icon: ClipboardDocumentListIcon,
  action: () => navigate('/admin/logs'),
  color: 'bg-gray-600'
},
{
  title: 'Announcements',
  description: 'Broadcast messages',
  icon: MegaphoneIcon,
  action: () => navigate('/admin/broadcast'),
  color: 'bg-orange-500'
}

  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          {t('common.welcome')}, {user?.name} (Admin)!
        </h1>
        <p className="opacity-90">
          Admin dashboard for platform oversight and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-3">🟢</div>
            <p className="font-medium text-green-600">All Systems Operational</p>
            <p className="text-sm mt-2">Database Connection: Active</p>
            <p className="text-sm">Socket Server: Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;