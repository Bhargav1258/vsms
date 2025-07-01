import React, { useState, useEffect } from 'react';
import { useService } from '../context/ServiceContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Users, UserCheck, FileText, Plus, DollarSign } from 'lucide-react';
import { ServiceRequest, Mechanic, Invoice } from '../types';
import { serviceRequestAPI } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { 
    serviceRequests, 
    mechanics, 
    invoices, 
    loading,
    vehicles,
    addServiceRequest, 
    updateServiceRequest, 
    deleteServiceRequest,
    addMechanic,
    refreshData,
    clearAllData,
    addInvoice
  } = useService();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('mechanic-registration');
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [newMechanic, setNewMechanic] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [newServiceRequest, setNewServiceRequest] = useState({
    customerName: '',
    vehicleNumber: '',
    serviceType: '',
    description: '',
    status: 'PENDING'
  });
  const [newInvoice, setNewInvoice] = useState({
    serviceRequestId: 0,
    amount: 0,
    status: 'PENDING'
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);
  const [editMechanic, setEditMechanic] = useState<string>('');

  useEffect(() => {
    refreshData();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Mechanics data:', mechanics);
    console.log('Mechanics length:', mechanics.length);
    console.log('Mechanics IDs:', mechanics.map(m => m.id));
  }, [mechanics]);

  // Additional debugging for state changes
  useEffect(() => {
    console.log('AdminDashboard re-rendered with mechanics:', mechanics.length);
  });

  useEffect(() => {
    console.log('AdminDashboard vehicles:', vehicles);
    console.log('AdminDashboard serviceRequests:', serviceRequests);
  }, [vehicles, serviceRequests]);

  const handleMechanicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!newMechanic.name || !newMechanic.email || !newMechanic.password || !newMechanic.phone || !newMechanic.address) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      console.log('Adding mechanic:', newMechanic);
      console.log('Current mechanics count before:', mechanics.length);
      
      // Submit the mechanic registration using the auth endpoint
      await addMechanic({
        name: newMechanic.name,
        email: newMechanic.email,
        password: newMechanic.password,
        phone: newMechanic.phone,
        address: newMechanic.address,
        role: 'MECHANIC'
      });
      
      console.log('Mechanic added successfully');
      console.log('Current mechanics count after:', mechanics.length);
      
        // Clear form
        setNewMechanic({
          name: '',
          email: '',
          password: '',
          phone: '',
        address: ''
        });
        
      // Close modal
      setShowMechanicModal(false);
        
        // Show success message
      showToast('Mechanic registered successfully! The list will update automatically.', 'success');
      
      // Force refresh to ensure the list is updated
      setTimeout(() => {
        refreshData();
      }, 500);
        
    } catch (error: any) {
      console.error('Error submitting mechanic form:', error);
      showToast(error.message || 'Failed to register mechanic. Please try again.', 'error');
    }
  };

  const handleServiceRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!newServiceRequest.customerName || !newServiceRequest.vehicleNumber || !newServiceRequest.serviceType || !newServiceRequest.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('Submitting service request:', newServiceRequest);
      
      const success = await addServiceRequest(newServiceRequest);
      
      if (success) {
        // Clear form
        setNewServiceRequest({
          customerName: '',
          vehicleNumber: '',
          serviceType: '',
          description: '',
          status: 'PENDING'
        });
        
        // Show success message
        alert('Service request submitted successfully!');
        
        // Refresh the service requests list
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error submitting service request:', error);
      alert(error.message || 'Failed to submit service request. Please try again.');
    }
  };

  const handleUpdateServiceRequest = async (id: number, status: string) => {
    try {
      console.log(`Updating service request ${id} status to ${status}`);
      
      const success = await updateServiceRequest(id, { status });
      
      if (success) {
        // Show success message
        alert('Service request updated successfully!');
        
        // Refresh the service requests list
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error updating service request:', error);
      alert(error.message || 'Failed to update service request. Please try again.');
    }
  };

  const handleDeleteServiceRequest = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) {
      return;
    }

    try {
      console.log(`Deleting service request ${id}`);
      
      const success = await deleteServiceRequest(id);
      
      if (success) {
        // Show success message
        alert('Service request deleted successfully!');
        
        // Refresh the service requests list
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error deleting service request:', error);
      alert(error.message || 'Failed to delete service request. Please try again.');
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInvoice(newInvoice);
      setNewInvoice({
        serviceRequestId: 0,
        amount: 0,
        status: 'PENDING'
      });
    } catch (error) {
      console.error('Error adding invoice:', error);
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
    { id: 'mechanic-registration', label: 'Mechanic Registration', icon: Users },
    { id: 'assign-mechanic', label: 'Assign Mechanic', icon: UserCheck },
    { id: 'invoice-management', label: 'Invoice Management', icon: FileText }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage mechanics, service requests, and invoices</p>
          
          {/* Debug Controls */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Controls</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    clearAllData();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  console.log('Current mechanics:', mechanics);
                  console.log('Current service requests:', serviceRequests);
                  console.log('Current invoices:', invoices);
                }}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Log Data
              </button>
              <button
                onClick={() => {
                  console.log('Testing mechanic registration...');
                  const testMechanic = {
                    name: 'Test Mechanic',
                    email: 'test.mechanic@example.com',
                    password: 'test123',
                    phone: '+1-555-9999',
                    address: 'Test Address',
                    role: 'MECHANIC' as const
                  };
                  addMechanic(testMechanic);
                }}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Test Add Mechanic
              </button>
              <button
                onClick={() => {
                  console.log('Direct state test - adding mechanic directly');
                  const testMechanic = {
                    id: Date.now(),
                    name: 'Direct Test Mechanic',
                    email: 'direct.test@example.com',
                    phone: '+1-555-8888',
                    address: 'Direct Test Address',
                    role: 'MECHANIC' as const,
                    vehicles: []
                  };
                  // This should trigger a re-render
                  console.log('Adding mechanic directly to state');
                }}
                className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
              >
                Direct State Test
              </button>
              <button
                onClick={() => {
                  console.log('Current mechanics state:', mechanics);
                  console.log('localStorage mechanics:', localStorage.getItem('mechanics'));
                  // Force a state update to trigger re-render
                  const storedMechanics = localStorage.getItem('mechanics');
                  if (storedMechanics) {
                    const parsedMechanics = JSON.parse(storedMechanics);
                    console.log('Parsed mechanics from localStorage:', parsedMechanics);
                    // This should force a re-render if the state is out of sync
                    window.location.reload();
                  }
                }}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Debug State
              </button>
              <button
                onClick={() => {
                  console.log('Manual refresh - Current mechanics:', mechanics);
                  console.log('localStorage mechanics:', localStorage.getItem('mechanics'));
                  refreshData();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('mechanics');
                  console.log('Cleared localStorage mechanics');
                  showToast('Local data cleared', 'info');
                  refreshData();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Data
              </button>
              <button
                onClick={() => {
                  console.log('Force refresh mechanics only');
                  const storedMechanics = localStorage.getItem('mechanics');
                  console.log('Stored mechanics:', storedMechanics);
                  if (storedMechanics) {
                    const parsedMechanics = JSON.parse(storedMechanics);
                    console.log('Parsed mechanics:', parsedMechanics);
                    // Force update the mechanics state
                    window.location.reload();
                  }
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Force Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{serviceRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mechanics</p>
                <p className="text-2xl font-bold text-gray-900">{mechanics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserCheck className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
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
        {activeTab === 'mechanic-registration' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Registered Mechanics</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Manual refresh - Current mechanics:', mechanics);
                    console.log('localStorage mechanics:', localStorage.getItem('mechanics'));
                    refreshData();
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('mechanics');
                    console.log('Cleared localStorage mechanics');
                    showToast('Local data cleared', 'info');
                    refreshData();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Data
                </button>
              <button
                onClick={() => setShowMechanicModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Mechanic</span>
              </button>
              </div>
            </div>

              {mechanics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mechanics.map((mechanic) => (
                    <tr key={mechanic.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mechanic.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mechanic.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mechanic.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mechanic.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No mechanics registered yet.</p>
              )}
          </div>
        )}

        {activeTab === 'assign-mechanic' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Assign Mechanics to Service Requests</h2>
            
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Mechanic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {String(request.vehicleId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.mechanicName || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                updateServiceRequest(request.id, { status: 'assigned', mechanicName: e.target.value });
                                e.target.value = '';
                              }
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                            defaultValue=""
                          >
                            <option value="">Assign Mechanic</option>
                            {mechanics.map((mechanic) => (
                              <option key={mechanic.id} value={mechanic.name}>
                                {mechanic.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                          onClick={() => {
                            setEditRequest(request);
                            setEditMechanic(request.mechanicName || '');
                            setEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="ml-2 px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
                          onClick={() => handleDeleteServiceRequest(request.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoice-management' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Invoice Management</h2>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Invoice</span>
              </button>
            </div>

            <div className="grid gap-4">
              {Array.isArray(invoices) && invoices.length > 0 ? (
                invoices.map((invoice) => {
                  if (!invoice || typeof invoice !== 'object') return null;
                  const request = Array.isArray(serviceRequests)
                    ? serviceRequests.find(req => req && req.id === invoice.serviceRequestId)
                    : undefined;
                return (
                    <div key={invoice.id || Math.random()} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="font-medium">Invoice #{invoice.id ? String(invoice.id).slice(-6) : 'N/A'}</h3>
                          <p className="text-sm text-gray-600">{request?.serviceType || 'Unknown Service'}</p>
                          <p className="text-sm text-gray-500">Vehicle: {request?.vehicleDetails || 'Unknown Vehicle'}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-lg font-bold">${typeof invoice.amount === 'number' ? invoice.amount : '0.00'}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {invoice.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Services:</h4>
                      <ul className="space-y-1">
                          {Array.isArray(invoice.services) && invoice.services.length > 0 ? (
                            invoice.services.map((service, index) => (
                          <li key={index} className="flex justify-between text-sm">
                                <span>{service?.name || 'Unnamed Service'}</span>
                                <span>${typeof service?.cost === 'number' ? service.cost : '0.00'}</span>
                          </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No services listed</li>
                          )}
                      </ul>
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="text-gray-500">No invoices available.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mechanic Registration Modal */}
      <Modal
        isOpen={showMechanicModal}
        onClose={() => setShowMechanicModal(false)}
        title="Register New Mechanic"
        size="lg"
      >
        <form onSubmit={handleMechanicSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={newMechanic.name}
                onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newMechanic.email}
                onChange={(e) => setNewMechanic({ ...newMechanic, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={newMechanic.phone}
                onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={newMechanic.address}
                onChange={(e) => setNewMechanic({ ...newMechanic, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
              </label>
              <input
                type="password"
                value={newMechanic.password}
                onChange={(e) => setNewMechanic({ ...newMechanic, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowMechanicModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register Mechanic
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Creation Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Create Invoice"
        size="lg"
      >
        <form onSubmit={handleInvoiceSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Request
            </label>
            <select
              value={newInvoice.serviceRequestId}
              onChange={(e) => setNewInvoice({ ...newInvoice, serviceRequestId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Service Request</option>
              {serviceRequests
                .filter(req => !invoices.some(inv => inv.serviceRequestId === req.id))
                .map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.serviceType} - {request.vehicleDetails}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services & Costs
            </label>
            {Array.isArray(serviceRequests) &&
              serviceRequests.find(req => req.id === newInvoice.serviceRequestId) &&
              Array.isArray(serviceRequests.find(req => req.id === newInvoice.serviceRequestId)?.services) ?
              serviceRequests.find(req => req.id === newInvoice.serviceRequestId)?.services.map((service, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Service name"
                  value={service.name}
                  onChange={(e) => {
                    const updatedServices = serviceRequests.find(req => req.id === newInvoice.serviceRequestId)?.services.map((s, i) =>
                      i === index ? { ...s, name: e.target.value } : s
                    ) || [];
                    updateServiceRequest(newInvoice.serviceRequestId, { services: updatedServices });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={service.cost || ''}
                  onChange={(e) => {
                    const updatedServices = serviceRequests.find(req => req.id === newInvoice.serviceRequestId)?.services.map((s, i) =>
                      i === index ? { ...s, cost: parseFloat(e.target.value) || 0 } : s
                    ) || [];
                    updateServiceRequest(newInvoice.serviceRequestId, { services: updatedServices });
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              )) : (
                <div className="text-gray-500">No services available for this request.</div>
              )}
          </div>

          <div className="border-t pt-4">
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total: ${serviceRequests.find(req => req.id === newInvoice.serviceRequestId)?.services.reduce((sum, service) => sum + (service.cost || 0), 0) || 0}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {editModalOpen && editRequest && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Service Request"
        >
          <div className="mb-2"><b>Service Type:</b> {editRequest.serviceType}</div>
          <div className="mb-2"><b>Description:</b> {editRequest.description}</div>
          <div className="mb-2"><b>Status:</b> {editRequest.status}</div>
          <div className="mb-2"><b>Vehicle ID:</b> {editRequest.vehicleId}</div>
          <div className="mb-2"><b>Assigned Mechanic:</b> {editRequest.mechanicName || 'Not assigned'}</div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Assign Mechanic</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 w-full"
              value={editMechanic}
              onChange={e => setEditMechanic(e.target.value)}
            >
              <option value="">Select Mechanic</option>
              {mechanics.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-gray-300 rounded mr-2"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={async () => {
                if (editRequest && editMechanic) {
                  await serviceRequestAPI.assignMechanic(editRequest.id, Number(editMechanic));
                  await refreshData();
                  setEditModalOpen(false);
                  setEditRequest(null);
                  setEditMechanic('');
                }
              }}
              disabled={!editMechanic}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;