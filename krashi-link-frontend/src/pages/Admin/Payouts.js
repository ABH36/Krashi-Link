import React, { useState, useEffect } from 'react';
import paymentService  from '../../services/paymentService';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const Payouts = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingTransactions();
      
      if (response.success) {
        setPendingTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (transactionId, verified) => {
    try {
      await paymentService.verifyPayment(transactionId, verified);
      fetchPendingTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment.');
    }
  };

  const handleReleasePayout = async (bookingId) => {
    try {
      await paymentService.releasePayout(bookingId);
      fetchPendingTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error releasing payout:', error);
      alert('Failed to release payout.');
    }
  };

  if (loading) {
    return <Loader text="Loading pending transactions..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
        <p className="text-gray-600">Verify payments and release payouts to owners</p>
      </div>

      {pendingTransactions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Transactions</h3>
          <p className="text-gray-600">All payments have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTransactions.map(transaction => (
            <div key={transaction._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Booking: {transaction.bookingId?._id || 'N/A'}
                    </h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending Verification
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <strong>Farmer:</strong> {transaction.farmerId?.name}
                    </div>
                    <div>
                      <strong>Owner:</strong> {transaction.ownerId?.name}
                    </div>
                    <div>
                      <strong>Amount:</strong> ₹{transaction.amount}
                    </div>
                    <div>
                      <strong>Initiated:</strong> {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleVerifyPayment(transaction._id, true)}
                  >
                    Verify Payment
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleVerifyPayment(transaction._id, false)}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Show release button for verified payments */}
              {transaction.bookingId?.payment?.status === 'verified' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-green-600">
                      Payment verified. Ready for payout release.
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleReleasePayout(transaction.bookingId._id)}
                    >
                      Release Payout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payouts;