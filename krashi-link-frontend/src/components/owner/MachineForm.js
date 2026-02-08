import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { 
  MapPinIcon, 
  TruckIcon, 
  CurrencyRupeeIcon, 
  PhotoIcon, 
  WrenchScrewdriverIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon // Added for upload UI
} from '@heroicons/react/24/outline';

// --- CUSTOM SELECT (Kept exactly as is) ---
const CustomSelect = ({ name, value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select';

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-3 flex justify-between items-center text-left transition-all hover:bg-white"
      >
        <span className="truncate font-medium">{selectedLabel}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-[fadeIn_0.1s_ease-out]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 hover:bg-green-50 transition-colors ${value === option.value ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MachineForm = ({ machine, onSubmit, onCancel, loading = false }) => {
  const { t } = useTranslation();
  const isEdit = !!machine;
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    type: 'tractor',
    name: '',
    model: '',
    pricing: { scheme: 'time', rate: '', unit: 'hour' },
    location: { lat: '', lng: '', addressText: '' },
    meta: { year: '', condition: 'good', fuelType: 'diesel' },
    description: '' // Added description support
  });

  // ✅ NEW: State for Image Handling
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (machine) {
      setFormData({
        type: machine.type || 'tractor',
        name: machine.name || '',
        model: machine.model || '',
        pricing: machine.pricing || { scheme: 'time', rate: '', unit: 'hour' },
        location: machine.location || { lat: '', lng: '', addressText: '' },
        meta: machine.meta || { year: '', condition: 'good', fuelType: 'diesel' },
        description: machine.description || ''
      });
      
      // Handle existing image for preview
      if (machine.image) {
         setPreviewUrl(machine.image);
      } else if (machine.images && machine.images.length > 0) {
         setPreviewUrl(machine.images[0]);
      }
    }
  }, [machine]);

  // --- 📍 SMART LOCATION DETECTOR (Kept exactly as is) ---
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location");
        setLocating(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Helper for Machine Type Card Selection
  const selectType = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  // ✅ NEW: Image Upload Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setErrors({ name: 'Machine name is required' });
    if (!formData.pricing.rate) return setErrors({ 'pricing.rate': 'Rate is required' });
    // Location validation ko thoda flexible banaya hai (addressText chalega agar lat/lng nahi hai to)
    if (!formData.location.lat && !formData.location.addressText) return setErrors({ location: 'Location is required' });

    // ✅ NEW: Prepare FormData for Image Upload
    const submitData = new FormData();
    
    // Append basic fields
    submitData.append('type', formData.type);
    submitData.append('name', formData.name);
    submitData.append('model', formData.model);
    submitData.append('rate', formData.pricing.rate); // Backend expects flat fields for pricing in FormData logic we added
    submitData.append('unit', formData.pricing.unit);
    submitData.append('scheme', formData.pricing.scheme);
    
    // Location
    submitData.append('addressText', formData.location.addressText);
    // Lat/Lng are optional if user typed address, but good to send if detected
    if(formData.location.lat) submitData.append('lat', formData.location.lat);
    if(formData.location.lng) submitData.append('lng', formData.location.lng);

    // Meta
    submitData.append('condition', formData.meta.condition);
    submitData.append('fuelType', formData.meta.fuelType);
    if(formData.meta.year) submitData.append('year', formData.meta.year);
    
    // Description
    if(formData.description) submitData.append('description', formData.description);

    // Image File
    if (imageFile) {
        submitData.append('image', imageFile);
    }

    onSubmit(submitData);
  };

  // Options
  const typeOptions = [
    { value: 'tractor', label: 'Tractor', icon: '🚜' },
    { value: 'harvester', label: 'Harvester', icon: '🌾' },
    { value: 'sprayer', label: 'Sprayer', icon: '💦' },
    { value: 'thresher', label: 'Thresher', icon: '⚙️' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];
  const schemeOptions = [{ value: 'time', label: 'Per Hour' }, { value: 'area', label: 'Per Bigha' }, { value: 'daily', label: 'Per Day' }];
  const unitOptions = [{ value: 'hour', label: 'Hour' }, { value: 'bigha', label: 'Bigha' }, { value: 'day', label: 'Day' }];
  const conditionOptions = [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }];
  const fuelOptions = [{ value: 'diesel', label: 'Diesel' }, { value: 'petrol', label: 'Petrol' }, { value: 'electric', label: 'Electric' }];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      
      {/* SECTION 1: BASIC INFO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
            <TruckIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-800">Machine Details</h3>
        </div>

        {/* Visual Type Selector */}
        <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Machine Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {typeOptions.map((opt) => (
                    <div 
                        key={opt.value}
                        onClick={() => selectType(opt.value)}
                        className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${
                            formData.type === opt.value 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-100 hover:border-green-200 text-gray-500'
                        }`}
                    >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="text-[10px] font-bold uppercase">{opt.label}</div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Machine Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field font-bold text-gray-900"
              placeholder="e.g. John Deere 5050"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Model / Year</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. 2023 Model"
            />
          </div>
        </div>
        
        {/* Description Field Added */}
        <div className="mt-4">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
             <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                className="input-field h-20"
                placeholder="Any special features or condition details..."
             />
        </div>
      </div>

      {/* SECTION 2: PRICING */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">Pricing & Billing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSelect label="Billing Scheme" name="pricing.scheme" value={formData.pricing.scheme} onChange={handleChange} options={schemeOptions} />
            
            <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Rate (₹) *</label>
                 <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">₹</span>
                    <input
                        type="number"
                        name="pricing.rate"
                        value={formData.pricing.rate}
                        onChange={handleChange}
                        className="input-field pl-8 font-bold text-lg"
                        placeholder="500"
                    />
                 </div>
                 {errors['pricing.rate'] && <p className="text-xs text-red-500 mt-1">{errors['pricing.rate']}</p>}
            </div>

            <CustomSelect label="Per Unit" name="pricing.unit" value={formData.pricing.unit} onChange={handleChange} options={unitOptions} />
        </div>
      </div>

      {/* SECTION 3: LOCATION (SMART) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
            <MapPinIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-800">Current Location</h3>
        </div>
        
        {/* Detect Button */}
        <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-bold py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors active:scale-95"
        >
            {locating ? (
                <span className="animate-spin">⌛</span>
            ) : (
                <MapPinIcon className="w-5 h-5" />
            )}
            {locating ? "Detecting..." : "Auto-Detect My Current Location"}
        </button>

        <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Latitude</label>
                <input type="number" name="location.lat" value={formData.location.lat} onChange={handleChange} className="input-field bg-gray-50 text-xs" readOnly />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Longitude</label>
                <input type="number" name="location.lng" value={formData.location.lng} onChange={handleChange} className="input-field bg-gray-50 text-xs" readOnly />
             </div>
        </div>
        {errors.location && <p className="text-xs text-red-500 mb-2">{errors.location}</p>}

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address / Landmark</label>
            <input type="text" name="location.addressText" value={formData.location.addressText} onChange={handleChange} className="input-field" placeholder="e.g. Near Village Temple" />
        </div>
      </div>

      {/* SECTION 4: IMAGES & META (UPDATED FOR FILE UPLOAD) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
            <PhotoIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800">Photos & Condition</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <CustomSelect label="Condition" name="meta.condition" value={formData.meta.condition} onChange={handleChange} options={conditionOptions} />
             <CustomSelect label="Fuel Type" name="meta.fuelType" value={formData.meta.fuelType} onChange={handleChange} options={fuelOptions} />
        </div>

        {/* ✅ NEW IMAGE UPLOAD UI */}
        <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Machine Photo</label>
            
            {previewUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors bg-gray-50">
                    <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4 pt-4 sticky bottom-4">
        <Button type="submit" variant="primary" loading={loading} disabled={loading} className="flex-1 shadow-xl shadow-green-200">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {isEdit ? 'Update Machine' : 'List Machine Now'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} className="px-6">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MachineForm;