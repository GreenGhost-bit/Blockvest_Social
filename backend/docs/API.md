# Blockvest Social API Documentation

## Overview
Blockvest Social is a decentralized social investment platform built on the Algorand blockchain. This API provides endpoints for user management, investment operations, risk assessment, and blockchain interactions.

## Base URL
```
https://api.blockvestsocial.com/v1
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- Investment endpoints: 10 requests per minute
- General endpoints: 100 requests per minute

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "type": "error_type",
  "details": {}
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "wallet_address": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "wallet_address": "string",
      "verified": false
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "wallet_address": "string",
      "verified": true,
      "risk_score": 75
    },
    "token": "jwt-token"
  }
}
```

### Investments

#### GET /investments
Get all available investments with optional filters.

**Query Parameters:**
- `status`: pending, active, completed, defaulted
- `category`: education, business, medical, home, vehicle, emergency, other
- `min_amount`: minimum investment amount
- `max_amount`: maximum investment amount
- `min_interest_rate`: minimum interest rate
- `max_interest_rate`: maximum interest rate
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": "string",
        "app_id": 123,
        "amount": 100,
        "purpose": "Education loan",
        "interest_rate": 8.5,
        "duration": 30,
        "status": "pending",
        "borrower": {
          "id": "string",
          "username": "string",
          "reputation_score": 85,
          "risk_score": 75,
          "verified": true
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /investments
Create a new investment request.

**Request Body:**
```json
{
  "amount": 100,
  "purpose": "Education loan for university",
  "description": "Need funds for tuition fees",
  "interest_rate": 8.5,
  "duration": 30,
  "category": "education"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "id": "string",
      "app_id": 123,
      "tx_id": "transaction-hash",
      "amount": 100,
      "purpose": "Education loan for university",
      "interest_rate": 8.5,
      "duration": 30,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### POST /investments/:id/fund
Fund an investment.

**Request Body:**
```json
{
  "amount": 100,
  "investor_address": "algorand-wallet-address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment funded successfully",
  "data": {
    "tx_id": "transaction-hash",
    "funded_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /investments/:id/repay
Make a repayment on an investment.

**Request Body:**
```json
{
  "amount": 50,
  "borrower_address": "algorand-wallet-address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repayment made successfully",
  "data": {
    "tx_id": "transaction-hash",
    "amount_repaid": 50,
    "remaining_balance": 58.5
  }
}
```

### Risk Assessment

#### POST /risk-assessment
Submit risk assessment data.

**Request Body:**
```json
{
  "income_level": "medium",
  "credit_history": "good",
  "employment_status": "employed",
  "monthly_income": 5000,
  "existing_debts": 1000,
  "employment_duration": 24,
  "purpose": "Education loan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Risk assessment completed",
  "data": {
    "risk_score": 75,
    "risk_level": "medium",
    "max_loan_amount": 1500,
    "recommended_interest_rate": 10,
    "factor_scores": {
      "income": 80,
      "credit_history": 80,
      "employment": 90,
      "debt_to_income": 70,
      "purpose": 85,
      "verification": 50
    },
    "recommendations": [
      "Complete account verification process",
      "Consider providing additional income documentation"
    ]
  }
}
```

### Blockchain

#### GET /blockchain/account/:address
Get account information from Algorand blockchain.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "algorand-address",
    "balance": 1000000,
    "assets": [],
    "applications": [],
    "created_apps": []
  }
}
```

#### GET /blockchain/transaction/:txId
Get transaction details from Algorand blockchain.

**Response:**
```json
{
  "success": true,
  "data": {
    "tx_id": "transaction-hash",
    "status": "confirmed",
    "amount": 1000000,
    "sender": "algorand-address",
    "receiver": "algorand-address",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### User Management

#### GET /users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "full_name": "string",
      "wallet_address": "string",
      "verified": true,
      "risk_score": 75,
      "reputation_score": 85,
      "total_investments_received": 5,
      "total_investments_made": 3,
      "total_amount_borrowed": 500,
      "total_amount_invested": 300,
      "on_time_repayments": 4,
      "late_repayments": 1,
      "defaults": 0,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "full_name": "string",
  "bio": "string",
  "location": "string",
  "phone_number": "string"
}
```

### Notifications

#### GET /notifications
Get user notifications.

**Query Parameters:**
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)
- `type`: notification type filter

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "investment_funded",
        "title": "Investment Funded!",
        "message": "Your investment has been funded with 100 ALGO.",
        "read": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## WebSocket Events

### Connection
Connect to WebSocket for real-time updates:
```
wss://api.blockvestsocial.com/ws
```

### Events

#### notification
Real-time notification updates.
```json
{
  "type": "notification",
  "data": {
    "id": "string",
    "type": "investment_funded",
    "title": "Investment Funded!",
    "message": "Your investment has been funded.",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### investment_update
Real-time investment status updates.
```json
{
  "type": "investment_update",
  "data": {
    "investment_id": "string",
    "status": "active",
    "amount_funded": 100,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Investment creation | 10 requests | 1 minute |
| Investment funding | 10 requests | 1 minute |
| General API | 100 requests | 1 minute |

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install blockvest-social-sdk
```

```javascript
import { BlockvestClient } from 'blockvest-social-sdk';

const client = new BlockvestClient({
  baseUrl: 'https://api.blockvestsocial.com/v1',
  token: 'your-jwt-token'
});

// Create investment
const investment = await client.investments.create({
  amount: 100,
  purpose: 'Education loan',
  interest_rate: 8.5,
  duration: 30
});
```

### Python
```bash
pip install blockvest-social-python
```

```python
from blockvest_social import BlockvestClient

client = BlockvestClient(
    base_url='https://api.blockvestsocial.com/v1',
    token='your-jwt-token'
)

# Create investment
investment = client.investments.create(
    amount=100,
    purpose='Education loan',
    interest_rate=8.5,
    duration=30
)
```

## Support

For API support and questions:
- Email: api-support@blockvestsocial.com
- Documentation: https://docs.blockvestsocial.com
- GitHub: https://github.com/blockvest-social/api 