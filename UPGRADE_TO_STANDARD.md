# Upgrading from Starter to Standard for Autoscaling

## Current Status
- ✅ Workspace: Professional plan (has autoscaling feature)
- ❌ Service Instance Type: **Starter** (needs to be Standard for autoscaling)

## Why Standard is Needed
- Starter plan: Limited autoscaling or no autoscaling
- Standard plan: Full autoscaling support (min/max instances)

## Upgrade Steps (2 minutes)

### Step 1: Upgrade Instance Type
1. In Render Dashboard → `jamie-backend` service → Settings tab
2. Find "Instance Type" section
3. Click **"Update"** button
4. Select **"Standard"** from the dropdown
   - Standard: 0.5 CPU, 1 GB RAM (base level)
   - This is the minimum for autoscaling
5. Click "Save Changes" or "Update"

### Step 2: Wait for Redeploy
- Service will redeploy (takes 2-3 minutes)
- Brief downtime possible during transition

### Step 3: Enable Autoscaling
Once Standard is active:
1. Still in Settings tab
2. Find "Autoscaling" section (should now be visible)
3. Enable Autoscaling: **ON**
4. Configure:
   - Minimum Instances: **1**
   - Maximum Instances: **6**
   - Target CPU: **70%**
   - Target Memory: **70%**
5. Save Changes

## Cost Impact

**Current (Starter):**
- ~$7/month per instance

**After Upgrade (Standard):**
- ~$25/month base (1 instance)
- With autoscaling (1-6 instances): $25-150/month (prorated)
- **Most of the time:** $25/month (1 instance)
- **Peak day (6 instances for 8 hours):** ~$30-35 for that day

**Monthly estimate:**
- Light usage: ~$25 + $19 (workspace) = **$44/month**
- Peak day included: ~$30-35 + $19 = **$49-54/month**

## Next Steps After Upgrade

1. ✅ Verify Standard instance is active
2. ✅ Enable autoscaling (min: 1, max: 6)
3. ✅ Run load test: `node test-autoscaling.js`
4. ✅ Monitor scaling behavior in Render Metrics

