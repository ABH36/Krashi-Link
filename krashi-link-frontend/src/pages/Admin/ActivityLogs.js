import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { 
  ClipboardDocumentListIcon, 
  UserIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemLogs(page);
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

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800';
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-100 text-red-800';
    if (action.includes('UPDATE') || action.includes('VERIFY')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && logs.length === 0) return <Loader text="Loading Logs..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">System Activity Logs</h1>
            <p className="text-gray-600">Track all actions performed on the platform</p>
        </div>
        <Button variant="secondary" onClick={fetchLogs}>Refresh</Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No activity recorded yet.</td>
                </tr>
            ) : (
                logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                                {log.actorId?.name || 'System'}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-6 capitalize">
                            {log.actorId?.role || 'Auto'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {log.entity?.type && (
                            <span className="font-mono text-xs bg-gray-100 px-1 rounded mr-2">
                                {log.entity.type.toUpperCase()}
                            </span>
                        )}
                        {/* Safe check for metadata */}
                        <span className="truncate max-w-xs inline-block align-bottom">
                            {log.metadata ? JSON.stringify(log.metadata) : '-'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {new Date(log.createdAt).toLocaleString()}
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <Button 
            variant="secondary" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
        >
            Previous
        </Button>
        <span className="flex items-center text-gray-600">Page {page} of {totalPages || 1}</span>
        <Button 
            variant="secondary" 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
        >
            Next
        </Button>
      </div>
    </div>
  );
};

export default ActivityLogs;