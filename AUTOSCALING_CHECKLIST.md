# Autoscaling Setup Checklist

## ✅ Workspace Plan (COMPLETED)
- [x] Workspace is on **Professional** plan ($19/month)
- [x] Includes "Horizontal autoscaling" feature ✅

## ⏳ Service Configuration (NEXT STEPS)

### Step 1: Check Instance Type
- [ ] Navigate to: `jamie-backend` service → Settings tab
- [ ] Find "Instance Type" section
- [ ] Current value: _______________ (Free/Standard/Pro/etc.)
- [ ] If "Free": Change to "Standard"
- [ ] If "Standard" or higher: ✅ Good to go

### Step 2: Enable Autoscaling
- [ ] In same Settings page, find "Autoscaling" section
- [ ] Enable Autoscaling: **ON**
- [ ] Set Minimum Instances: **1**
- [ ] Set Maximum Instances: **6**
- [ ] Set Target CPU Utilization: **70%**
- [ ] Set Target Memory Utilization: **70%**
- [ ] Click "Save Changes"

### Step 3: Verify
- [ ] Check "Instance Type" shows: Standard (or higher)
- [ ] Check "Autoscaling" shows: Enabled, Min: 1, Max: 6
- [ ] Service redeploys (takes ~2-3 minutes)

## Testing (After Setup)

- [ ] Run load test: `node test-autoscaling.js`
- [ ] Monitor Render Dashboard → Metrics → Instances graph
- [ ] Verify instances scale up during load (1 → 3-6)
- [ ] Verify instances scale down after load (6 → 1)

## Cost Estimate

**Monthly Base:**
- Professional workspace: $19/month
- Standard instance (1 instance): $25/month
- **Total minimum: ~$44/month**

**During peak traffic (40 users for 8 hours):**
- 6 instances max: ~$150/month (prorated, so ~$5-10 for that day)
- **Total peak day: ~$50-55**

**Average month (mix of usage):**
- **Expected: $44-69/month**

