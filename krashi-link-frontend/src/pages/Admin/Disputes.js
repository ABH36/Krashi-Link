import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { 
  ExclamationTriangleIcon, 
  CheckBadgeIcon, 
  CurrencyRupeeIcon, 
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Resolution State
  const [resolutionText, setResolutionText] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [actionType, setActionType] = useState('resolve');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBookings({ status: 'disputed' });
      if (response.success) setDisputes(response.data.bookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionText('');
    setRefundAmount(0);
    setActionType('resolve');
  };

  const handleSubmitResolution = async () => {
    if (!resolutionText.trim()) {
      setToast({ type: 'error', message: "Resolution note is required" });
      return;
    }

    try {
      setActionLoading(true);
      const finalRefund = actionType === 'refund' ? refundAmount : 0;
      const response = await adminService.resolveDispute(selectedDispute._id, resolutionText, finalRefund);

      if (response.success) {
        setToast({ type: 'success', message: "Dispute Resolved Successfully!" });
        setSelectedDispute(null);
        fetchDisputes();
      }
    } catch (error) {
      setToast({ type: 'error', message: "Failed to resolve dispute." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading Disputes..." />;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ScaleIcon className="w-6 h-6 text-red-600" /> Dispute Resolution
            </h1>
            <p className="text-xs text-gray-500">Adjudicate conflicts between Farmer and Owner</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDisputes}>Refresh List</Button>
      </div>

      {disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="bg-green-50 p-4 rounded-full mb-3">
             <CheckBadgeIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
          <p className="text-gray-500 text-sm">No active disputes at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {disputes.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Dispute Header */}
              <div className="bg-red-50/50 px-6 py-3 border-b border-red-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-700 rounded uppercase tracking-wide">
                        {booking.dispute?.code || 'DISPUTE'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">ID: {booking._id}</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-600 text-xs font-medium">
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    At Stake: <span className="text-gray-900 font-bold">₹{booking.billing.calculatedAmount}</span>
                 </div>
              </div>

              <div className="p-6">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                    {booking.dispute?.description || "No description provided"}
                 </h3>

                 {/* 🆚 COMPARISON VIEW */}
                 <div className="flex flex-col md:flex-row gap-4 relative">
                    
                    {/* Farmer (Left) */}
                    <div className="flex-1 bg-green-50/50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <UserIcon className="w-4 h-4 text-green-700" />
                            <span className="text-xs font-bold text-green-800 uppercase">Complainant (Farmer)</span>
                        </div>
                        <p className="font-medium text-gray-900">{booking.farmerId?.name}</p>
                        <p className="text-xs text-gray-500">{booking.farmerId?.phone}</p>
                    </div>

                    {/* VS Badge */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 items-center justify-center text-xs font-bold text-gray-400 shadow-sm z-10">
                        VS
                    </div>

                    {/* Owner (Right) */}
                    <div className="flex-1 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-right md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-end md:justify-start">
                            <span className="text-xs font-bold text-blue-800 uppercase">Defendant (Owner)</span>
                            <UserIcon className="w-4 h-4 text-blue-700" />
                        </div>
                        <p className="font-medium text-gray-900">{booking.ownerId?.name}</p>
                        <p className="text-xs text-gray-500">{booking.ownerId?.phone}</p>
                    </div>
                 </div>

                 {/* Action Bar */}
                 <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                    <div className="flex gap-2">
                        <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <DocumentTextIcon className="w-4 h-4" /> View Booking
                        </button>
                        <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" /> Chat Logs
                        </button>
                    </div>
                    
                    <Button variant="danger" size="sm" onClick={() => handleOpenResolve(booking)}>
                        Adjudicate & Resolve
                    </Button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title="Resolve Dispute"
        >
           <div className="space-y-6">
              
              {/* Visual Selection Cards */}
              <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setActionType('resolve')}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                        actionType === 'resolve' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                      <CheckBadgeIcon className={`w-8 h-8 mx-auto mb-2 ${actionType === 'resolve' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-sm text-gray-900">Pay Owner</div>
                      <div className="text-[10px] text-gray-500">Reject dispute & release funds</div>
                  </div>

                  <div 
                    onClick={() => {
                        setActionType('refund');
                        setRefundAmount(selectedDispute.billing.calculatedAmount);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                        actionType === 'refund' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                      <CurrencyRupeeIcon className={`w-8 h-8 mx-auto mb-2 ${actionType === 'refund' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-sm text-gray-900">Refund Farmer</div>
                      <div className="text-[10px] text-gray-500">Return money (Full/Partial)</div>
                  </div>
              </div>

              {/* Conditional Input */}
              {actionType === 'refund' && (
                  <div className="bg-blue-50 p-4 rounded-lg animate-[fadeIn_0.2s_ease-out]">
                      <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Refund Amount (₹)</label>
                      <input 
                        type="number" 
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        max={selectedDispute.billing.calculatedAmount}
                        className="w-full p-2 border border-blue-200 rounded text-lg font-bold text-blue-900 outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-blue-600 mt-1">Max refundable: ₹{selectedDispute.billing.calculatedAmount}</p>
                  </div>
              )}

              {/* Note */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Decision Note *</label>
                  <textarea 
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="input-field h-24 resize-none text-sm"
                    placeholder="E.g. After reviewing chat logs, it was found that..."
                  ></textarea>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setSelectedDispute(null)}>Cancel</Button>
                  <Button variant="primary" loading={actionLoading} onClick={handleSubmitResolution}>
                    Submit Verdict
                  </Button>
              </div>
           </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Disputes;