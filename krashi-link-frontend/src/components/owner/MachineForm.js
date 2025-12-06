import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

// --- ICONS (SVG) ---
const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

// --- REUSABLE CUSTOM SELECT COMPONENT ---
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
    // Mimic event object structure for parent handler
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-2.5 flex justify-between items-center text-left h-[46px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-green-50 transition-colors ${value === option.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'}`}
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

  const [formData, setFormData] = useState({
    type: 'tractor',
    name: '',
    model: '',
    pricing: {
      scheme: 'time',
      rate: '',
      unit: 'hour'
    },
    location: {
      lat: '',
      lng: '',
      addressText: ''
    },
    images: [],
    meta: {
      year: '',
      condition: 'good',
      fuelType: 'diesel'
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (machine) {
      setFormData({
        type: machine.type,
        name: machine.name,
        model: machine.model || '',
        pricing: machine.pricing,
        location: machine.location,
        images: machine.images || [],
        meta: machine.meta || {}
      });
    }
  }, [machine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Machine name is required';
    if (!formData.pricing.rate || formData.pricing.rate <= 0) newErrors['pricing.rate'] = 'Rate must be > 0';
    if (!formData.location.lat || !formData.location.lng) newErrors.location = 'Location required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      pricing: { ...formData.pricing, rate: parseFloat(formData.pricing.rate) },
      location: { ...formData.location, lat: parseFloat(formData.location.lat), lng: parseFloat(formData.location.lng) },
      images: formData.images.filter(img => img.trim() !== ''),
      meta: { ...formData.meta, year: formData.meta.year ? parseInt(formData.meta.year) : undefined }
    };
    onSubmit(submitData);
  };

  // --- OPTIONS ARRAYS ---
  const typeOptions = [
      { value: 'tractor', label: 'Tractor' },
      { value: 'harvester', label: 'Harvester' },
      { value: 'sprayer', label: 'Sprayer' },
      { value: 'thresher', label: 'Thresher' },
      { value: 'other', label: 'Other' }
  ];

  const schemeOptions = [
      { value: 'time', label: 'Per Hour' },
      { value: 'area', label: 'Per Bigha' },
      { value: 'daily', label: 'Per Day' }
  ];

  const unitOptions = [
      { value: 'hour', label: 'Hour' },
      { value: 'bigha', label: 'Bigha' },
      { value: 'day', label: 'Day' }
  ];

  const conditionOptions = [
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
  ];

  const fuelOptions = [
      { value: 'diesel', label: 'Diesel' },
      { value: 'petrol', label: 'Petrol' },
      { value: 'electric', label: 'Electric' },
      { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Machine Type (Fixed) */}
        <div>
          <CustomSelect 
            label="Machine Type *"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
          />
        </div>

        {/* Machine Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., John Deere 5050"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Model (Optional)</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g., 2023 Model"
        />
      </div>

      {/* Pricing Section (Fixed Selects) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <CustomSelect 
            label="Pricing Scheme *"
            name="pricing.scheme"
            value={formData.pricing.scheme}
            onChange={handleChange}
            options={schemeOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹) *</label>
          <input
            type="number"
            name="pricing.rate"
            value={formData.pricing.rate}
            onChange={handleChange}
            className="input-field"
            placeholder="500"
            min="0"
            step="0.01"
            required
          />
          {errors['pricing.rate'] && <p className="mt-1 text-sm text-red-600">{errors['pricing.rate']}</p>}
        </div>

        <div>
          <CustomSelect 
            label="Unit *"
            name="pricing.unit"
            value={formData.pricing.unit}
            onChange={handleChange}
            options={unitOptions}
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
          <input
            type="number"
            name="location.lat"
            value={formData.location.lat}
            onChange={handleChange}
            className="input-field"
            placeholder="28.6139"
            step="any"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
          <input
            type="number"
            name="location.lng"
            value={formData.location.lng}
            onChange={handleChange}
            className="input-field"
            placeholder="77.2090"
            step="any"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address Description</label>
        <input
          type="text"
          name="location.addressText"
          value={formData.location.addressText}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g., Near village temple, Main road"
        />
      </div>

      {/* Machine Details (Fixed Selects) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mfg Year</label>
          <input
            type="number"
            name="meta.year"
            value={formData.meta.year}
            onChange={handleChange}
            className="input-field"
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <CustomSelect 
            label="Condition"
            name="meta.condition"
            value={formData.meta.condition}
            onChange={handleChange}
            options={conditionOptions}
          />
        </div>

        <div>
          <CustomSelect 
            label="Fuel Type"
            name="meta.fuelType"
            value={formData.meta.fuelType}
            onChange={handleChange}
            options={fuelOptions}
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (Optional)</label>
        <div className="space-y-2">
          {formData.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleArrayChange(index, e.target.value)}
                className="input-field flex-1"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Add Image URL
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {isEdit ? 'Update Machine' : 'Add Machine'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MachineForm;