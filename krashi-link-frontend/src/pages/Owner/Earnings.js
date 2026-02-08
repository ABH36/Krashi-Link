import React from 'react';
import EarningsTile from '../../components/owner/EarningsTile';
import Button from '../../components/common/Button';
import { 
  BanknotesIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const Earnings = () => {
  
  const handleDownloadStatement = () => {
    // Future integration: Call API to generate PDF/CSV
    alert("Statement downloading... (Feature coming soon)");
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header with Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <BanknotesIcon className="w-8 h-8 text-green-600" />
             Earnings & Payouts
           </h1>
           <p className="text-gray-500 text-sm mt-1 ml-10">
             Track your revenue flow and download monthly reports.
           </p>
        </div>
        
        <Button 
            variant="outline" 
            onClick={handleDownloadStatement}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm"
        >
            <DocumentTextIcon className="w-5 h-5" />
            Download Statement
        </Button>
      </div>

      {/* Main Stats & Transactions */}
      {/* EarningsTile already handles the charts and lists internally */}
      <EarningsTile />
    </div>
  );
};

export default Earnings;