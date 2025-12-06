import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { machineService } from '../../services/machineService';
import MachineForm from '../../components/owner/MachineForm';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MyMachines = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchMyMachines();
  }, [pagination.page]);

  const fetchMyMachines = async () => {
    try {
      setLoading(true);
      const response = await machineService.getMyMachines(pagination.page, pagination.limit);

      if (response.success) {
        setMachines(response.data.machines);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
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
      console.error('Error creating machine:', error);
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
      console.error('Error updating machine:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAvailability = async (machineId, currentAvailability) => {
    try {
      await machineService.toggleAvailability(machineId, !currentAvailability);
      fetchMyMachines();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (window.confirm('Are you sure you want to delete this machine? This action cannot be undone.')) {
      try {
        await machineService.deleteMachine(machineId);
        fetchMyMachines();
      } catch (error) {
        console.error('Error deleting machine:', error);
        alert('Cannot delete machine with active bookings.');
      }
    }
  };

  const openEditForm = (machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMachine(null);
  };

  const getMachineTypeIcon = (type) => {
    const icons = {
      tractor: '🚜',
      harvester: '🌾',
      sprayer: '💦',
      thresher: '⚙️',
      other: '🔧'
    };
    return icons[type] || icons.other;
  };

  if (loading && machines.length === 0) {
    return <Loader text="Loading your machines..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Machines</h1>
          <p className="text-gray-600">Manage your agricultural machinery for rental</p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="mt-4 md:mt-0"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Machine
        </Button>
      </div>

      {/* Machines List */}
      {machines.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🚜</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines added yet</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first machine to make it available for rental.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Your First Machine
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {machines.map(machine => (
            <div key={machine._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* Machine Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Machine Icon */}
                  <div className="text-4xl">
                    {getMachineTypeIcon(machine.type)}
                  </div>

                  {/* Machine Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        machine.availability 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {machine.availability ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 capitalize mb-2">
                      {t(`machine.types.${machine.type}`)} • {machine.model || 'No model specified'}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Pricing:</strong> ₹{machine.pricing.rate}/{machine.pricing.unit} ({machine.pricing.scheme})
                      </div>
                      <div>
                        <strong>Location:</strong> {machine.location?.addressText || 'Not specified'}
                      </div>
                      {machine.meta?.condition && (
                        <div>
                          <strong>Condition:</strong> {machine.meta.condition}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button
                    variant={machine.availability ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleAvailability(machine._id, machine.availability)}
                  >
                    {machine.availability ? (
                      <XMarkIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    )}
                    {machine.availability ? 'Make Unavailable' : 'Make Available'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditForm(machine)}
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMachine(machine._id)}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Machine Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingMachine ? 'Edit Machine' : 'Add New Machine'}
        size="lg"
      >
        <MachineForm
          machine={editingMachine}
          onSubmit={editingMachine ? handleUpdateMachine : handleCreateMachine}
          onCancel={closeForm}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default MyMachines;