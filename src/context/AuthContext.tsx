import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  vehicleDetails?: string;
  password: string;
  address: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data for fallback
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@vehicleservice.com',
    role: 'ADMIN',
    phone: '',
    address: '',
    vehicles: []
  },
  {
    id: 2,
    name: 'John Mechanic',
    email: 'john@vehicleservice.com',
    role: 'MECHANIC',
    phone: '',
    address: '',
    vehicles: []
  },
  {
    id: 3,
    name: 'Jane User',
    email: 'jane@email.com',
    role: 'USER',
    phone: '+1234567890',
    address: '',
    vehicles: []
  }
];

// Mock credentials for fallback
const mockCredentials = [
  { email: 'admin@vehicleservice.com', password: 'admin123', role: 'ADMIN' },
  { email: 'john@vehicleservice.com', password: 'mechanic123', role: 'MECHANIC' },
  { email: 'jane@email.com', password: 'user123', role: 'USER' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Try to get current user from API
          const response = await authAPI.getCurrentUser();
          
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // API failed, check localStorage fallback
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          // API not available, use localStorage fallback
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try API login first
      const response = await authAPI.login({ email, password, role: role.toUpperCase() });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);
        showToast('Login successful!', 'success');
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.log('API login failed, trying mock authentication...');
    }

    // Fallback to mock authentication
    try {
      const credential = mockCredentials.find(
        (cred) => cred.email === email && cred.password === password && cred.role === role.toUpperCase()
      );

      if (credential) {
        const userData = mockUsers.find((u) => u.email === email);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('authToken', 'mock-token-' + Date.now());
          showToast('Login successful! (Mock mode)', 'success');
          setLoading(false);
          return true;
        }
      }

      // Check registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const registeredUser = registeredUsers.find(
        (u: any) => u.email === email && u.password === password && role.toUpperCase() === 'USER'
      );

      if (registeredUser) {
        const userData: User = {
          id: registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          role: 'USER',
          phone: registeredUser.phone,
          address: registeredUser.address || '',
          vehicles: []
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        showToast('Login successful!', 'success');
        setLoading(false);
        return true;
      }

      showToast('Invalid credentials. Please try again.', 'error');
      setLoading(false);
      return false;
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try API registration first
      const response = await authAPI.register({
        ...userData,
        role: userData.role || 'USER'
      });
      
      if (response.success) {
        showToast('Registration successful! Please login to continue.', 'success');
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.log('API registration failed, using localStorage fallback...');
    }

    // Fallback to localStorage
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if email already exists
      if (registeredUsers.find((u: any) => u.email === userData.email)) {
        showToast('Email already exists. Please use a different email.', 'error');
        setLoading(false);
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'USER' // Ensure role is uppercase
      };

      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      showToast('Registration successful! Please login to continue.', 'success');
      setLoading(false);
      return true;
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // Try API logout
      await authAPI.logout();
    } catch (error) {
      console.log('API logout failed, proceeding with local logout...');
    }
    
    // Clear local state and storage
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    showToast('Logged out successfully', 'info');
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.log('Failed to refresh user data');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};