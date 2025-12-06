import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import Button from '../common/Button';
import Loader from '../common/Loader';

const BookingFlow = ({ machine, onClose, onBookingCreated }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    requestedStartAt: '',
    billingScheme: machine.pricing.scheme,
    areaBigha: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      const bookingData = {
        machineId: machine._id,
        requestedStartAt: new Date(formData.requestedStartAt).toISOString(),
        billingScheme: formData.billingScheme,
        areaBigha: formData.billingScheme === 'area' ? parseFloat(formData.areaBigha) : undefined
      };

      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        setBooking(response.data);
        setStep(2);
        if (onBookingCreated) {
          onBookingCreated(response.data);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (booking && window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        await bookingService.cancelBooking(booking.bookingId, 'Farmer cancelled the booking');
        onClose();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Booking Details</h3>
        <p className="text-blue-700">
          You are about to book <strong>{machine.name}</strong> from <strong>{machine.ownerId?.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requested Start Time *
          </label>
          <input
            type="datetime-local"
            name="requestedStartAt"
            value={formData.requestedStartAt}
            onChange={handleInputChange}
            className="input-field"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Scheme *
          </label>
          <select
            name="billingScheme"
            value={formData.billingScheme}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="time">Per Hour (₹{machine.pricing.rate}/hour)</option>
            <option value="area">Per Bigha (₹{machine.pricing.rate}/bigha)</option>
            <option value="daily">Per Day (₹{machine.pricing.rate}/day)</option>
          </select>
        </div>
      </div>

      {formData.billingScheme === 'area' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area (Bigha) *
          </label>
          <input
            type="number"
            name="areaBigha"
            value={formData.areaBigha}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter area in bigha"
            min="0.1"
            step="0.1"
            required
          />
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Pricing Summary</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Base Rate:</span>
            <span>₹{machine.pricing.rate}/{machine.pricing.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>Scheme:</span>
            <span className="capitalize">{formData.billingScheme}</span>
          </div>
          {formData.billingScheme === 'area' && formData.areaBigha && (
            <div className="flex justify-between">
              <span>Area:</span>
              <span>{formData.areaBigha} bigha</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleCreateBooking}
          loading={loading}
          disabled={loading || !formData.requestedStartAt}
          className="flex-1"
        >
          Request Booking
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Booking Request Sent!
        </h3>
        <p className="text-green-700">
          Your booking request has been sent to {machine.ownerId?.name}. 
          They have 15 minutes to confirm your request.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-yellow-700 text-left space-y-1">
          <li>• Machine owner will review your request</li>
          <li>• You'll receive a notification when they respond</li>
          <li>• If confirmed, you'll get arrival instructions</li>
          <li>• Use OTP verification when the machine arrives</li>
        </ul>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          variant="primary"
          onClick={onClose}
          className="flex-1"
        >
          View My Bookings
        </Button>
        <Button
          variant="secondary"
          onClick={handleCancelBooking}
          loading={loading}
        >
          Cancel Booking
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 1 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Booking Details</span>
        </div>
        
        <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Confirmation</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
};

export default BookingFlow;