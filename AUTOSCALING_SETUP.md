# Render Autoscaling Setup Guide

## Requirements for Autoscaling

### 1. Workspace Plan (Account Level)
You need a **paid workspace** to enable autoscaling.

**Check your workspace:**
- Go to Render Dashboard → Settings (gear icon at top) → Workspace
- Look for "Workspace Plan" or "Subscription" section
- If it says "Free", you need to upgrade to a paid plan
- Common names: Individual, Team, or other paid tiers

**Note:** The "Build Pipeline" settings you see are different - those are for CI/CD builds, not runtime autoscaling.

### 2. Service Instance Type (Service Level) - THIS IS WHERE AUTOSCALING IS
This is the important one for autoscaling! You need to go to your **SERVICE** settings, not workspace settings.

### 2. Service Instance Type (Service Level)
Your service needs to be on a **Standard** or higher instance type (not Free).

**Current status in `render.yaml`:**
- ✅ Already set to `plan: standard`

**To verify/change in Render Dashboard:**
- Go to your `jamie-backend` service → Settings
- Under "Instance Type", it should say "Standard" (not "Free")
- If it says "Free", change it to "Standard"

## Setup Steps

### Step 1: Navigate to Your Service (NOT Workspace Settings)
1. Go to Render Dashboard
2. Click on your **`jamie-backend`** service (the web service, not workspace settings)
3. Click the **"Settings"** tab in the service page

### Step 2: Check/Upgrade Service Instance Type
1. In the service Settings page, look for **"Instance Type"** section
2. It will show: Free, Starter, Standard, Pro, etc.
3. **If it says "Free"**: Click "Edit" or "Change" and select **"Standard"**
4. Save changes

**This is different from:**
- ❌ Build Pipeline settings (for CI/CD builds)
- ❌ Workspace settings (account-level)
- ✅ **Service Instance Type** (runtime compute for your app)

### Step 3: Enable Autoscaling
1. Still in the same service Settings page
2. Scroll down to **"Autoscaling"** section (should be visible if instance type is Standard or higher)
3. If you don't see it, you may need to:
   - Upgrade workspace to paid plan first (Settings → Workspace)
   - Or ensure instance type is Standard (not Free)
4. Enable Autoscaling: **ON**
5. Set:
   - Minimum Instances: **1**
   - Maximum Instances: **6**
   - Target CPU Utilization: **70%**
   - Target Memory Utilization: **70%**
6. Click "Save Changes"

## Cost Breakdown

### Workspace Cost
- Individual/Team/Performance: **$19/month** (workspace-level fee)

### Service Cost (Standard Plan)
- Base: **$25/month** per instance
- With autoscaling (1-6 instances):
  - Minimum: $25/month (1 instance)
  - Maximum: $150/month (6 instances)
  - **Prorated billing** - you only pay for what you use

### Example Monthly Cost
- **Light usage** (1 instance most of the time): ~$25 + $19 = **$44/month**
- **Peak day** (6 instances for 8 hours): ~$25 + $19 + $5 (prorated extra instances) = **$49/month**
- **Average month** (mix of 1-3 instances): ~$25-50 + $19 = **$44-69/month**

## Verification

After setup, verify autoscaling is enabled:
1. Render Dashboard → Click **`jamie-backend`** service → **Settings** tab
2. Check "Instance Type" shows: **Standard** (not Free)
3. Check "Autoscaling" section shows:
   - ✅ Enabled: Yes
   - Min: 1, Max: 6
   - Target CPU: 70%
   - Target Memory: 70%

**If you can't find Autoscaling settings:**
- Make sure you're in the **SERVICE** settings (jamie-backend → Settings), not Workspace settings
- Make sure Instance Type is Standard (not Free)
- Make sure your workspace is on a paid plan (Settings → Workspace)

## Troubleshooting

**"Autoscaling not available" error:**
- ✅ Upgrade workspace to paid plan (Individual/Team/Performance)
- ✅ Change service instance type from Free to Standard

**"Can't find autoscaling settings":**
- Make sure workspace is upgraded (paid plan)
- Make sure service is on Standard or higher instance type
- Refresh the page

