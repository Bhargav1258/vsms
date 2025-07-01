import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Calendar, Car, CreditCard, FileText, Plus, Eye } from 'lucide-react';
import { vehiclesAPI } from '../services/api';
import { Vehicle } from '../types/index';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { serviceRequests, invoices, addServiceRequest, clearAllData } = useService();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('book-service');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    vehicleId: 1, // Default vehicle ID
    serviceType: '',
    preferredDate: '',
    description: '',
    priority: 'MEDIUM'
  });
  const [vehicleForm, setVehicleForm] = useState<{
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    vinNumber?: string;
    mileage?: string;
  }>({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    vinNumber: "",
    mileage: "",
  });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch vehicles for the user
  const fetchVehicles = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await vehiclesAPI.getByUserId(user.id);
      let vehiclesData: Vehicle[] = [];
      if (res.success && res.data) {
        vehiclesData = res.data;
      } else if (Array.isArray(res.data)) {
        vehiclesData = res.data;
      } else if (Array.isArray(res)) {
        vehiclesData = res;
      }
      setVehicles(vehiclesData);
      setUserVehicles(vehiclesData); // <-- Ensure userVehicles is always set
      // If bookingForm.vehicleId is not set or the vehicle was removed, default to first vehicle
      if (
        vehiclesData.length > 0 &&
        (!bookingForm.vehicleId || !vehiclesData.some(v => v.id === bookingForm.vehicleId))
      ) {
        setBookingForm(form => ({ ...form, vehicleId: vehiclesData[0].id }));
      }
    } catch (err) {
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleForm({ ...vehicleForm, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!user?.id) {
      setError("User not found.");
      return;
    }
    const { make, model, year, licensePlate, vinNumber, mileage } = vehicleForm;
    if (!make || !model || !year || !licensePlate) {
      setError("Make, Model, Year, and License Plate are required.");
      return;
    }
    const yearInt = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearInt) || yearInt < 1900 || yearInt > currentYear + 1) {
      setError("Enter a valid year.");
      return;
    }
    const payload: any = { make, model, year: yearInt, licensePlate };
    if (vinNumber && vinNumber.trim()) payload.vinNumber = vinNumber.trim();
    if (mileage && mileage.trim()) {
      const mileageInt = parseInt(mileage, 10);
      if (!isNaN(mileageInt) && mileageInt > 0) {
        payload.mileage = mileageInt;
      }
    }
    setLoading(true);
    try {
      console.log('Adding vehicle with payload:', payload);
      console.log('User ID:', user.id);
      const response = await vehiclesAPI.create(user.id, payload);
      console.log('Vehicle API response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);
      console.log('Response message:', response.message);
      
      if (response.success && response.data) {
        console.log('Success case - vehicle added');
        showToast('Vehicle added successfully!', 'success');
        setVehicleForm({
          make: "",
          model: "",
          year: "",
          licensePlate: "",
          vinNumber: "",
          mileage: "",
        });
        console.log('Calling fetchVehicles...');
        await fetchVehicles();
      } else if (response.data && !response.success) {
        // Handle case where backend returns data but success is false
        console.log('Data case - vehicle added');
        showToast('Vehicle added successfully!', 'success');
        setVehicleForm({
          make: "",
          model: "",
          year: "",
          licensePlate: "",
          vinNumber: "",
          mileage: "",
        });
        console.log('Calling fetchVehicles...');
        await fetchVehicles();
      } else {
        const errorMessage = response.error || response.message || "Failed to add vehicle. Please try again.";
        console.log('Error case:', errorMessage);
        setError(errorMessage);
        console.error('Vehicle API error:', response);
      }
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError("Failed to add vehicle. Please check your input or try again.");
    } finally {
      setLoading(false);
    }
  };

  const userRequests = serviceRequests.filter(req => req.vehicleId && userVehicles.some(v => v.id === req.vehicleId));
  const userInvoices = invoices.filter(inv => 
    userRequests.some(req => req.id === inv.serviceRequestId)
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting service request:', bookingForm);
      
      await addServiceRequest({
        vehicleId: bookingForm.vehicleId,
      serviceType: bookingForm.serviceType,
      preferredDate: bookingForm.preferredDate,
      description: bookingForm.description,
        priority: bookingForm.priority,
        status: 'PENDING', // Default status
    });

    showToast('Service request submitted successfully!', 'success');
    setShowBookingModal(false);
    setBookingForm({
        vehicleId: 1,
      serviceType: '',
      preferredDate: '',
        description: '',
        priority: 'MEDIUM'
    });
    } catch (error) {
      console.error('Error submitting service request:', error);
      showToast('Failed to submit service request. Please try again.', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  const handleDebugGetAll = async () => {
    try {
      console.log('Testing getAll vehicles endpoint...');
      const response = await vehiclesAPI.getAll();
      console.log('GetAll response:', response);
      
      if (response.success && response.data) {
        console.log('Total vehicles in database:', response.data.length);
        response.data.forEach((vehicle, index) => {
          // Only access vehicle.user if it exists
          const userName = (vehicle as any).user?.name || 'Unknown';
          console.log(`${index + 1}. ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}) - User: ${userName}`);
        });
        showToast(`Found ${response.data.length} vehicles in database`, 'success');
      } else {
        console.log('GetAll failed:', response.error || response.message);
        showToast('GetAll failed: ' + (response.error || response.message), 'error');
      }
    } catch (error) {
      console.error('Error testing getAll:', error);
      showToast('Error testing getAll: ' + (error instanceof Error ? error.message : String(error)), 'error');
    }
  };

  const tabs = [
    { id: 'book-service', label: 'Book Service', icon: Calendar },
    { id: 'service-status', label: 'Service Status', icon: Car },
    { id: 'invoices', label: 'Invoice & Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Add Vehicle Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add a Vehicle</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <input 
                  name="make" 
                  value={vehicleForm.make} 
                  onChange={handleChange} 
                  placeholder="e.g., Toyota" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input 
                  name="model" 
                  value={vehicleForm.model} 
                  onChange={handleChange} 
                  placeholder="e.g., Camry" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input 
                  name="year" 
                  value={vehicleForm.year} 
                  onChange={handleChange} 
                  placeholder="e.g., 2020" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                <input 
                  name="licensePlate" 
                  value={vehicleForm.licensePlate} 
                  onChange={handleChange} 
                  placeholder="e.g., ABC123" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number</label>
                <input 
                  name="vinNumber" 
                  value={vehicleForm.vinNumber} 
                  onChange={handleChange} 
                  placeholder="e.g., 1HGBH41JXMN109186" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                <input 
                  name="mileage" 
                  value={vehicleForm.mileage} 
                  onChange={handleChange} 
                  placeholder="e.g., 50000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
          {/* List user's vehicles */}
          {loading ? (
            <div className="mt-6 text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading vehicles...</p>
            </div>
          ) : (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Your Vehicles ({vehicles.length})</h3>
              {vehicles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No vehicles found. Add your first vehicle above.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {vehicles.map((v: Vehicle) => (
                    <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{v.year} {v.make} {v.model}</h4>
                          <p className="text-sm text-gray-600">License: {v.licensePlate}</p>
                          {v.mileage && <p className="text-sm text-gray-500">{v.mileage.toLocaleString()} miles</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Controls */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Controls</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleClearData}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Clear All Data
            </button>
            <button
              onClick={handleDebugGetAll}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Test GetAll
            </button>
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
        {activeTab === 'book-service' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Book a Service</h2>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Service Request</span>
              </button>
            </div>

            {userRequests.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
                <p className="text-gray-600 mb-4">Book your first service to get started</p>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Service
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {userRequests.slice(-3).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{request.serviceType}</h3>
                        <p className="text-sm text-gray-500">Preferred: {new Date(request.preferredDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Priority: {request.priority}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                        {request.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'service-status' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Service Status</h2>
            
            {userRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests</h3>
                <p className="text-gray-600">Your service history will appear here</p>
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
                        Mechanic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userVehicles.find(v => v.id === request.vehicleId)?.make} {userVehicles.find(v => v.id === request.vehicleId)?.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.mechanicName || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                            {request.status.toLowerCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Invoices & Payments</h2>
            
            {userInvoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-600">Invoices for completed services will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userInvoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Invoice #{invoice.id}</h3>
                        <p className="text-sm text-gray-600">Amount: ${invoice.amount}</p>
                        <p className="text-sm text-gray-500">Status: {invoice.status}</p>
                      </div>
                          <Link
                            to={`/payment/${invoice.id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Service Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
          title="Book a Service"
        size="lg"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vehicle
            </label>
              <select
                value={bookingForm.vehicleId}
                onChange={(e) => setBookingForm({ ...bookingForm, vehicleId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
                >
                {userVehicles.length === 0 ? (
                  <option value="">No vehicles found. Please add a vehicle first.</option>
                ) : (
                  userVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))
                )}
              </select>
          </div>

          {/* Show selected vehicle details */}
          {bookingForm.vehicleId && (
            <div className="p-3 my-2 bg-gray-100 rounded">
              {(() => {
                const v = userVehicles.find(v => v.id === bookingForm.vehicleId);
                return v ? (
                  <div>
                    <strong>Selected Vehicle:</strong><br />
                    {v.year} {v.make} {v.model} <br />
                    License Plate: {v.licensePlate}
                    {v.mileage && <><br />Mileage: {v.mileage.toLocaleString()} miles</>}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={bookingForm.serviceType}
              onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Service Type</option>
                <option value="OIL_CHANGE">Oil Change</option>
                <option value="BRAKE_SERVICE">Brake Service</option>
                <option value="ENGINE_REPAIR">Engine Repair</option>
                <option value="TRANSMISSION_SERVICE">Transmission Service</option>
                <option value="ELECTRICAL_SYSTEM">Electrical System</option>
                <option value="AC_SERVICE">AC Service</option>
                <option value="GENERAL_MAINTENANCE">General Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={bookingForm.priority}
                onChange={(e) => setBookingForm({ ...bookingForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <input
                type="datetime-local"
              value={bookingForm.preferredDate}
              onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={bookingForm.description}
              onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                placeholder="Describe the issue or service needed..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Service
            </button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default UserDashboard;