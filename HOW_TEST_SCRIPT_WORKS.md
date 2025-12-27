# How the Load Test Script Works

## What It Does (Simple Explanation)

The script **does NOT create accounts or log into your app**. Instead, it:

1. **Makes direct HTTP requests** to your backend API
2. **Simulates chat messages** - like a user typing and sending a message
3. **Measures response times** - how long it takes the backend to respond

## Detailed Breakdown

### Step 1: Simulating a User
```javascript
// Creates a fake "user" with:
- session_id: "test-session-1-1234567890"  // Unique session ID
- user_id: "test-user-1"                    // Unique user ID
- message: "Tell me more"                   // The chat message
- character: "kavya"                        // Which persona to use
```

### Step 2: Sending HTTP Request
```javascript
// Sends POST request directly to your backend:
POST https://jamie-backend.onrender.com/chat
{
  "message": "Tell me more",
  "session_id": "test-session-1-1234567890",
  "user_id": "test-user-1",
  "character": "kavya"
}
```

This is **exactly what your frontend does** when a real user sends a message through the chat interface.

### Step 3: Backend Processing
Your backend receives this request and:
1. Processes the message
2. Calls OpenAI API to generate a response
3. Calls OpenAI API again to score the DQ (Decision Quality)
4. Returns the response

### Step 4: Measuring Performance
The script measures:
- How long the request took (start time → end time)
- Whether it succeeded or failed
- Response times for all requests

## What This Tests

✅ **Backend performance** - Can it handle concurrent requests?
✅ **Autoscaling** - Do instances scale up when load increases?
✅ **Response times** - Are they acceptable (< 90 seconds)?
✅ **Error rates** - Do requests fail under load?

## What It Does NOT Do

❌ Create user accounts
❌ Log into your app
❌ Use the frontend UI
❌ Store data in your database (unless your backend does)

## Real-World Comparison

**Normal User Flow:**
1. User opens your app in browser
2. User types message and clicks send
3. Frontend sends POST request to `/chat` endpoint
4. Backend processes and responds
5. Frontend displays response

**Test Script Flow:**
1. Script directly sends POST request to `/chat` endpoint
2. Backend processes and responds (same as above)
3. Script measures the time it took

**Result:** Both paths hit the same backend code, so testing the API directly gives accurate performance data.

## Why 5 Seconds Seemed Fast

The 5-second response time is suspicious because your backend typically:
1. Calls OpenAI API to generate response (~10-30 seconds)
2. Calls OpenAI API again to score DQ (~10-30 seconds)
3. Total: Should be 20-60 seconds normally

A 5-second response suggests either:
- The requests didn't fully process through OpenAI
- There was an error that returned quickly
- The backend cached something (unlikely)

This is why we should check the Render logs to see what actually happened!

