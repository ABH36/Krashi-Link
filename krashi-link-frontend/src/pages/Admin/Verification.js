import React, { useState } from 'react';
import UserTable from '../../components/admin/UserTable';
import Button from '../../components/common/Button';
import { 
  ShieldCheckIcon, 
  ArrowPathIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const Verification = () => {
  // Key change hone par UserTable re-mount (reload) hoga
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
             User Verification (KYC)
           </h1>
           <p className="text-gray-500 text-sm mt-1 ml-10">
             Review documents and approve Farmers/Owners for platform access.
           </p>
        </div>
        
        <Button variant="secondary" onClick={handleRefresh} className="shadow-sm">
            <ArrowPathIcon className="w-5 h-5 mr-2" /> Refresh List
        </Button>
      </div>

      {/* 💡 Quick Tips / Stats Strip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Verification Guidelines:</p>
              <ul className="list-disc pl-4 space-y-1 text-blue-700">
                  <li>Ensure <strong>Aadhar Card</strong> photo matches the profile picture.</li>
                  <li>Check if the document text is readable and not blurry.</li>
                  <li>Reject suspicious or expired documents immediately.</li>
              </ul>
          </div>
      </div>

      {/* 📋 Main Table */}
      {/* Passing 'key' forces the component to reload when refresh button is clicked */}
      <UserTable key={refreshKey} />
    </div>
  );
};

export default Verification;