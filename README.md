# Vehicle Service Management System

A comprehensive frontend application for managing vehicle services, built with React, TypeScript, and Tailwind CSS.

## Features

- **Role-based Authentication** (User, Admin, Mechanic)
- **Service Request Management**
- **Mechanic Assignment System**
- **Invoice Generation & Payment Processing**
- **Real-time Status Updates**
- **Responsive Design**

## API Integration

This application is designed to work with a backend API but includes fallback functionality using localStorage for development and testing.

### API Endpoints

The application expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

#### Service Requests
- `GET /api/service-requests` - Get all service requests (with pagination)
- `POST /api/service-requests` - Create new service request
- `GET /api/service-requests/:id` - Get specific service request
- `PUT /api/service-requests/:id` - Update service request
- `PATCH /api/service-requests/:id/status` - Update status
- `PATCH /api/service-requests/:id/assign` - Assign mechanic

#### Mechanics
- `GET /api/mechanics` - Get all mechanics
- `POST /api/mechanics` - Create new mechanic
- `GET /api/mechanics/:id` - Get specific mechanic
- `PUT /api/mechanics/:id` - Update mechanic
- `DELETE /api/mechanics/:id` - Delete mechanic

#### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get specific invoice
- `PATCH /api/invoices/:id/pay` - Mark invoice as paid
- `POST /api/invoices/:id/services` - Add service to invoice

#### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/users/:id/payments` - Get payment history

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicle-service-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Mock Data & Fallback Mode

When the API is not available, the application automatically falls back to localStorage-based data management with the following mock credentials:

### Demo Accounts

**Admin:**
- Email: `admin@vehicleservice.com`
- Password: `admin123`

**Mechanic:**
- Email: `john@vehicleservice.com`
- Password: `mechanic123`

**User:**
- Email: `jane@email.com`
- Password: `user123`

## API Service Architecture

### Core Services

- **`authAPI`** - Authentication operations
- **`serviceRequestAPI`** - Service request management
- **`mechanicAPI`** - Mechanic management
- **`invoiceAPI`** - Invoice operations
- **`paymentAPI`** - Payment processing
- **`analyticsAPI`** - Dashboard analytics
- **`fileAPI`** - File upload operations
- **`notificationAPI`** - Notification management

### Custom Hooks

- **`useApi`** - Generic API call hook with loading states
- **`useMutation`** - Hook for POST/PUT/DELETE operations
- **`usePaginatedApi`** - Hook for paginated data
- **`usePolling`** - Hook for real-time data with polling

### Error Handling

The API service includes comprehensive error handling:
- Automatic token refresh
- Fallback to localStorage when API is unavailable
- User-friendly error messages
- Network error recovery

## Backend Requirements

To fully utilize all features, implement a backend with the following:

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  vehicle_details TEXT,
  role ENUM('user', 'admin', 'mechanic') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mechanics table
CREATE TABLE mechanics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  skill VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mechanic_id UUID REFERENCES mechanics(id),
  vehicle_details TEXT NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  description TEXT,
  preferred_date DATE,
  status ENUM('pending', 'assigned', 'in-progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  service_request_id UUID REFERENCES service_requests(id),
  total_cost DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice services table
CREATE TABLE invoice_services (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  name VARCHAR(255) NOT NULL,
  cost DECIMAL(10,2) NOT NULL
);
```

### Authentication

Implement JWT-based authentication with:
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Role-based access control
- Password hashing (bcrypt recommended)

### File Upload

Support file uploads for:
- User avatars
- Vehicle images
- Service documentation

### Real-time Updates

Consider implementing WebSocket connections for:
- Service status updates
- New service requests
- Invoice notifications

## Deployment

### Frontend Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Traditional web server

### Environment Variables

Set the following environment variables in production:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.