# What to Check in Render Dashboard After Test

## Expected Activity

Even though the test was quick (5 seconds), you should see:

### 1. Metrics Tab - Graphs
- **Request Rate**: Should show a spike around the time you ran the test
- **CPU Utilization**: Should show a brief spike (even if small)
- **Memory Utilization**: Should show activity
- **Instances**: Might stay at 1 (5 users may not trigger scaling)

### 2. Logs Tab
- Should show the 5 POST requests to `/chat`
- Should show OpenAI API calls being made
- Should show responses being generated

### 3. Events Tab
- Might show "Instance Count Changed" if it scaled (unlikely with 5 users)
- Should show some activity/requests

## If You Don't See ANY Activity

This could mean:
1. **Requests didn't reach Render** - Check if backend URL is correct
2. **Graphs haven't updated yet** - Render metrics can take 30-60 seconds to appear
3. **Wrong time window** - Make sure you're looking at the right time period in graphs

## How to Check

1. **Go to Metrics tab**:
   - Look at Request Rate graph - do you see a spike around when we ran the test?
   - Look at CPU/Memory graphs - any activity?

2. **Go to Logs tab**:
   - Scroll to recent logs
   - Do you see 5 POST requests to `/chat`?
   - Do you see OpenAI API activity?

3. **Check the time**:
   - Make sure the graph time range includes "now" or the last few minutes
   - Refresh the page if needed

