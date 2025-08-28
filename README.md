# Blockvest Social - Decentralized Social Investment Platform

A comprehensive blockchain-based social investment platform built with Node.js, React, and Algorand blockchain technology.

## 🚀 Features

### Core Functionality
- **User Management**: Secure user registration, authentication, and profile management
- **Investment Platform**: Create, fund, and manage peer-to-peer investments
- **Risk Assessment**: AI-powered risk evaluation and scoring system
- **Social Features**: User connections, reputation system, and social interactions
- **Governance**: Community-driven decision making and proposal system
- **Real-time Notifications**: Instant updates via WebSocket connections
- **Multi-Factor Authentication**: Enhanced security with TOTP, Algorand signatures, and email verification

### Security Features
- **Comprehensive Validation**: Input sanitization and validation using Joi
- **Rate Limiting**: Advanced rate limiting with speed limiting capabilities
- **Security Headers**: Helmet.js integration with custom security policies
- **Input Sanitization**: Protection against malicious input and injection attacks
- **IP Validation**: Protection against private IP access in production
- **User Agent Validation**: Detection and monitoring of suspicious requests

### Data Management
- **Enhanced Models**: Comprehensive data validation and error handling
- **Database Optimization**: Connection pooling, monitoring, and graceful shutdown
- **Index Management**: Automatic index creation and optimization
- **Data Integrity**: Strict validation rules and constraints

### Monitoring & Logging
- **Structured Logging**: Winston-based logging with multiple transports
- **Performance Monitoring**: Request timing and database performance tracking
- **Security Logging**: Comprehensive security event logging
- **Log Rotation**: Automatic log file rotation and management

## 🏗️ Architecture

### Backend Structure
```
backend/
├── config/           # Configuration files
├── contracts/        # Smart contract definitions
├── middleware/       # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── errorHandler.js # Error handling middleware
│   ├── security.js  # Security middleware
│   └── validation.js # Input validation middleware
├── models/          # Database models
│   ├── user.js      # User model with enhanced validation
│   ├── investment.js # Investment model
│   ├── riskassessment.js # Risk assessment model
│   ├── notifications.js # Notification model
│   ├── MFA.js       # Multi-factor authentication model
│   └── document.js  # Document management model
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
│   ├── logger.js    # Advanced logging system
│   └── database.js  # Database connection manager
└── tests/           # Test suite
    └── setup.js     # Test configuration and utilities
```

### Frontend Structure
```
frontend/
├── app/             # Next.js app directory
├── components/      # Reusable UI components
│   ├── ui/         # Base UI components
│   └── ...         # Feature-specific components
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
└── public/         # Static assets
```

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Socket.IO**: Real-time communication
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Joi**: Input validation
- **Winston**: Logging
- **Helmet**: Security headers
- **Rate Limiting**: Request throttling

### Frontend
- **Next.js**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time updates
- **React Hook Form**: Form management

### Blockchain
- **Algorand**: Blockchain platform
- **AlgoSDK**: Algorand development kit

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd blockvest_social_final
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory based on `config.env.example`:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blockvest_social
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Algorand Configuration
ALGOD_TOKEN=your-algod-token
ALGOD_SERVER=https://testnet-api.algonode.cloud
INDEXER_TOKEN=your-indexer-token
INDEXER_SERVER=https://testnet-idx.algonode.cloud

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start the application
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Configuration
The test suite includes:
- In-memory MongoDB database for testing
- Comprehensive test data creation utilities
- Mock objects for request/response testing
- Test database setup and teardown

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Multi-factor authentication (TOTP, Algorand signatures, email)
- Role-based access control
- Session management

### Input Validation & Sanitization
- Comprehensive input validation using Joi
- SQL injection protection
- XSS protection
- Input sanitization and filtering

### Rate Limiting & DDoS Protection
- Configurable rate limiting
- Speed limiting for gradual slowdown
- IP-based request tracking
- Suspicious activity detection

### Security Headers
- Content Security Policy (CSP)
- XSS Protection
- Frame options
- HSTS configuration
- Referrer policy

## 📊 Monitoring & Logging

### Logging Levels
- **Error**: Application errors and exceptions
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Detailed debugging information

### Log Categories
- **Security**: Authentication, authorization, and security events
- **Performance**: Request timing and database performance
- **User**: User-related activities
- **Investment**: Investment-related operations
- **Blockchain**: Blockchain interactions
- **API**: API request/response logging

### Log Rotation
- Automatic log file rotation
- Configurable file size limits
- Retention policy management
- Compressed archive storage

## 🗄️ Database Management

### Connection Management
- Connection pooling with configurable limits
- Automatic reconnection on failure
- Graceful shutdown handling
- Connection health monitoring

### Performance Optimization
- Automatic index creation
- Query optimization
- Connection pool monitoring
- Database statistics collection

### Backup & Recovery
- Automated backup scheduling
- Data integrity checks
- Recovery procedures
- Point-in-time restoration

## 🔧 Configuration

### Environment Variables
The application uses environment variables for configuration. See `backend/config.env.example` for all available options.

### Security Configuration
- CORS settings
- Rate limiting parameters
- Security header policies
- Input validation rules

### Database Configuration
- Connection pool settings
- Timeout configurations
- Retry policies
- Monitoring intervals

## 📈 Performance Optimization

### Backend Optimization
- Request compression
- Response caching
- Database query optimization
- Connection pooling

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

## 🚀 Deployment

### Production Considerations
- Environment-specific configurations
- Security hardening
- Performance monitoring
- Error tracking and reporting

### Docker Support
- Multi-stage Docker builds
- Environment-specific configurations
- Health checks and monitoring
- Resource limits and constraints

## 🤝 Contributing

### Development Guidelines
- Follow the established code style
- Write comprehensive tests
- Update documentation
- Follow security best practices

### Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- API documentation
- User guides
- Developer documentation
- Troubleshooting guides

### Community
- GitHub issues
- Discussion forums
- Community chat
- Developer meetups

## 🔄 Changelog

### Recent Improvements
- Enhanced data models with comprehensive validation
- Advanced security middleware implementation
- Comprehensive error handling and logging
- Improved database connection management
- Enhanced testing infrastructure
- Better input validation and sanitization
- Advanced rate limiting and DDoS protection
- Comprehensive monitoring and logging system

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced security and validation
- **v1.2.0**: Advanced logging and monitoring
- **v1.3.0**: Comprehensive testing suite
- **v1.4.0**: Performance optimizations and database improvements

---

**Note**: This is a comprehensive social investment platform designed for production use. Please ensure proper security measures and compliance with local regulations before deployment. 