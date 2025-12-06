import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { 
  ExclamationTriangleIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  CurrencyRupeeIcon 
} from '@heroicons/react/24/outline';

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // For Resolution Form
  const [resolutionText, setResolutionText] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [actionType, setActionType] = useState('resolve'); // 'resolve' (to owner) or 'refund' (to farmer)

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Fetch all bookings with status 'disputed'
      const response = await adminService.getBookings({ status: 'disputed' });
      if (response.success) {
        setDisputes(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionText('');
    setRefundAmount(0);
    setActionType('resolve'); // Default: Release to Owner
  };

  const handleSubmitResolution = async () => {
    if (!resolutionText.trim()) {
      alert("Please enter a resolution note.");
      return;
    }

    try {
      setActionLoading(true);
      
      // Calculate refund based on action type
      // If refund selected, use input amount. If resolve (reject dispute), refund is 0.
      const finalRefund = actionType === 'refund' ? refundAmount : 0;

      const response = await adminService.resolveDispute(
        selectedDispute._id, 
        resolutionText, 
        finalRefund
      );

      if (response.success) {
        alert("Dispute Resolved Successfully!");
        setSelectedDispute(null);
        fetchDisputes(); // Refresh list
      }
    } catch (error) {
      console.error("Resolution failed", error);
      alert("Failed to resolve dispute.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading Disputes..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
            <p className="text-gray-600">Manage and resolve booking conflicts</p>
        </div>
        <Button variant="secondary" onClick={fetchDisputes}>Refresh</Button>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Active Disputes</h3>
          <p className="text-gray-500">Everything is running smoothly!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {disputes.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md border border-red-100 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start">
                
                {/* Dispute Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded uppercase">
                        {booking.dispute?.code || 'DISPUTE'}
                    </span>
                    <span className="text-xs text-gray-500">Booking ID: {booking._id}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Issue: {booking.dispute?.description}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold text-gray-700">Farmer (Complainant)</p>
                        <p>{booking.farmerId?.name} ({booking.farmerId?.phone})</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold text-gray-700">Owner (Defendant)</p>
                        <p>{booking.ownerId?.name} ({booking.ownerId?.phone})</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                    <strong>Disputed Amount:</strong> ₹{booking.billing.calculatedAmount}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 md:mt-0 md:ml-6">
                   <Button 
                     variant="danger" 
                     onClick={() => handleOpenResolve(booking)}
                   >
                     Resolve Dispute
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
          title={`Resolve Dispute #${selectedDispute._id.slice(-4)}`}
        >
           <div className="space-y-4">
              {/* Action Selection */}
              <div className="flex gap-4 mb-4">
                  <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${actionType === 'resolve' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="actionType" 
                        value="resolve" 
                        checked={actionType === 'resolve'} 
                        onChange={() => setActionType('resolve')}
                        className="hidden"
                      />
                      <div className="font-bold text-green-700">Release to Owner</div>
                      <div className="text-xs text-gray-500">Reject dispute, pay owner</div>
                  </label>

                  <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${actionType === 'refund' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="actionType" 
                        value="refund" 
                        checked={actionType === 'refund'} 
                        onChange={() => {
                            setActionType('refund');
                            setRefundAmount(selectedDispute.billing.calculatedAmount); // Default full refund
                        }}
                        className="hidden"
                      />
                      <div className="font-bold text-blue-700">Refund Farmer</div>
                      <div className="text-xs text-gray-500">Return money to farmer</div>
                  </label>
              </div>

              {/* Refund Amount Input (Only if refund selected) */}
              {actionType === 'refund' && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                      <input 
                        type="number" 
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        max={selectedDispute.billing.calculatedAmount}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max refundable: ₹{selectedDispute.billing.calculatedAmount}
                      </p>
                  </div>
              )}

              {/* Resolution Note */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Note *</label>
                  <textarea 
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Explain the reason for this decision..."
                    className="input-field h-24 resize-none"
                  ></textarea>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setSelectedDispute(null)}>Cancel</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitResolution}
                    loading={actionLoading}
                  >
                    Confirm Resolution
                  </Button>
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default Disputes;