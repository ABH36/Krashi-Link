import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { 
  MegaphoneIcon, 
  UserGroupIcon, 
  BellIcon,
  DevicePhoneMobileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Broadcast = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickTitle = (title) => {
    setFormData(prev => ({ ...prev, title }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setToast({ type: 'error', message: "Title and Message are required" });
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.sendBroadcast(formData);

      if (response.success) {
        // ⭐ FIXED SAFE COUNT HANDLING
        const totalCount = response?.data?.count ?? 'all';

        setToast({ 
          type: 'success', 
          message: `📢 Sent to ${totalCount} users!` 
        });

        setFormData({ title: '', message: '', targetRole: 'all' });
      }

    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: "Failed to send broadcast. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MegaphoneIcon className="w-8 h-8 text-blue-600 mr-2" />
          Broadcast Center
        </h1>
        <p className="text-gray-600">Send push notifications to KrishiLink users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Target Audience</label>
                <div className="grid grid-cols-3 gap-4">
                  {['all', 'farmer', 'owner'].map((role) => (
                    <label 
                      key={role}
                      className={`relative border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
                        formData.targetRole === role 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                          : 'hover:bg-gray-50 border-gray-100 text-gray-500'
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
                      <UserGroupIcon className={`w-6 h-6 mb-1 ${formData.targetRole === role ? 'animate-bounce' : ''}`} />
                      <span className="capitalize font-bold text-sm">
                        {role === 'all' ? 'Everyone' : role + 's'}
                      </span>
                      {formData.targetRole === role && (
                         <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-gray-700">Notification Title</label>
                    <span className="text-xs text-gray-400">{formData.title.length}/40</span>
                </div>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="e.g. System Update"
                  className="input-field font-bold text-gray-900"
                  maxLength={40}
                />

                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {['🔧 Maintenance', '🎉 Happy Diwali', '⚠️ Weather Alert', '🚀 New Feature'].map(tag => (
                        <button 
                            key={tag}
                            type="button" 
                            onClick={() => handleQuickTitle(tag)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-gray-700">Message Content</label>
                    <span className={`text-xs font-medium ${formData.message.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
                        {formData.message.length}/200
                    </span>
                </div>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  className="input-field h-32 resize-none leading-relaxed"
                  maxLength={200}
                ></textarea>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-lg shadow-lg shadow-blue-500/30"
                loading={loading}
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Broadcast Now
              </Button>

            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
            <div className="sticky top-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DevicePhoneMobileIcon className="w-5 h-5" /> Live User Preview
                </h3>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:scale-105">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">K</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-600">KrishiLink • Now</span>
                        </div>
                        <BellIcon className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="p-4">
                        {formData.title ? (
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{formData.title}</h4>
                        ) : (
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                        )}
                        
                        {formData.message ? (
                            <p className="text-xs text-gray-600 leading-relaxed">{formData.message}</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-50 rounded w-full animate-pulse"></div>
                                <div className="h-3 bg-gray-50 rounded w-5/6 animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-xl text-xs text-blue-700 space-y-2">
                    <p className="font-bold">💡 Pro Tips:</p>
                    <ul className="list-disc pl-4 space-y-1 opacity-80">
                        <li>Short titles (under 30 chars) get more clicks.</li>
                        <li>Use emojis 🚜 to make it friendly.</li>
                        <li>Avoid capital letters (ALL CAPS).</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Broadcast;
