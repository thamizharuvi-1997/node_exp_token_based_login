# Node.js Express Authentication API

A professional Node.js backend with Express, MySQL, Sequelize, and JWT authentication system featuring access/refresh tokens with rotation and HTTP-only cookies.

## Features

- **Email/Password Authentication** with bcrypt hashing
- **JWT Access & Refresh Tokens** with automatic rotation
- **HTTP-Only Cookies** for secure token storage
- **Token Blacklisting** for secure logout
- **Rate Limiting** for API protection
- **Input Validation** with express-validator
- **Security Headers** with Helmet
- **CORS Configuration** for frontend integration
- **Database Migrations** with Sequelize

## Quick Start

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure your database in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=node_auth_api
   DB_USER=root
   DB_PASSWORD=your_password
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout from current device
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/profile` - Get user profile (authenticated)

### Health Check

- `GET /api/health` - Server health status

## Request/Response Examples

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Get Profile

```bash
GET /api/auth/profile
Authorization: Bearer <access_token>
```

## Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Separate access (15min) and refresh (7d) tokens
- **HTTP-Only Cookies**: Prevent XSS attacks
- **CSRF Protection**: SameSite cookies
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Comprehensive validation rules
- **Security Headers**: Helmet middleware

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=node_auth_api
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie
COOKIE_SECRET=your_cookie_secret
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `isActive` (BOOLEAN)
- `lastLoginAt` (DATETIME)
- `emailVerifiedAt` (DATETIME)
- `createdAt`, `updatedAt` (TIMESTAMP)

### Refresh Tokens Table
- `id` (UUID, Primary Key)
- `token` (VARCHAR, Unique)
- `userId` (UUID, Foreign Key)
- `expiresAt` (DATETIME)
- `isRevoked` (BOOLEAN)
- `userAgent` (VARCHAR)
- `ipAddress` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Project Structure

```
├── config/
│   ├── database.js     # Database configuration
│   └── sequelize.js    # Sequelize instance
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── auth.js         # Authentication middleware
│   └── validation.js   # Input validation
├── models/
│   ├── User.js         # User model
│   ├── RefreshToken.js # Refresh token model
│   └── index.js        # Model associations
├── routes/
│   └── auth.js         # Authentication routes
├── utils/
│   ├── jwt.js          # JWT utilities
│   └── cookies.js      # Cookie utilities
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── server.js           # Express server
└── README.md           # This file
```

## License

MIT
