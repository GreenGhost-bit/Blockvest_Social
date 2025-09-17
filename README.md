# Blockvest Social

A decentralized social investment platform built on Algorand blockchain, enabling peer-to-peer lending and investment opportunities for individuals without formal credit history.

## Features

- 🔗 **Algorand Integration**: Built on Algorand blockchain for fast, secure, and low-cost transactions
- 💰 **Peer-to-Peer Lending**: Connect borrowers with investors directly
- 🛡️ **Risk Assessment**: AI-powered risk evaluation system
- ⭐ **Reputation System**: Social reputation scoring for better trust
- 🔒 **Smart Contracts**: Automated investment management with Algorand smart contracts
- 📊 **Analytics Dashboard**: Comprehensive investment analytics and reporting
- 🌐 **Web3 Wallet Integration**: Connect with Algorand wallets
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Algorand SDK for blockchain integration
- Socket.io for real-time notifications
- JWT for authentication
- PyTeal for smart contracts

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- React Context for state management
- Algorand wallet integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blockvest_social_final/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp config.env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run setup
```

5. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/blockvest_social
JWT_SECRET=your-secret-key
ALGOD_SERVER=https://testnet-api.algonode.cloud
INDEXER_SERVER=https://testnet-idx.algonode.cloud
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

## Smart Contracts

The platform uses Algorand smart contracts for:
- Investment management
- Governance voting
- Automated repayments
- Risk assessment

Smart contracts are written in PyTeal and deployed on Algorand testnet/mainnet.

## API Endpoints

### Authentication
- `POST /api/auth/connect-wallet` - Connect Algorand wallet
- `POST /api/auth/register` - Register user profile

### Investments
- `POST /api/investments/create` - Create investment opportunity
- `POST /api/investments/fund` - Fund an investment
- `GET /api/investments/explore` - Browse investments
- `GET /api/investments/my-investments` - Get user investments

### Smart Contracts
- `POST /api/smart-contracts/deploy/investment` - Deploy investment contract
- `POST /api/smart-contracts/deploy/governance` - Deploy governance contract
- `POST /api/smart-contracts/investment/create` - Create investment on blockchain

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Multi-chain support
- [ ] DeFi integrations
- [ ] Insurance products
- [ ] Credit scoring improvements