# Quick Autoscaling Setup - Step by Step

## Where to Find Autoscaling (Important!)

**You're currently looking at Build Pipeline settings - that's for builds, not runtime autoscaling!**

For autoscaling, you need to go to your **SERVICE** settings, not workspace or build pipeline settings.

## Exact Navigation Steps

### Step 1: Go to Your Backend Service
1. Render Dashboard (render.com)
2. In the left sidebar, under "Services", click **`jamie-backend`**
   - (This is your web service, not the workspace)

### Step 2: Open Settings Tab
1. Once on the `jamie-backend` service page
2. Click the **"Settings"** tab at the top

### Step 3: Find Instance Type Section
1. Scroll down in Settings
2. Look for **"Instance Type"** section
3. It should show something like:
   - "Free"
   - "Starter" 
   - "Standard"
   - "Pro"
   - etc.

**What you're looking for:**
- If it says "Free" → Change to "Standard" (click Edit/Change)
- If it already says "Standard" or higher → You're good!

### Step 4: Find Autoscaling Section
1. Still in the same Settings page
2. Scroll down further
3. Look for **"Autoscaling"** section
4. If you don't see it:
   - Your instance type might be "Free" (autoscaling requires Standard+)
   - Your workspace might need to be upgraded to paid

### Step 5: Enable Autoscaling
1. In the Autoscaling section:
   - Toggle **"Enable Autoscaling"** to ON
   - Set **Min Instances**: 1
   - Set **Max Instances**: 6
   - Set **Target CPU**: 70%
   - Set **Target Memory**: 70%
2. Click **"Save Changes"**

## What If You Don't See Autoscaling?

**Possible reasons:**
1. **Instance Type is "Free"**
   - Solution: Change Instance Type to "Standard" first

2. **Workspace is on Free plan**
   - Solution: Settings → Workspace → Upgrade to paid plan

3. **You're in the wrong place**
   - Make sure you're in: Service → Settings (not Workspace → Settings)
   - Make sure it's the `jamie-backend` service, not build pipeline settings

## Summary

✅ **Right place:** `jamie-backend` service → Settings tab → Instance Type & Autoscaling sections
❌ **Wrong place:** Workspace Settings or Build Pipeline settings

The Build Pipeline you're looking at is just for faster builds - it doesn't affect runtime autoscaling at all!

