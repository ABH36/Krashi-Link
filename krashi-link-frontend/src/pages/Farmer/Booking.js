import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

// --- ICONS ---
const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Booking = () => {
  const { t } = useTranslation();
  const { machineId } = useParams();
  const navigate = useNavigate();
  
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedStartAt: '',
    billingScheme: 'time',
    areaBigha: ''
  });

  // --- CUSTOM DROPDOWN STATE ---
  const [isSchemeDropdownOpen, setIsSchemeDropdownOpen] = useState(false);
  const schemeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (schemeDropdownRef.current && !schemeDropdownRef.current.contains(event.target)) {
        setIsSchemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchMachine();
  }, [machineId]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await machineService.getMachineById(machineId);
      if (response.success) {
        setMachine(response.data.machine);
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
        alert('Booking request sent successfully!');
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

  const handleSchemeSelect = (value) => {
    setFormData(prev => ({ ...prev, billingScheme: value }));
    setIsSchemeDropdownOpen(false);
  };

  const schemeOptions = [
    { value: 'time', label: 'Per Hour' },
    { value: 'area', label: 'Per Bigha' },
    { value: 'daily', label: 'Per Day' }
  ];

  const getSelectedSchemeLabel = () => {
    const selected = schemeOptions.find(opt => opt.value === formData.billingScheme);
    return selected ? selected.label : 'Select Scheme';
  };

  if (loading) return <Loader text="Loading machine details..." />;

  if (!machine) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Machine not found</h2>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/farmer/machines')}>
          Back to Machines
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Machine</h1>
        <p className="text-gray-600">Request to book {machine.name}</p>
      </div>

      {/* Machine Info */}
      <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Machine Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div><strong className="text-gray-900 block">Name:</strong> {machine.name}</div>
          <div><strong className="text-gray-900 block">Type:</strong> {machine.type}</div>
          <div><strong className="text-gray-900 block">Rate:</strong> ₹{machine.pricing.rate}/{machine.pricing.unit}</div>
          <div><strong className="text-gray-900 block">Scheme:</strong> {machine.pricing.scheme}</div>
          {machine.ownerId && (
            <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
              <strong className="text-gray-900">Owner:</strong> {machine.ownerId.name} 
              <span className="ml-2 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold">
                Trust: {machine.ownerId.trustScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Booking Information</h2>
        
        {/* --- REQUESTED START TIME (FIXED) --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requested Start Time *
          </label>
          <div className="relative w-full">
            <input
                type="datetime-local"
                name="requestedStartAt"
                value={formData.requestedStartAt}
                onChange={handleChange}
                // min-w-0 and w-full prevents overflow
                className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-700 font-medium appearance-none min-w-0"
                required
                min={new Date().toISOString().slice(0, 16)}
                style={{ colorScheme: 'light' }} // Forces light mode calendar
            />
            {/* Overlay Icon (Pointer events none allows clicking through to input) */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none bg-white">
                <CalendarIcon />
            </div>
          </div>
        </div>

        {/* --- BILLING SCHEME SELECTOR --- */}
        <div ref={schemeDropdownRef} className="relative w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Scheme *
          </label>
          
          <button
            type="button"
            onClick={() => setIsSchemeDropdownOpen(!isSchemeDropdownOpen)}
            className="w-full p-2.5 flex justify-between items-center border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-700 text-left text-sm font-medium"
          >
            <span>{getSelectedSchemeLabel()}</span>
            <div className={`transition-transform duration-200 ${isSchemeDropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon />
            </div>
          </button>

          {isSchemeDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              {schemeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSchemeSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${formData.billingScheme === option.value ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Area Input */}
        {formData.billingScheme === 'area' && (
          <div className="animate-fade-in-down">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (Bigha) *
            </label>
            <input
              type="number"
              name="areaBigha"
              value={formData.areaBigha}
              onChange={handleChange}
              className="input-field w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-700 font-medium"
              placeholder="Enter area in bigha"
              min="0.1"
              step="0.1"
              required
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={bookingLoading}
            disabled={bookingLoading}
            className="flex-1 justify-center py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all active:scale-95"
          >
            Send Booking Request
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/farmer/machines')}
            className="flex-1 justify-center py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Booking;