import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Wrench, Clock, DollarSign, Plus } from 'lucide-react';
import { serviceRequestAPI, serviceItemAPI, addServiceItemToRequest } from '../services/api';

const PREDEFINED_SERVICES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Brake Pad Replacement',
  'Battery Check',
  'Air Filter Replacement',
  'Engine Diagnostic',
  'Coolant Flush',
  'Spark Plug Replacement',
  'Synthetic Oil',
  'Conventional Oil',
  'Brake Fluid',
  'Wiper Blades',
];

const MechanicDashboard: React.FC = () => {
  const { user } = useAuth();
  const { serviceRequests, updateServiceRequest, vehicles, refreshData } = useService();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('assigned-services');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    type: '',
    partNumber: '',
    warrantyInfo: ''
  });

  const assignedRequests = serviceRequests.filter(req => req.mechanicId === user?.id);

  const handleStatusUpdate = async (requestId: string, status: string) => {
    const response = await serviceRequestAPI.updateStatus(Number(requestId), status);
    console.log('Update status response:', response);
    await refreshData();
    showToast('Service status updated successfully!', 'success');
  };

  const handleAddServiceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !serviceForm.name || serviceForm.price <= 0) {
      showToast('Please fill in all required fields correctly', 'error');
      return;
    }
    try {
      await addServiceItemToRequest(Number(selectedRequestId), serviceForm);
      showToast('Service item added!', 'success');
      setShowServiceModal(false);
      setServiceForm({ name: '', description: '', price: 0, quantity: 1, type: '', partNumber: '', warrantyInfo: '' });
      // Optionally refresh data here if you want to show the new item in a list
    } catch (err: any) {
      showToast(err.message || 'Failed to add service item', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'assigned-services', label: 'Assigned Services', icon: Wrench },
    { id: 'materials-services', label: 'Materials & Services', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mechanic Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Services</p>
                <p className="text-2xl font-bold text-gray-900">{assignedRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedRequests.filter(req => req.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedRequests.filter(req => req.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'assigned-services' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Assigned Service Requests</h2>
            
            {assignedRequests.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned services</h3>
                <p className="text-gray-600">Service requests assigned to you will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.vehicleId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {request.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusUpdate(request.id.toString(), e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials-services' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Materials & Services</h2>
              <button
                onClick={() => setShowServiceModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Add materials and services used for each job. These will be automatically included in the customer's invoice.
              </p>
            </div>

            {assignedRequests.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active services</h3>
                <p className="text-gray-600">You need assigned services to add materials and prices</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{request.serviceType}</h3>
                        <p className="text-sm text-gray-600">{request.vehicleId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedRequestId(request.id.toString());
                          setShowServiceModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add Service/Material
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedRequestId('');
          setServiceForm({ name: '', description: '', price: 0, quantity: 1, type: '', partNumber: '', warrantyInfo: '' });
        }}
        title="Add Service/Material"
        size="md"
      >
        <form onSubmit={handleAddServiceItem} className="space-y-4">
          {!selectedRequestId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Service Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a service request</option>
                {assignedRequests.map((request) => (
                  <option key={request.id} value={request.id.toString()}>
                    {request.serviceType} - {request.vehicleId}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceName">
              Service/Material Name
            </label>
            <select
              id="serviceName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              required
            >
              <option value="" disabled>-- Select a service --</option>
              {PREDEFINED_SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={serviceForm.price || ''}
              onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={serviceForm.quantity || 1}
              onChange={(e) => setServiceForm({ ...serviceForm, quantity: parseInt(e.target.value) || 1 })}
              placeholder="Quantity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              type="text"
              value={serviceForm.type}
              onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
              placeholder="Type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Number
            </label>
            <input
              type="text"
              value={serviceForm.partNumber}
              onChange={(e) => setServiceForm({ ...serviceForm, partNumber: e.target.value })}
              placeholder="Part Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty Info
            </label>
            <input
              type="text"
              value={serviceForm.warrantyInfo}
              onChange={(e) => setServiceForm({ ...serviceForm, warrantyInfo: e.target.value })}
              placeholder="Warranty Info"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowServiceModal(false);
                setSelectedRequestId('');
                setServiceForm({ name: '', description: '', price: 0, quantity: 1, type: '', partNumber: '', warrantyInfo: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MechanicDashboard;