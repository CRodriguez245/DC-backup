# Quick Steps to Run Autoscaling Test

## Before Starting

1. **Open Render Dashboard:**
   - Go to https://dashboard.render.com
   - Click on `jamie-backend` service
   - Open **Metrics** tab
   - Keep **Instances** graph visible

2. **Check Current State:**
   - Instances should show: **1** (starting point)

## Test 1: Baseline (5 users) - Quick verification

```bash
NUM_USERS=5 node test-autoscaling.js
```

**Expected:**
- Response times: 5-15 seconds
- Instances: Should stay at 1 (light load)
- Success rate: 100%

## Test 2: Medium Load (15 users) - Check scaling behavior

```bash
NUM_USERS=15 node test-autoscaling.js
```

**Expected:**
- Response times: 15-30 seconds
- Instances: May scale to 2-3
- Success rate: >95%

## Test 3: Full Load (40 users) - Peak capacity test

```bash
NUM_USERS=40 node test-autoscaling.js
```

**Expected:**
- Response times: 30-90 seconds (much better than 3+ minutes!)
- Instances: Should scale to 4-6 (watch Render dashboard)
- Success rate: >90% (some rate limit errors possible)

**What to watch in Render Dashboard:**
- Instances graph: Should go from 1 → 4-6 over 2-3 minutes
- CPU/Memory: Should spike and trigger scaling
- After test: Instances should scale back down to 1 (takes 5-10 minutes)

