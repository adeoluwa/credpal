# FX Trading Platform

A NestJS-based foreign exchange trading platform with user authentication, wallet management, and real-time rate tracking.

## Features

### 1. User Authentication
- JWT-based authentication system
- User registration and login endpoints
- Password hashing with bcrypt
- Role-based access control (RBAC)

### 2. Wallet Management
- Multi-currency wallet support
- Wallet balance tracking
- Secure transaction history
- Fund deposit/withdrawal simulation

### 3. FX Rate Module
- Real-time exchange rate fetching
- Historical rate data storage
- Rate comparison tools
- Custom rate alert system

### 4. Transaction System
- Trade execution engine
- Transaction history recording
- Trade confirmation notifications
- Profit/loss calculation

### 5. Trading Module
- Limit/market orders
- Order book simulation
- Trade position management
- Risk assessment tools

## Technology Stack
- **Backend**: NestJS 11.0.6
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Environment**: Node.js 18+

## Installation
1. Clone the repository:
```bash
git clone https://github.com/your-repo/fx-trading-platform.git
cd fx-trading-platform
```

2. Install dependencies 
```bash
npm install
```

3. Configure Postgres
```json
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fx_user
DB_PASSWORD=securepassword
DB_NAME=fx_trading
JWT_SECRET=your_jwt_secret
```

4. Run Migration
```bash
npm run migration:generate
npm run migration:run
```

5. Start dev server
```bash
npm run start:dev
```

API DOCUMENTATION:
https://documenter.getpostman.com/view/42830262/2sB2cX7LGs