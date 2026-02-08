import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { 
  ClipboardDocumentListIcon, 
  UserIcon, 
  ClockIcon, 
  ArrowPathIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemLogs(page, searchTerm);
      if (response.success) {
        setLogs(response.data.logs);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- 🎨 VISUAL HELPERS ---
  const getActionStyle = (action) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) 
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShieldCheckIcon };
    if (action.includes('CREATE')) 
      return { bg: 'bg-green-100', text: 'text-green-700', icon: PlusCircleIcon };
    if (action.includes('DELETE') || action.includes('CANCEL')) 
      return { bg: 'bg-red-100', text: 'text-red-700', icon: TrashIcon };
    if (action.includes('UPDATE')) 
      return { bg: 'bg-amber-100', text: 'text-amber-700', icon: PencilSquareIcon };
    
    return { bg: 'bg-gray-100', text: 'text-gray-600', icon: ClipboardDocumentListIcon };
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // --- 🧩 SMART METADATA RENDERER ---
  const renderMetadata = (meta) => {
    if (!meta || Object.keys(meta).length === 0) return <span className="text-gray-400 italic">No details</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(meta).map(([key, value]) => {
          if (key === 'password' || key === 'token') return null; // Security hide
          const displayValue = typeof value === 'object' ? JSON.stringify(value).slice(0, 20) + '...' : String(value);
          
          return (
            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
              <span className="text-gray-500 mr-1">{key}:</span> {displayValue}
            </span>
          );
        })}
      </div>
    );
  };

  // --- 📱 MOBILE TIMELINE ITEM ---
  const TimelineItem = ({ log }) => {
    const style = getActionStyle(log.action);
    const { date, time } = formatDate(log.createdAt);
    const Icon = style.icon;

    return (
      <div className="relative pl-6 py-4 border-l-2 border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors rounded-r-xl pr-2">
        <div className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${style.bg}`}></div>
        
        <div className="flex justify-between items-start mb-1">
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
             {log.action}
           </span>
           <span className="text-[10px] text-gray-400">{date} • {time}</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
           <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
              {log.actorId?.name?.charAt(0) || '?'}
           </div>
           <div>
              <p className="text-sm font-semibold text-gray-900">{log.actorId?.name || 'System'}</p>
              <p className="text-[10px] text-gray-500 capitalize">{log.actorId?.role || 'System'}</p>
           </div>
        </div>

        <div className="mt-3 bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
           {renderMetadata(log.metadata)}
        </div>
      </div>
    );
  };

  if (loading && logs.length === 0) return (
     <div className="flex flex-col items-center justify-center h-64">
        <Loader text="Fetching Activity..." />
     </div>
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <ClipboardDocumentListIcon className="w-6 h-6 text-gray-400" />
             System Logs
           </h1>
           <p className="text-xs text-gray-500">Monitoring platform security & actions</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <button onClick={fetchLogs} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* 💻 DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Metadata (Details)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {logs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No logs found</td></tr>
            ) : logs.map((log) => {
                const style = getActionStyle(log.action);
                const { date, time } = formatDate(log.createdAt);
                
                return (
                <tr key={log._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{time}</div>
                        <div className="text-xs text-gray-400">{date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                {log.actorId?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{log.actorId?.name || 'System'}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="capitalize">{log.actorId?.role || 'Bot'}</span>
                                    {/* Copy ID Button */}
                                    <button onClick={() => handleCopy(log.actorId?._id)} title="Copy ID" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DocumentDuplicateIcon className="w-3 h-3 text-gray-400 hover:text-blue-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full gap-1.5 ${style.bg} ${style.text}`}>
                            <style.icon className="w-3.5 h-3.5" />
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {renderMetadata(log.metadata)}
                    </td>
                </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE TIMELINE VIEW */}
      <div className="md:hidden bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No logs found</p>
        ) : (
            <div className="space-y-0">
                {logs.map(log => <TimelineItem key={log._id} log={log} />)}
            </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
        <button 
           disabled={page === 1} 
           onClick={() => setPage(p => p - 1)}
           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
            Previous
        </button>
        <span className="text-xs font-medium text-gray-500">Page {page} of {totalPages}</span>
        <button 
           disabled={page >= totalPages} 
           onClick={() => setPage(p => p + 1)}
           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
            Next
        </button>
      </div>

      {/* Copied Toast */}
      {copiedId && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-xs shadow-lg animate-bounce">
              Copied to clipboard!
          </div>
      )}
    </div>
  );
};

export default ActivityLogs;