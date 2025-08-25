# YaYa Wallet Transaction Dashboard - Backend

A secure Nest.js API server that acts as a proxy to the YaYa Wallet API for transaction monitoring.

## 🏗️ Architecture

The backend serves as a secure intermediary between the frontend and YaYa Wallet's API, handling authentication, data processing, and API key management.

### Key Features
- RESTful API endpoints for transaction data
- HMAC-SHA256 authentication with YaYa Wallet API
- Secure API key management
- Search and pagination functionality
- CORS-enabled for frontend communication
- Request signing and timestamp validation

## 🔧 Tech Stack

- **Framework**: Nest.js (Node.js framework)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Environment**: dotenv for configuration
- **Authentication**: Custom HMAC-SHA256 implementation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone and navigate to backend directory:**
```bash
git clone <repository-url>
cd yaya-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
Create a `.env` file in the backend root directory:
```env
YAYA_API_KEY=
YAYA_API_SECRET=
PORT=3001
YAYA_API_BASE_URL=
CORS_ORIGIN=http://localhost:3000
```

4. **Start the development server:**
```bash
npm run start:dev
```

The server will run on `http://localhost:3001` with hot-reload enabled.

## Authentication System

### HMAC-SHA256 Implementation

The backend implements YaYa Wallet's custom authentication scheme:

1. **Request Signing Process**:
   - Generate timestamp (Unix timestamp in seconds)
   - Create signature string: `{method}{endpoint}{timestamp}{body}`
   - Compute HMAC-SHA256 hash using secret key
   - Encode signature as Base64

2. **Headers Added to Each Request**:
   ```
   YAYA-API-KEY: {api_key}
   YAYA-API-TIMESTAMP: {timestamp}
   YAYA-API-SIGNATURE: {base64_signature}
   Content-Type: application/json
   ```

### Security Features

- **API Key Protection**: Credentials never exposed to frontend
- **Timestamp Validation**: Prevents replay attacks (5-second window)
- **Request Integrity**: Complete request content is signed
- **Environment Separation**: Different configs for dev/production

##  API Endpoints

### GET /api/transactions

Retrieve paginated transactions.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)



## 🧪 Testing

### Manual Testing

Test the API endpoints directly using curl:

```bash
# Get transactions with pagination
curl -X GET "http://localhost:3001/api/transactions?page=1&limit=10"

# Search transactions
curl -X POST "http://localhost:3001/api/transactions/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "page": 1, "limit": 10}'

# Test with different page sizes
curl -X GET "http://localhost:3001/api/transactions?page=2&limit=5"
```

### Health Check

```bash
# Basic connectivity test
curl -X GET "http://localhost:3001"
```

### Error Handling Test Cases

1. **Invalid Page Numbers**: Test negative or zero page numbers
2. **Excessive Limits**: Test limits above maximum allowed
3. **Malformed Search**: Test search with empty or invalid queries
4. **Network Errors**: Test behavior when YaYa API is unavailable

## 🚀 Production Deployment

### Environment Configuration

For production deployment, update your `.env` file:

```env
NODE_ENV=production
YAYA_API_KEY=your_production_api_key
YAYA_API_SECRET=your_production_api_secret
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

### Security Checklist

- [ ] Use production API credentials
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring and health checks
- [ ] Use environment variables for all sensitive data



## 📁 Project Structure

```
backend/
├── src/
│   ├── app.controller.ts    # Main API endpoints
│   ├── app.service.ts       # Business logic and YaYa API integration
│   ├── app.module.ts        # Module configuration
│   └── main.ts              # Application bootstrap
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env                     # Environment variables (not in git)
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `YAYA_API_KEY` | YaYa Wallet API key | Yes | - |
| `YAYA_API_SECRET` | YaYa Wallet API secret | Yes | - |
| `PORT` | Server port | No | 3000 |
| `CORS_ORIGIN` | Allowed CORS origin | No | * |
| `NODE_ENV` | Environment mode | No | development |

### CORS Configuration

The server is configured to accept requests from the frontend. In development, it allows `http://localhost:3000`. For production, update `CORS_ORIGIN` to match your frontend domain.

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors (401)**:
   - Check API key and secret in `.env` file
   - Verify timestamp generation (system clock sync)
   - Ensure signature generation matches YaYa requirements

2. **CORS Errors**:
   - Update `CORS_ORIGIN` in `.env` file
   - Restart server after environment changes

3. **Connection Timeouts**:
   - Check YaYa Wallet API status
   - Verify network connectivity
   - Review timeout settings in service

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

This will show detailed request/response information and signature generation steps.

## 📞 Support

For backend-specific issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API connectivity using the manual testing commands above
4. Review the YaYa Wallet API documentation for any changes