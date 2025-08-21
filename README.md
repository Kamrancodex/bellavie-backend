# Bellavie CRM Backend API

A comprehensive Node.js backend API for the Bellavie CRM dashboard, built with Express.js and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin, Manager, and Staff roles with different permissions
- **Client Management**: Complete CRM functionality for managing clients and leads
- **Event Management**: Full event planning and coordination features
- **Inquiry System**: Handle website inquiries and convert to clients/events
- **Dashboard Analytics**: Real-time statistics and reporting
- **Email Notifications**: Automated email system with templates
- **File Uploads**: Support for documents and attachments
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── clientController.js  # Client management
│   │   ├── eventController.js   # Event management
│   │   ├── inquiryController.js # Inquiry handling
│   │   └── dashboardController.js # Dashboard stats
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── errorMiddleware.js   # Error handling
│   │   └── validationMiddleware.js # Input validation
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Client.js            # Client schema
│   │   ├── Event.js             # Event schema
│   │   └── Inquiry.js           # Inquiry schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── clientRoutes.js      # Client endpoints
│   │   ├── eventRoutes.js       # Event endpoints
│   │   ├── inquiryRoutes.js     # Inquiry endpoints
│   │   └── dashboardRoutes.js   # Dashboard endpoints
│   ├── services/                # Business logic services
│   ├── utils/
│   │   └── emailService.js      # Email utilities
│   └── server.js                # Express server setup
├── package.json
├── .env.example
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Install

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Environment Variables

Configure the following variables in your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bellavie-crm
DB_NAME=bellavie-crm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@bellavie.com
FROM_NAME=Bellavie CRM

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=12
COOKIE_SECRET=your-cookie-secret-here
```

### 4. Database Setup

Make sure MongoDB is running, then start the server to automatically create the database and collections.

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /refresh-token` - Refresh JWT token

### Users (`/api/v1/users`)

- `GET /` - Get all users (Manager/Admin)
- `GET /stats` - Get user statistics (Manager/Admin)
- `GET /:id` - Get user by ID (Manager/Admin)
- `POST /` - Create new user (Admin)
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)

### Clients (`/api/v1/clients`)

- `GET /` - Get all clients
- `GET /stats` - Get client statistics (Manager/Admin)
- `GET /:id` - Get client by ID
- `GET /:id/communications` - Get client communications
- `POST /` - Create new client
- `POST /:id/communications` - Add client communication
- `PUT /:id` - Update client
- `DELETE /:id` - Delete client (Manager/Admin)

### Events (`/api/v1/events`)

- `GET /` - Get all events
- `GET /upcoming` - Get upcoming events
- `GET /stats` - Get event statistics (Manager/Admin)
- `GET /:id` - Get event by ID
- `POST /` - Create new event
- `POST /:id/tasks` - Add event task
- `PUT /:id` - Update event
- `PUT /:id/tasks/:taskId/complete` - Complete event task
- `DELETE /:id` - Delete event (Manager/Admin)

### Inquiries (`/api/v1/inquiries`)

- `GET /` - Get all inquiries
- `GET /stats` - Get inquiry statistics
- `GET /:id` - Get inquiry by ID
- `POST /` - Create new inquiry (Public)
- `POST /:id/communications` - Add inquiry communication
- `POST /:id/convert` - Convert inquiry to client/event
- `PUT /:id` - Update inquiry
- `DELETE /:id` - Delete inquiry

### Dashboard (`/api/v1/dashboard`)

- `GET /stats` - Get dashboard statistics
- `GET /activity` - Get recent activity
- `GET /tasks` - Get upcoming tasks
- `GET /revenue` - Get revenue statistics
- `GET /conversion-funnel` - Get conversion funnel data

## 🔐 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication with three user roles:

- **Admin**: Full access to all resources
- **Manager**: Access to most resources, can manage clients and events
- **Staff**: Limited access, can view and update assigned resources

### Role-based Access Control

- Public routes: Registration, login, inquiry creation
- Staff routes: Basic CRM operations
- Manager routes: User management, advanced reporting
- Admin routes: System administration, user creation/deletion

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Cross-Origin Resource Sharing configuration
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive validation using express-validator
- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Security**: Secure token generation and validation
- **Error Handling**: Comprehensive error handling and logging

## 📧 Email System

The API includes a complete email system with:

- Welcome emails for new users
- Password reset emails
- Inquiry notifications
- Event reminders
- Custom email templates
- SMTP configuration support
- Development email preview

## 🗄️ Database Models

### User Model
- Authentication and authorization
- Role-based permissions
- Profile management
- Preferences and settings

### Client Model
- Complete contact information
- Communication history
- Lead tracking and conversion
- Marketing preferences

### Event Model
- Comprehensive event details
- Budget and service tracking
- Timeline and task management
- Team assignments

### Inquiry Model
- Website form submissions
- Lead qualification
- Conversion tracking
- Communication logs

## 🚀 Development

### Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Adding New Features

1. Create model in `src/models/`
2. Add controller in `src/controllers/`
3. Define routes in `src/routes/`
4. Add validation middleware
5. Update server.js to include new routes
6. Add tests for new functionality

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [] // Validation errors if applicable
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint",
  "method": "POST"
}
```

## 🔧 Configuration

### MongoDB Configuration
- Connection pooling
- Automatic reconnection
- Index optimization
- Schema validation

### Email Configuration
- SMTP support
- Template system
- Bulk email handling
- Development testing

### Security Configuration
- JWT token expiration
- Rate limiting rules
- CORS policies
- Cookie settings

## 📊 Monitoring & Logging

- Request logging with Morgan
- Error logging and tracking
- Performance monitoring
- Database query optimization

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secrets
4. Configure SMTP for emails
5. Set up SSL/TLS certificates
6. Configure reverse proxy (nginx)
7. Set up process manager (PM2)
8. Configure monitoring and logging

### Environment-specific Configurations

- Development: Detailed logging, email previews
- Staging: Production-like setup with test data
- Production: Optimized for performance and security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for Bellavie Events & Catering
