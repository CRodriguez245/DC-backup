# Autoscaling Test Guide

## Current Setup

✅ **Autoscaling Configured on Render:**
- Min Instances: 1
- Max Instances: 6
- Target CPU: 70%
- Target Memory: 70%

✅ **New OpenAI API Key:** Active and tested

## Test Strategy

### Step 1: Baseline Test (5 users)
Verify the system works with light load:
```bash
NUM_USERS=5 node test-autoscaling.js
```
**Expected:** Should stay at 1 instance, fast responses (5-15 seconds)

### Step 2: Medium Load Test (15-20 users)
Test moderate scaling:
```bash
NUM_USERS=15 node test-autoscaling.js
```
**Expected:** May scale to 2-3 instances, response times 15-30 seconds

### Step 3: Full Load Test (40 users)
Test peak capacity (simulates research study day):
```bash
NUM_USERS=40 node test-autoscaling.js
```
**Expected:** 
- Instances should scale to 4-6
- Response times: 30-90 seconds (much better than 3+ minutes)
- Success rate >90%

## What to Monitor in Render Dashboard

**Before starting the test:**
1. Open Render Dashboard → `jamie-backend` → **Metrics** tab
2. Keep these graphs visible:
   - **Instances** (should start at 1)
   - **CPU Utilization**
   - **Memory Utilization**
   - **Request Rate**

**During the test:**
- Watch Instances graph - should see scaling up (1 → 3-6)
- Watch CPU/Memory - should spike and trigger scaling
- Watch Request Rate - should correlate with load

**After the test:**
- Instances should scale back down to 1 (takes 5-10 minutes)
- Check Events tab for "Instance Count Changed" events

## Success Criteria

✅ **Autoscaling is working if:**
- Instances scale up during load (1 → 4-6 for 40 users)
- Instances scale down after load (6 → 1)
- Response times remain acceptable (< 90s average, < 180s max)
- Success rate > 90% (some failures from rate limits may occur)
- No complete system failure

## Common Issues

**Issue: Instances not scaling up**
- Wait 1-2 minutes (scaling takes time to detect)
- Check that CPU/Memory actually spiked to 70%+
- Verify autoscaling is enabled in Render settings

**Issue: Still hitting rate limits**
- New API key may still have 30k TPM limit (need to request increase)
- Some failures are expected - success rate >90% is acceptable
- Consider implementing request queuing if needed

**Issue: Response times still 3+ minutes**
- Wait for instances to scale up (2-3 minutes)
- Check that multiple instances are actually running
- Verify requests are being distributed across instances

## Next Steps After Testing

1. **If autoscaling works well:**
   - ✅ You're ready for the research study day
   - Monitor during actual usage
   - Adjust max instances if needed

2. **If still hitting rate limits:**
   - Request OpenAI rate limit increase (free)
   - Or implement request queuing/throttling

3. **If instances not scaling:**
   - Check Render autoscaling settings
   - Verify CPU/Memory thresholds
   - Check Render logs for scaling events

