# Blockvest Social

A decentralized social investment platform built on the Algorand blockchain, enabling peer-to-peer lending and borrowing with transparent, trustless smart contracts.

## 🌟 Features

- **Decentralized Lending**: Create and fund investment requests using Algorand smart contracts
- **Risk Assessment**: AI-powered credit scoring and risk evaluation
- **Social Features**: User profiles, reputation system, and community interactions
- **Real-time Notifications**: WebSocket-based notifications for investment updates
- **Multi-wallet Support**: Connect with MyAlgo, AlgoSigner, and other Algorand wallets
- **Mobile Responsive**: Modern, responsive UI built with React and Tailwind CSS
- **Security First**: Comprehensive input validation, rate limiting, and error handling

## 🏗️ Architecture

```
Blockvest Social
├── Frontend (React + TypeScript)
│   ├── Components
│   ├── Hooks
│   ├── Pages
│   └── Services
├── Backend (Node.js + Express)
│   ├── API Routes
│   ├── Middleware
│   ├── Services
│   └── Models
├── Smart Contracts (PyTeal)
│   ├── Investment Contract
│   └── Governance Contract
└── Infrastructure
    ├── Docker
    ├── Monitoring
    └── CI/CD
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/blockvest-social.git
   cd blockvest-social
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp backend/config.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. **Configure Environment Variables**
   ```bash
   # Backend (.env)
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blockvest_social
   JWT_SECRET=your-super-secret-jwt-key
   ALGOD_TOKEN=your-algod-token
   ALGOD_SERVER=https://testnet-api.algonode.cloud
   ```

5. **Start the application**
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend (in new terminal)
   cd frontend
   npm run dev
   ```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Documentation

Comprehensive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **API Reference**: [API.md](backend/docs/API.md)

### Key Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /investments` - List available investments
- `POST /investments` - Create new investment
- `POST /investments/:id/fund` - Fund an investment
- `POST /risk-assessment` - Submit risk assessment

## 🔧 Development

### Project Structure

```
blockvest-social/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── contracts/      # Smart contracts
│   └── docs/          # Documentation
├── frontend/
│   ├── components/     # React components
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Next.js pages
│   └── services/      # API services
├── monitoring/        # Monitoring configs
└── nginx/            # Nginx configuration
```

### Available Scripts

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Database Migrations

```bash
# Create migration
npm run migrate:create -- --name add_user_verification

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using Joi
- **Rate Limiting**: Configurable rate limits for API endpoints
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **XSS Protection**: Input sanitization and output encoding

## 📊 Monitoring & Analytics

### Built-in Monitoring

- **Health Checks**: Application health monitoring
- **Request Logging**: Detailed request/response logging
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Metrics**: Response time and throughput monitoring

### External Tools

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Elasticsearch**: Log aggregation
- **Kibana**: Log visualization

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "User"

# Run with coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment
   NODE_ENV=production
   
   # Configure production database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blockvest_social
   
   # Set production Algorand network
   NETWORK=mainnet
   ```

2. **Build Application**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Frontend
   cd frontend
   npm run build
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing
- Code quality checks
- Security scanning
- Docker image building
- Deployment to staging/production

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier + TypeScript
- **Smart Contracts**: Black (Python formatter)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.blockvestsocial.com](https://docs.blockvestsocial.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/blockvest-social/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/blockvest-social/discussions)
- **Email**: support@blockvestsocial.com

## 🙏 Acknowledgments

- [Algorand Foundation](https://algorand.org/) for the blockchain infrastructure
- [PyTeal](https://pyteal.readthedocs.io/) for smart contract development
- [React](https://reactjs.org/) and [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [MongoDB](https://www.mongodb.com/) for the database
- [Redis](https://redis.io/) for caching

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core investment functionality
- ✅ User authentication and profiles
- ✅ Risk assessment system
- ✅ Basic social features

### Phase 2 (Q2 2024)
- 🔄 Advanced risk modeling
- 🔄 Multi-currency support
- 🔄 Mobile application
- 🔄 Advanced analytics dashboard

### Phase 3 (Q3 2024)
- 📋 Governance token implementation
- 📋 DAO governance features
- 📋 Cross-chain integration
- 📋 Advanced DeFi features

### Phase 4 (Q4 2024)
- 📋 Institutional features
- 📋 Regulatory compliance tools
- 📋 Advanced security features
- 📋 Global expansion

---

**Built with ❤️ by the Blockvest Social Team** 