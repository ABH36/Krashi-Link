import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';
import { MegaphoneIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Broadcast = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.sendBroadcast(formData);
      if (response.success) {
        setSuccess(response.message);
        setFormData({ title: '', message: '', targetRole: 'all' });
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MegaphoneIcon className="w-8 h-8 text-blue-600 mr-2" />
          Make Announcement
        </h1>
        <p className="text-gray-600">Send push notifications to all users or specific groups.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-green-800 animate-fade-in">
          <CheckCircleIcon className="w-6 h-6 mr-2" />
          {success}
        </div>
      )}

      <div className="card bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <div className="grid grid-cols-3 gap-4">
              {['all', 'farmer', 'owner'].map((role) => (
                <label 
                  key={role}
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${
                    formData.targetRole === role 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="targetRole" 
                    value={role} 
                    checked={formData.targetRole === role} 
                    onChange={handleChange} 
                    className="hidden"
                  />
                  <UserGroupIcon className="w-6 h-6 mb-1" />
                  <span className="capitalize font-medium">
                    {role === 'all' ? 'All Users' : role + 's'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              placeholder="e.g. Server Maintenance, Happy Diwali"
              className="input-field"
              maxLength={50}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange}
              placeholder="Type your announcement here..."
              className="input-field h-32 resize-none"
              maxLength={200}
            ></textarea>
            <p className="text-xs text-gray-500 text-right mt-1">
              {formData.message.length}/200 characters
            </p>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-3 text-lg"
            loading={loading}
          >
            📢 Send Announcement
          </Button>

        </form>
      </div>
    </div>
  );
};

export default Broadcast;