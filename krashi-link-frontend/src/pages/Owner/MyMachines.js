import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import MachineForm from '../../components/owner/MachineForm';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const MyMachines = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMyMachines();
  }, []);

  const fetchMyMachines = async () => {
    try {
      setLoading(true);
      const response = await machineService.getMyMachines(1, 100); 
      if (response.success) setMachines(response.data.machines);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMachine = async (machineData) => {
    try {
      setFormLoading(true);
      const response = await machineService.createMachine(machineData);
      if (response.success) {
        setShowForm(false);
        fetchMyMachines();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMachine = async (machineData) => {
    try {
      setFormLoading(true);
      const response = await machineService.updateMachine(editingMachine._id, machineData);
      if (response.success) {
        setShowForm(false);
        setEditingMachine(null);
        fetchMyMachines();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailability = async (machineId, currentStatus) => {
    setMachines(prev => prev.map(m => m._id === machineId ? { ...m, availability: !currentStatus } : m));
    try {
      await machineService.toggleAvailability(machineId, !currentStatus);
    } catch (error) {
      console.error(error);
      fetchMyMachines(); 
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (window.confirm('Delete this machine? This cannot be undone.')) {
      try {
        await machineService.deleteMachine(machineId);
        setMachines(prev => prev.filter(m => m._id !== machineId));
      } catch (error) {
        alert('Cannot delete machine with active bookings.');
      }
    }
  };

  const openEditForm = (machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  if (loading) return <Loader text="Loading Inventory..." />;

  // --- 🎨 UPDATED MACHINE CARD COMPONENT ---
  const MachineCard = ({ machine }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
        
        {/* ✅ FEATURE: Show Image if available, else Emoji */}
        <div className={`h-40 flex items-center justify-center relative overflow-hidden ${machine.availability ? 'bg-gray-50' : 'bg-gray-100'}`}>
            {machine.image ? (
                <img 
                   src={machine.image} 
                   alt={machine.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <span className="text-6xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
                    {machine.type === 'tractor' ? '🚜' : machine.type === 'harvester' ? '🌾' : '⚙️'}
                </span>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md ${
                    machine.availability ? 'bg-green-100/90 text-green-700 border-green-200' : 'bg-red-100/90 text-red-700 border-red-200'
                }`}>
                    {machine.availability ? 'Active' : 'Offline'}
                </span>
            </div>
        </div>

        {/* Content */}
        <div className="p-5">
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 truncate">{machine.name}</h3>
            <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-4">{machine.type}</p>

            <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                    <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-900">₹{machine.pricing?.rate}</span>
                    <span className="text-gray-400 text-xs ml-1">/ {machine.pricing?.unit}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{machine.location?.addressText || 'Location not set'}</span>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={machine.availability}
                            onChange={() => handleToggleAvailability(machine._id, machine.availability)} 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${machine.availability ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${machine.availability ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-600">
                        {machine.availability ? 'On' : 'Off'}
                    </span>
                </label>

                <div className="flex gap-2">
                    <button 
                        onClick={() => openEditForm(machine)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleDeleteMachine(machine._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">My Inventory</h1>
           <p className="text-gray-500 text-sm mt-1">Manage availability and pricing of your machines.</p>
        </div>
        <Button 
            onClick={() => { setEditingMachine(null); setShowForm(true); }} 
            className="shadow-lg shadow-blue-200"
        >
            <PlusIcon className="w-5 h-5 mr-2" /> Add Machine
        </Button>
      </div>

      {/* Grid Layout */}
      {machines.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-6xl mb-4 opacity-30">🚜</div>
            <h3 className="text-lg font-bold text-gray-900">Empty Garage</h3>
            <p className="text-gray-500 mb-6">Add your first machine to start getting bookings.</p>
            <Button onClick={() => setShowForm(true)}>Add Machine Now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map(machine => (
                <MachineCard key={machine._id} machine={machine} />
            ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingMachine ? `Edit ${editingMachine.name}` : 'Add New Machine'}
      >
        <MachineForm
          machine={editingMachine}
          onSubmit={editingMachine ? handleUpdateMachine : handleCreateMachine}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default MyMachines;