import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.role);
      
      if (success) {
        showToast('Login successful!', 'success');
        switch (formData.role.toUpperCase()) {
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'MECHANIC':
            navigate('/mechanic-dashboard');
            break;
          case 'USER':
            navigate('/user-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        showToast('Invalid credentials. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: string) => {
    switch (role) {
      case 'admin':
        setFormData({
          email: 'admin@vehicleservice.com',
          password: 'admin123',
          role: 'ADMIN'
        });
        break;
      case 'mechanic':
        setFormData({
          email: 'john@vehicleservice.com',
          password: 'mechanic123',
          role: 'MECHANIC'
        });
        break;
      case 'user':
        setFormData({
          email: 'jane@email.com',
          password: 'user123',
          role: 'USER'
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <LogIn className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* Demo Credentials */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="space-y-2 text-sm">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                >
                  <strong>Admin:</strong> admin@vehicleservice.com / admin123
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('mechanic')}
                  className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                >
                  <strong>Mechanic:</strong> john@vehicleservice.com / mechanic123
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('user')}
                  className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                >
                  <strong>User:</strong> jane@email.com / user123
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MECHANIC">Mechanic</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;