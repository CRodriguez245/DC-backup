# Testing Autoscaling on Render

## Prerequisites

- Node.js 18+ (has built-in `fetch`) OR Node.js with `node-fetch` installed
- Render account upgraded to Professional workspace
- Autoscaling configured (min: 1, max: 6 instances)

## Quick Test (5 minutes)

### Step 1: Monitor Render Dashboard

1. Go to Render Dashboard → Your `jamie-backend` service
2. Open the **Metrics** tab
3. Watch these graphs:
   - **Instances** (should start at 1)
   - **CPU Utilization**
   - **Memory Utilization**
   - **Request Rate**

### Step 2: Run Light Load Test (5-10 concurrent users)

```bash
# Test with 10 concurrent users
NUM_USERS=10 node test-autoscaling.js
```

**Expected behavior:**
- Instances might stay at 1-2 (light load)
- Response times should be 30-60 seconds
- CPU/Memory should increase but not trigger scaling

### Step 3: Run Heavy Load Test (40 concurrent users)

```bash
# Test with 40 concurrent users (simulates research study day)
NUM_USERS=40 node test-autoscaling.js
```

**Expected behavior:**
- Instances should scale up from 1 → 3-6 instances (takes 1-2 minutes)
- Response times should remain 30-90 seconds (not 3+ minutes)
- CPU/Memory should trigger scaling thresholds (70%)
- After test completes, instances should scale back down to 1 (takes 5-10 minutes)

## Detailed Testing Steps

### Test 1: Normal Traffic (1-2 instances)

```bash
NUM_USERS=5 node test-autoscaling.js
```

**What to verify:**
- ✅ Instances stay at 1-2
- ✅ All requests succeed
- ✅ Average response time < 60 seconds

### Test 2: Medium Traffic (2-3 instances)

```bash
NUM_USERS=15 node test-autoscaling.js
```

**What to verify:**
- ✅ Instances scale to 2-3
- ✅ All requests succeed
- ✅ Average response time < 90 seconds

### Test 3: Peak Traffic (5-6 instances)

```bash
NUM_USERS=40 node test-autoscaling.js
```

**What to verify:**
- ✅ Instances scale to 5-6 (check Render dashboard)
- ✅ All requests succeed (or <5% failures)
- ✅ Average response time < 120 seconds
- ✅ No requests exceed 180 seconds

### Test 4: Scale-Down Verification

After Test 3 completes:

1. Wait 10-15 minutes
2. Check Render dashboard → Metrics → Instances
3. **Expected:** Instances should scale back down to 1

## Monitoring During Tests

### In Render Dashboard:

1. **Metrics Tab:**
   - **Instances Graph:** Watch for scaling up/down
   - **CPU Utilization:** Should trigger at 70% (scaling threshold)
   - **Memory Utilization:** Should trigger at 70% (scaling threshold)
   - **Request Rate:** Should correlate with instance count

2. **Events Tab:**
   - Look for "Scaled up to X instances" messages
   - Look for "Scaled down to X instances" messages

3. **Logs Tab:**
   - Check for errors or timeouts
   - Verify requests are being processed

### In Test Script Output:

- Success rate should be > 95%
- Average response time should be < 90 seconds
- No requests should exceed 3 minutes
- Response time distribution:
  - < 60s: Ideal (most requests)
  - 60-120s: Acceptable (some during peak)
  - > 120s: Concerning (should be rare)

## Troubleshooting

### Issue: Instances not scaling up

**Possible causes:**
- Autoscaling not enabled in Render settings
- CPU/Memory thresholds not reached (increase load or lower thresholds)
- Scaling delay (takes 1-2 minutes to detect and scale)

**Fix:**
- Verify autoscaling is enabled in Render dashboard
- Check that instance type is Standard (not Free)
- Lower target CPU to 60% if needed (in Render settings)

### Issue: Response times still 3+ minutes

**Possible causes:**
- Not enough instances scaling up (increase max instances)
- OpenAI API rate limiting (backend issue, not scaling)
- Instances still scaling (wait 2-3 minutes)

**Fix:**
- Increase max instances to 8-10 if needed
- Check OpenAI API usage/limits
- Wait for scaling to complete before judging

### Issue: Instances not scaling down

**Possible causes:**
- Normal behavior (takes 5-10 minutes to scale down)
- Still receiving traffic
- Scale-down delay configured

**Fix:**
- Wait 10-15 minutes after traffic stops
- This is normal - prevents rapid scale-up/down cycles

## Success Criteria

✅ **Autoscaling is working if:**
- Instances scale up when load increases (1 → 3-6 for 40 users)
- Instances scale down when load decreases (6 → 1 after traffic stops)
- Response times remain acceptable (< 90s average, < 180s max)
- Success rate > 95%
- No manual intervention needed

## Cost Monitoring

During testing, check your Render billing:

1. Render Dashboard → Settings → Billing
2. Monitor "Compute Hours" - should increase during test
3. Expected cost for 1-hour test with 6 instances:
   - 1 instance × 1 hour = base cost
   - 5 extra instances × 1 hour = ~$0.17 (prorated)
   - Total: ~$0.17 for the test (very cheap)

## Production Readiness Checklist

Before the research study day:

- [ ] Autoscaling tested with 40 concurrent users
- [ ] Response times verified (< 90s average)
- [ ] Scale-up time verified (< 3 minutes)
- [ ] Scale-down behavior verified (returns to 1 instance)
- [ ] No errors during load test
- [ ] Render billing/monitoring set up
- [ ] Alert notifications configured (optional)

## Testing Schedule Recommendation

**Week 1:**
- Day 1: Light load test (5-10 users)
- Day 2: Medium load test (15-20 users)
- Day 3: Heavy load test (40 users)

**Week 2:**
- Day 1: Final verification test (40 users)
- Day 2: Research study day (autoscaling handles it automatically)

This gives you time to adjust settings if needed before the actual study.


