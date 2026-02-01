# Load Testing Guide

This guide explains how to test the Decision Coach application with 60 concurrent students.

## Prerequisites

- Node.js 18+ (for native `fetch` support)
- Backend server running (local or production)

## Quick Start

### Test Production Backend (Render.com)

```bash
cd jamie-backend
node load-test.js https://jamie-backend.onrender.com/chat 60 10
```

### Test Local Backend

```bash
# Terminal 1: Start the backend
cd jamie-backend
npm start

# Terminal 2: Run load test
cd jamie-backend
node load-test.js http://localhost:3001/chat 60 10
```

## Command Syntax

```bash
node load-test.js [backend-url] [num-users] [messages-per-user]
```

### Parameters

- `backend-url` (optional): Backend API endpoint
  - Default: `https://jamie-backend.onrender.com/chat`
  - Local: `http://localhost:3001/chat`
  
- `num-users` (optional): Number of concurrent users to simulate
  - Default: `60`
  
- `messages-per-user` (optional): Number of messages each user sends
  - Default: `10`
  - Simulates a full session (Jamie has 10 attempts)

## Examples

### Test with 60 users, 10 messages each (default)
```bash
node load-test.js
```

### Test with 30 users, 5 messages each
```bash
node load-test.js https://jamie-backend.onrender.com/chat 30 5
```

### Test local backend with 100 users
```bash
node load-test.js http://localhost:3001/chat 100 10
```

## What Gets Tested

The load test simulates:
- ✅ 60 concurrent students starting sessions simultaneously
- ✅ Each student sending 10 messages (full Jamie session)
- ✅ Total of 600 API requests
- ✅ Staggered ramp-up (5 seconds) to avoid initial spike
- ✅ Realistic delays between messages (1-3 seconds)

## Metrics Reported

The test reports:

1. **Overall Statistics**
   - Total time
   - Total requests
   - Success/failure counts
   - Success rate percentage
   - Requests per second (throughput)

2. **Response Time Statistics**
   - Average response time
   - Minimum/Maximum response times
   - Median (p50)
   - 95th percentile (p95)
   - 99th percentile (p99)

3. **Performance Assessment**
   - Response time evaluation
   - Success rate evaluation
   - Throughput evaluation

## Performance Targets

### Good Performance ✅
- Average response time: < 2 seconds
- 95th percentile: < 5 seconds
- Success rate: ≥ 99%
- Throughput: ≥ 10 requests/second

### Acceptable Performance ⚠️
- Average response time: 2-5 seconds
- 95th percentile: 5-10 seconds
- Success rate: 95-99%
- Throughput: 5-10 requests/second

### Poor Performance ❌
- Average response time: > 5 seconds
- 95th percentile: > 10 seconds
- Success rate: < 95%
- Throughput: < 5 requests/second

## Interpreting Results

### If tests pass ✅
- The application can handle 60 concurrent users
- Response times are acceptable
- No significant bottlenecks detected

### If tests show issues ⚠️
- Check backend logs for errors
- Monitor server resources (CPU, memory)
- Check OpenAI API rate limits
- Consider:
  - Increasing server resources
  - Implementing request queuing
  - Adding caching
  - Optimizing database queries

## Troubleshooting

### "fetch is not defined"
- Upgrade to Node.js 18+ or install `node-fetch`:
  ```bash
  npm install node-fetch
  ```
  Then add to load-test.js:
  ```javascript
  const fetch = require('node-fetch');
  ```

### Connection errors
- Verify backend is running
- Check backend URL is correct
- Verify CORS is enabled on backend
- Check firewall/network settings

### Timeout errors
- Backend may be overloaded
- Reduce number of concurrent users
- Check OpenAI API response times
- Monitor backend server resources

## Advanced Testing

### Test different scenarios

**Light load (30 users)**
```bash
node load-test.js https://jamie-backend.onrender.com/chat 30 10
```

**Heavy load (100 users)**
```bash
node load-test.js https://jamie-backend.onrender.com/chat 100 10
```

**Extended session (20 messages per user)**
```bash
node load-test.js https://jamie-backend.onrender.com/chat 60 20
```

### Monitor during test

While the test runs, monitor:
- Backend server CPU/memory usage
- Backend application logs
- OpenAI API usage/dashboard
- Database connection pool (if applicable)

## Notes

- The test uses realistic message content from actual conversations
- Each user has a unique session ID to avoid conflicts
- Messages are sent with realistic delays (1-3 seconds)
- The test exits with code 1 if performance is poor (< 95% success or > 10s avg response)

