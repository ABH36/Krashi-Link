import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { 
  CalendarDaysIcon, 
  MapIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const Booking = () => {
  const { t } = useTranslation();
  const { machineId } = useParams();
  const navigate = useNavigate();
  
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedStartAt: '',
    billingScheme: 'time', // Default
    areaBigha: ''
  });

  useEffect(() => {
    fetchMachine();
  }, [machineId]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await machineService.getMachineById(machineId);
      if (response.success) {
        setMachine(response.data.machine);
        // Set default scheme from machine preference if available
        if (response.data.machine.pricing.scheme) {
            setFormData(prev => ({ ...prev, billingScheme: response.data.machine.pricing.scheme }));
        }
      }
    } catch (error) {
      console.error('Error fetching machine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBookingLoading(true);
      const bookingData = {
        machineId,
        requestedStartAt: formData.requestedStartAt,
        billingScheme: formData.billingScheme,
        areaBigha: formData.billingScheme === 'area' ? parseFloat(formData.areaBigha) : undefined
      };

      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        // Ideally use a Toast here, falling back to alert for simplicity in this file scope
        alert('✅ Booking request sent! Waiting for owner confirmation.');
        navigate('/farmer/bookings');
      }
    } catch (error) {
      alert(error.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSchemeSelect = (scheme) => {
    setFormData(prev => ({ ...prev, billingScheme: scheme }));
  };

  if (loading) return <Loader text="Loading machine details..." />;

  if (!machine) return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-gray-900">Machine not found</h2>
      <Button variant="primary" className="mt-4" onClick={() => navigate('/farmer/machines')}>
        Back to Machines
      </Button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
        <p className="text-gray-500 text-sm">Fill details to request this machine.</p>
      </div>

      {/* Machine Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 shadow-sm flex items-start gap-4">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
           {machine.type === 'tractor' ? '🚜' : machine.type === 'harvester' ? '🌾' : '⚙️'}
        </div>
        <div>
           <h2 className="text-lg font-bold text-gray-900 leading-tight">{machine.name}</h2>
           <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{machine.type}</p>
           
           <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-green-700 font-bold">
                 <CurrencyRupeeIcon className="w-4 h-4" />
                 <span>{machine.pricing.rate} / {machine.pricing.unit}</span>
              </div>
              {machine.ownerId && (
                  <div className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                     <CheckBadgeIcon className="w-3 h-3" />
                     <span>{machine.ownerId.name}</span>
                  </div>
              )}
           </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Date & Time */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            When do you need it?
          </label>
          <div className="relative">
            <input
                type="datetime-local"
                name="requestedStartAt"
                value={formData.requestedStartAt}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-gray-800"
                required
                min={new Date().toISOString().slice(0, 16)}
            />
            <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Billing Scheme - VISUAL CARDS */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Select Billing Type
          </label>
          <div className="grid grid-cols-2 gap-3">
             <div 
                onClick={() => handleSchemeSelect('time')}
                className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    formData.billingScheme === 'time' 
                    ? 'border-green-500 bg-green-50 text-green-800' 
                    : 'border-gray-100 bg-white hover:border-gray-200 text-gray-500'
                }`}
             >
                <ClockIcon className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">Hourly</span>
                <span className="text-[10px] opacity-70">Pay per hour</span>
             </div>

             <div 
                onClick={() => handleSchemeSelect('area')}
                className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    formData.billingScheme === 'area' 
                    ? 'border-green-500 bg-green-50 text-green-800' 
                    : 'border-gray-100 bg-white hover:border-gray-200 text-gray-500'
                }`}
             >
                <MapIcon className="w-6 h-6 mb-1" />
                <span className="font-bold text-sm">Area Based</span>
                <span className="text-[10px] opacity-70">Pay per bigha</span>
             </div>
          </div>
        </div>

        {/* Area Input (Conditional) */}
        {formData.billingScheme === 'area' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Total Area (Bigha)
            </label>
            <div className="relative">
                <input
                    type="number"
                    name="areaBigha"
                    value={formData.areaBigha}
                    onChange={handleChange}
                    className="w-full p-3 pl-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg"
                    placeholder="e.g. 5"
                    min="0.1"
                    step="0.1"
                    required
                />
                <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">Bigha</span>
            </div>
            {/* Live Estimation */}
            {formData.areaBigha && (
                <div className="mt-2 flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg text-gray-600">
                    <span>Estimated Cost:</span>
                    <span className="font-bold text-green-700 text-lg">
                        ₹{(parseFloat(formData.areaBigha) * machine.pricing.rate).toFixed(0)}
                    </span>
                </div>
            )}
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-4">
            <Button
                type="submit"
                variant="primary"
                loading={bookingLoading}
                disabled={bookingLoading}
                className="w-full py-4 text-lg shadow-xl shadow-green-200 rounded-xl"
            >
                Confirm Request
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
                Request will be sent to the owner for approval.
            </p>
        </div>

      </form>
    </div>
  );
};

export default Booking;