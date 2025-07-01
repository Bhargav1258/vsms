import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Car, Users, Wrench, CreditCard, ArrowRight, Shield, Clock, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Vehicle Service Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Complete solution for managing vehicle services, mechanics, and customer relationships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Service Management System?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your vehicle service operations with our comprehensive management platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Multi-Role Management</h3>
              <p className="text-gray-600">
                Separate dashboards for users, mechanics, and administrators with role-based access control
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Wrench className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Service Tracking</h3>
              <p className="text-gray-600">
                Track service requests from booking to completion with real-time status updates
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Invoice Management</h3>
              <p className="text-gray-600">
                Automated invoice generation and payment tracking for seamless transactions
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-gray-600">Expert Mechanics</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600">Services Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">4.8</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Built for Modern Vehicle Service Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold mb-1">Secure & Reliable</h4>
                    <p className="text-gray-600">Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-green-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold mb-1">Real-time Updates</h4>
                    <p className="text-gray-600">Stay informed with instant notifications and status updates</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold mb-1">Premium Experience</h4>
                    <p className="text-gray-600">Intuitive interface designed for optimal user experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <Car className="h-32 w-32 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-center mb-2">Ready to Get Started?</h4>
              <p className="text-gray-600 text-center mb-6">
                Join thousands of satisfied customers who trust us with their vehicle service needs
              </p>
              <Link
                to="/register"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Vehicle Service MS</span>
            </div>
            <div className="text-gray-400">
              © 2024 Vehicle Service Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;