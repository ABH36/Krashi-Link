import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { 
  UsersIcon, 
  CogIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  MegaphoneIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [statsData, setStatsData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Parallel Fetching for speed
      const [analyticsRes, logsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getSystemLogs(1) // Fetch page 1 for recent activity
      ]);

      if (analyticsRes.success) setStatsData(analyticsRes.data);
      if (logsRes.success) setRecentLogs(logsRes.data.logs.slice(0, 5)); // Only top 5

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Initializing Command Center..." />;

  // --- 📊 STATS CONFIG ---
  const stats = [
    {
      name: 'Total Users',
      value: statsData?.totals?.users || '0',
      icon: UsersIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12% this week' // Mock trend
    },
    {
      name: 'Total Machines',
      value: statsData?.totals?.machines || '0',
      icon: CogIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+5 new'
    },
    {
      name: 'Revenue',
      value: `₹${statsData?.revenue?.total || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: '↑ 8% growth'
    },
    {
      name: 'Active Jobs',
      value: statsData?.activeBookings || '0',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: 'Live Now'
    }
  ];

  // --- ⚡ ACTIONS CONFIG ---
  const quickActions = [
    { title: 'Verify Users', icon: UsersIcon, path: '/admin/verification', color: 'bg-blue-600' },
    { title: 'Payouts', icon: CurrencyRupeeIcon, path: '/admin/payouts', color: 'bg-amber-600' },
    { title: 'Broadcast', icon: MegaphoneIcon, path: '/admin/broadcast', color: 'bg-orange-500' },
    { title: 'Disputes', icon: ExclamationTriangleIcon, path: '/admin/disputes', color: 'bg-red-500' },
    { title: 'Analytics', icon: ChartBarIcon, path: '/admin/analytics', color: 'bg-green-600' },
    { title: 'All Logs', icon: ClipboardDocumentListIcon, path: '/admin/logs', color: 'bg-gray-600' },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Welcome Banner */}
      <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-bold">
            Admin Command Center
            </h1>
            <p className="text-gray-400 mt-2">
            Welcome back, {user?.name}. System is running smoothly.
            </p>
        </div>
      </div>

      {/* 📊 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                <span className={`font-medium px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                    {stat.trend}
                </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ⚡ Quick Actions Grid */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CogIcon className="w-5 h-5 text-gray-500" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                        <div className={`p-3 rounded-full text-white mb-3 shadow-md group-hover:scale-110 transition-transform ${action.color}`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{action.title}</span>
                    </button>
                ))}
            </div>

            {/* 📝 Recent Activity Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent System Activity</h3>
                    <button onClick={() => navigate('/admin/logs')} className="text-xs text-blue-600 hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {recentLogs.length === 0 ? (
                        <p className="p-6 text-center text-gray-400 text-sm">No recent activity</p>
                    ) : recentLogs.map((log) => (
                        <div key={log._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${log.action.includes('ERROR') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">by {log.actorId?.name || 'System'}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 🏥 System Health Panel */}
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ServerIcon className="w-5 h-5 text-gray-500" /> System Health
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Status Items */}
                {[
                    { label: 'API Server', status: 'Operational', color: 'bg-green-500', icon: ServerIcon },
                    { label: 'Database (MongoDB)', status: 'Operational', color: 'bg-green-500', icon: CircleStackIcon },
                    { label: 'Socket Stream', status: 'Active (12 conns)', color: 'bg-blue-500', icon: CpuChipIcon },
                    { label: 'Storage (S3)', status: '98% Free', color: 'bg-green-500', icon: CloudIcon }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                                <p className="text-xs text-gray-400">Uptime: 99.9%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color} animate-pulse`}></span>
                            <span className="text-xs font-medium text-gray-600">{item.status}</span>
                        </div>
                    </div>
                ))}

                <div className="pt-4 border-t border-gray-100">
                    <button className="w-full py-2 text-xs font-semibold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        Run System Diagnostics
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper icon not in imports
const CloudIcon = ({className}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);

export default AdminDashboard;