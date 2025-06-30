

 🚗 Vehicle Service Management System (VSMS) – Backend

This is the backend component of the Vehicle Service Management System (VSMS), a full-stack web application for managing vehicle service requests, mechanic assignments, and invoice processing. The backend is built with Spring Boot, Java, and MySQL, and implements secure JWT-based authentication.

📦 Features

- User registration and authentication (JWT)
- Role-based access control (User, Admin, Mechanic)
- Vehicle management (CRUD)
- Service request booking and tracking
- Mechanic assignment and status updates
- Invoice generation and payment processing
- RESTful API design
- Secure password encryption (BCrypt)
- CORS configuration for frontend integration

🏗️ Project Structure

```
src/main/java/com/vehicleservice/
├── config/         # Configuration classes
├── controller/     # REST API endpoints
├── dto/            # Data Transfer Objects
├── model/          # Database entities
├── repository/     # Data access layer
├── service/        # Business logic
└── security/       # JWT authentication
```

🗄️ Database Schema

- **users**: User accounts and authentication
- **vehicles**: Vehicle information
- **service_requests**: Service booking and tracking
- **mechanics**: Mechanic profiles
- **invoices**: Billing and payments
- **service_items**: Individual service components

 🔐 Authentication & Security

- JWT-based authentication for all endpoints
- Passwords encrypted with BCrypt
- Role-based access control for sensitive operations
- Input validation and sanitization

🔗 API Endpoints

Authentication

| Method | Endpoint              | Description         |
|--------|----------------------|---------------------|
| POST   | /api/auth/register   | User registration   |
| POST   | /api/auth/login      | User login          |

Vehicles

| Method | Endpoint                | Description         |
|--------|------------------------|---------------------|
| GET    | /api/vehicles          | Get all vehicles    |
| POST   | /api/vehicles          | Create vehicle      |
| GET    | /api/vehicles/{id}     | Get vehicle by ID   |
| PUT    | /api/vehicles/{id}     | Update vehicle      |
| DELETE | /api/vehicles/{id}     | Delete vehicle      |

 Service Requests

| Method | Endpoint                      | Description         |
|--------|------------------------------|---------------------|
| GET    | /api/service-requests        | Get all requests    |
| POST   | /api/service-requests        | Create request      |
| PUT    | /api/service-requests/{id}   | Update request      |
| DELETE | /api/service-requests/{id}   | Delete request      |

Invoices & Payments

| Method | Endpoint                              | Description         |
|--------|--------------------------------------|---------------------|
| GET    | /api/invoices                        | Get all invoices    |
| POST   | /api/invoices                        | Create invoice      |
| POST   | /api/invoices/{id}/process-payment   | Process payment     |

 🚀 Getting Started

 Prerequisites

- Java 17+
- Maven
- MySQL

 Setup

1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   cd backend
   ```

2. **Configure the database:**
   - Update `src/main/resources/application.properties` with your MySQL credentials.

3. **Run database migrations:**
   - Flyway will auto-run migrations on application startup.

4. **Start the backend server:**
   ```
   mvn spring-boot:run
   ```
   Or run in your preferred IDE (e.g., Spring Tool Suite).

 🧪 Testing

- Use Postman or any REST client to test the endpoints.
- JWT token is required for protected routes (add `Authorization: Bearer <token>` header).

 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
