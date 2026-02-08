import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import Button from '../common/Button'; // Assuming you have this
import { 
  CalendarDaysIcon, 
  CurrencyRupeeIcon, 
  CheckBadgeIcon, 
  CalculatorIcon,
  ClockIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const BookingFlow = ({ machine, onClose, onBookingCreated }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  
  // Smart Defaults
  const [formData, setFormData] = useState({
    requestedStartAt: '',
    billingScheme: machine.pricing.scheme || 'time', // Default to machine's preference
    areaBigha: ''
  });

  const [estimatedCost, setEstimatedCost] = useState(0);

  // --- 🧮 LIVE CALCULATOR LOGIC ---
  useEffect(() => {
    if (formData.billingScheme === 'area' && formData.areaBigha) {
      // Area * Rate
      setEstimatedCost(parseFloat(formData.areaBigha) * machine.pricing.rate);
    } else {
      // For Time/Daily, we just show the base rate as we don't know duration yet
      setEstimatedCost(machine.pricing.rate);
    }
  }, [formData, machine.pricing.rate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper for Scheme Selection (Card Click)
  const selectScheme = (scheme) => {
    setFormData(prev => ({ ...prev, billingScheme: scheme }));
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
        if (onBookingCreated) onBookingCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please check internet or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (booking && window.confirm('Cancel this request?')) {
      try {
        setLoading(true);
        await bookingService.cancelBooking(booking.bookingId, 'User cancelled immediately');
        onClose();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- 🎨 RENDER: STEP 1 (FORM) ---
  const renderStep1 = () => (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm">
           <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">New Booking Request</h3>
          <p className="text-xs text-gray-500 mt-1">
            Machine: <span className="font-semibold text-blue-700">{machine.name}</span>
          </p>
        </div>
      </div>

      {/* Date Picker (Styled) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kab chahiye? (Start Date & Time)
        </label>
        <div className="relative">
            <input
                type="datetime-local"
                name="requestedStartAt"
                value={formData.requestedStartAt}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full p-3 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-gray-700"
            />
        </div>
      </div>

      {/* Billing Scheme Selection (Cards instead of Dropdown) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Billing Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Option 1: Hourly */}
          <div 
            onClick={() => selectScheme('time')}
            className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
              formData.billingScheme === 'time' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-100 bg-white hover:border-gray-200 text-gray-500'
            }`}
          >
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs font-bold">Per Hour</span>
            <span className="text-[10px]">₹{machine.pricing.rate}/hr</span>
          </div>

          {/* Option 2: Area (Only if supported or default) */}
          <div 
            onClick={() => selectScheme('area')}
            className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
              formData.billingScheme === 'area' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-100 bg-white hover:border-gray-200 text-gray-500'
            }`}
          >
            <MapIcon className="w-6 h-6" />
            <span className="text-xs font-bold">Per Bigha</span>
            <span className="text-[10px]">₹{machine.pricing.rate}/bigha</span>
          </div>
        </div>
      </div>

      {/* Area Input (Conditional) */}
      {formData.billingScheme === 'area' && (
        <div className="animate-[slideDown_0.2s_ease-out]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kitna Area? (in Bigha)
          </label>
          <div className="relative">
            <input
                type="number"
                name="areaBigha"
                value={formData.areaBigha}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg"
                placeholder="e.g. 5.5"
                step="0.1"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
                <MapIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* 💰 LIVE ESTIMATE CARD */}
      <div className="bg-gray-900 text-white rounded-xl p-4 flex justify-between items-center shadow-lg">
        <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Estimated Cost</p>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">₹{estimatedCost}</span>
                {formData.billingScheme !== 'area' && <span className="text-xs text-gray-400">+ duration</span>}
            </div>
        </div>
        <div className="bg-white/10 p-2 rounded-lg">
            <CalculatorIcon className="w-6 h-6 text-green-400" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleCreateBooking}
          loading={loading}
          disabled={loading || !formData.requestedStartAt || (formData.billingScheme === 'area' && !formData.areaBigha)}
          className="flex-1 py-3 text-lg shadow-green-500/30"
        >
          Confirm Request
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="py-3"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  // --- 🎨 RENDER: STEP 2 (SUCCESS) ---
  const renderStep2 = () => (
    <div className="text-center py-6 animate-[scaleIn_0.3s_ease-out]">
      
      {/* Animated Success Icon */}
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
        <CheckBadgeIcon className="h-12 w-12 text-green-600 animate-bounce" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
      <p className="text-gray-500 mb-8 px-4">
        Owner <strong>{machine.ownerId?.name}</strong> ko request bhej di gayi hai. Wo 15 min me confirm karenge.
      </p>

      {/* Next Steps Timeline */}
      <div className="bg-gray-50 rounded-xl p-5 text-left mb-8 mx-2 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Next Steps</h4>
        <div className="relative border-l-2 border-gray-200 ml-2 space-y-6">
            <div className="ml-6 relative">
                <span className="absolute -left-[31px] bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
                <p className="text-sm font-medium text-gray-900">Wait for Confirmation</p>
                <p className="text-xs text-gray-500">You will get a notification.</p>
            </div>
            <div className="ml-6 relative">
                <span className="absolute -left-[31px] bg-gray-300 h-4 w-4 rounded-full border-2 border-white"></span>
                <p className="text-sm font-medium text-gray-500">Share OTP</p>
                <p className="text-xs text-gray-400">When machine arrives at farm.</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onClose} className="w-full py-3">
          Done & Close
        </Button>
        <button 
            onClick={handleCancelBooking}
            className="text-sm text-red-500 hover:text-red-700 font-medium py-2"
        >
            Mistake? Cancel Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      {/* No need for top stepper if flow is simple 2-step. Just show content. */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      
      {/* Inline Styles for Animation */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; height: 0; } to { opacity: 1; height: auto; } }
      `}</style>
    </div>
  );
};

export default BookingFlow;