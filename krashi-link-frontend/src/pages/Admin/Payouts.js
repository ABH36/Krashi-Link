import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { 
  BanknotesIcon, 
  CheckBadgeIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ClipboardDocumentIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Payouts = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verify'); // 'verify' | 'release'
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // ID of loading action

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingTransactions();
      if (response.success) setTransactions(response.data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ type: 'success', message: 'ID Copied to clipboard' });
  };

  const handleAction = async (id, actionType, payload = {}) => {
    setActionLoading(id);
    try {
      if (actionType === 'verify') {
        await paymentService.verifyPayment(id, payload.verified);
        setToast({ type: payload.verified ? 'success' : 'info', message: payload.verified ? 'Payment Verified' : 'Payment Rejected' });
      } else if (actionType === 'release') {
        await paymentService.releasePayout(payload.bookingId);
        setToast({ type: 'success', message: 'Payout Released Successfully 🚀' });
      }
      fetchTransactions(); // Refresh
    } catch (error) {
      setToast({ type: 'error', message: 'Action Failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter Logic
  const verifyList = transactions.filter(t => t.bookingId?.payment?.status === 'pending');
  const releaseList = transactions.filter(t => t.bookingId?.payment?.status === 'verified');

  const currentList = activeTab === 'verify' ? verifyList : releaseList;
  const totalAmount = currentList.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <Loader text="Loading Financial Data..." />;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BuildingLibraryIcon className="w-8 h-8 text-blue-600" />
              Payout Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage inbound verifications and outbound payouts</p>
        </div>
        <div className="text-right mt-4 md:mt-0 bg-blue-50 px-5 py-3 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Pending in Queue</p>
            <p className="text-3xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* 🎛️ Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-full md:w-fit">
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'verify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClockIcon className="w-4 h-4" /> Verify Inbound ({verifyList.length})
        </button>
        <button
          onClick={() => setActiveTab('release')}
          className={`flex-1 flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'release' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BanknotesIcon className="w-4 h-4" /> Release Payouts ({releaseList.length})
        </button>
      </div>

      {/* 📄 Transaction List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="bg-gray-50 p-4 rounded-full inline-block mb-3">
                    <CheckBadgeIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No pending tasks in this queue.</p>
            </div>
        ) : (
            currentList.map(tx => (
                <div key={tx._id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row items-center gap-6">
                    
                    {/* ID & Date */}
                    <div className="w-full lg:w-48 shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                #{tx.bookingId?._id.slice(-6).toUpperCase()}
                            </span>
                            <button onClick={() => handleCopy(tx.bookingId?._id)} className="text-gray-400 hover:text-blue-500">
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </p>
                    </div>

                    {/* Flow Visualization */}
                    <div className="flex-1 w-full bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                {tx.farmerId?.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-gray-700">{tx.farmerId?.name}</p>
                                <p className="text-[10px] text-gray-500">Farmer (Payer)</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-400 mb-1">₹{tx.amount}</span>
                            <div className="w-24 h-0.5 bg-gray-300 relative">
                                <div className="absolute -right-1 -top-1.5 text-gray-300">
                                    <ArrowRightIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-gray-700">{tx.ownerId?.name}</p>
                                <p className="text-[10px] text-gray-500">Owner (Payee)</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                                {tx.ownerId?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full lg:w-auto shrink-0 flex gap-2 justify-end">
                        {activeTab === 'verify' ? (
                            <>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleAction(tx._id, 'verify', { verified: false })}
                                    loading={actionLoading === tx._id}
                                    disabled={!!actionLoading}
                                >
                                    Reject
                                </Button>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => handleAction(tx._id, 'verify', { verified: true })}
                                    loading={actionLoading === tx._id}
                                    disabled={!!actionLoading}
                                >
                                    Verify Payment
                                </Button>
                            </>
                        ) : (
                            <Button 
                                variant="success" 
                                size="sm" 
                                className="shadow-green-200"
                                onClick={() => handleAction(tx._id, 'release', { bookingId: tx.bookingId?._id })}
                                loading={actionLoading === tx._id}
                                disabled={!!actionLoading}
                            >
                                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                Release Payout
                            </Button>
                        )}
                    </div>

                </div>
            ))
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Payouts;