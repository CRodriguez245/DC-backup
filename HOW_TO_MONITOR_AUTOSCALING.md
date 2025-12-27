# How to Monitor Autoscaling in Render

## Where to Find the Instances Graph

### Step 1: Navigate to Metrics Tab
1. Go to Render Dashboard
2. Click on **`jamie-backend`** service
3. Click the **"Metrics"** tab at the top (NOT "Events" or "Logs")

### Step 2: Find the Instances Graph
In the Metrics tab, you should see several graphs. Look for:
- **"Instances"** graph
- This shows the number of running instances over time

## What the Graphs Show

### Instances Graph
- **X-axis**: Time
- **Y-axis**: Number of instances (1-6)
- **What to watch**: Line should start at 1, then go up to 3-6 during load test, then back down to 1

### CPU Utilization Graph
- Shows CPU usage percentage
- Should spike during load test
- When it hits 70%, triggers autoscaling

### Memory Utilization Graph
- Shows memory usage percentage
- Should increase during load test
- When it hits 70%, triggers autoscaling

### Request Rate Graph
- Shows requests per second
- Should correlate with instance count

## Events Tab (Different from Metrics)

The list you saw is from the **Events** tab. Useful events to filter for:
- **"Instance Count Changed"** - Shows when instances scaled
- **"Autoscaling Started"** - Shows when autoscaling kicked in
- **"Autoscaling Ended"** - Shows when autoscaling completed

But for **real-time monitoring during tests**, use the **Metrics** tab with graphs.

## Quick Navigation Summary

✅ **For graphs (real-time monitoring):**
- Service → **Metrics** tab → Instances graph

✅ **For event history (what happened):**
- Service → **Events** tab → Filter by "Instance Count Changed"

## During Test

1. Open **Metrics** tab BEFORE running test
2. Look at **Instances** graph
3. Run test: `NUM_USERS=40 node test-autoscaling.js`
4. Watch Instances graph in real-time:
   - Should start at 1
   - After 1-2 minutes: Scale up to 3-6
   - During test: Stay at 3-6
   - After test ends: Scale back down to 1 (takes 5-10 minutes)

