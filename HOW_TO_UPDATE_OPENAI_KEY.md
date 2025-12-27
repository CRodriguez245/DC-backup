# How to Update OpenAI API Key

## Overview

The OpenAI API key is loaded from the environment variable `OPENAI_API_KEY` in the file:
- `jamie-backend/utils/openai.ts` (TypeScript source)
- `jamie-backend/utils/openai.js` (compiled JavaScript)

**Important:** The frontend (Vercel) does NOT need the OpenAI API key - only the backend (Render) needs it. The frontend just sends requests to the backend.

No code changes needed - just update the environment variable in two places (local + Render).

---

## Step 1: Update for Local Development

### Create/Update `.env` file

1. In the `jamie-backend` folder, create or edit `.env` file:
   ```
   jamie-backend/.env
   ```

2. Add or update the line:
   ```
   OPENAI_API_KEY=sk-your-new-api-key-here
   ```

**Important:**
- The `.env` file should be in the `jamie-backend` folder (not root)
- Make sure `.env` is in `.gitignore` (don't commit API keys!)

### Verify it's in .gitignore

Check that `jamie-backend/.env` is listed in `.gitignore`:
```bash
cat .gitignore
# Should include .env or jamie-backend/.env
```

---

## Step 2: Update for Production (Render)

**Note:** Vercel (frontend) does NOT need the OpenAI API key. Only Render (backend) needs it.

### Option A: Render Dashboard (Easier)

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your `jamie-backend` service
3. Click **"Environment"** tab (or "Settings" → "Environment")
4. Find the environment variable named `OPENAI_API_KEY`
5. Click **"Edit"** or the pencil icon
6. Paste your new API key
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 2-3 minutes)

### Option B: render.yaml (Alternative)

If you want to manage it via `render.yaml`, add it to the `envVars` section:

```yaml
services:
  - type: web
    name: jamie-backend
    env: node
    plan: standard
    numInstances: 1
    buildCommand: cd jamie-backend && npm install
    startCommand: cd jamie-backend && npm start
    rootDir: jamie-backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: OPENAI_API_KEY
        value: sk-your-new-api-key-here  # ⚠️ SECURITY: Consider using secret management instead
```

**⚠️ WARNING:** Storing API keys directly in `render.yaml` means they'll be in your git repository, which is a security risk. **Option A (Dashboard) is safer.**

---

## Step 3: Test

### Local Testing

1. Restart your local server:
   ```bash
   cd jamie-backend
   npm start
   ```

2. Test with a request - check that it works

### Production Testing

1. Wait for Render to finish redeploying (2-3 minutes)
2. Test by making a request to your production endpoint
3. Check Render logs to verify it's using the new key

---

## Where the Key is Used

The API key is loaded in:
- `jamie-backend/utils/openai.ts` (line 5):
  ```typescript
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  ```

No code changes needed - just update the environment variable!

---

## Security Best Practices

1. ✅ **Never commit API keys to git**
2. ✅ **Use Render Dashboard** (Option A) instead of `render.yaml` for API keys
3. ✅ **Rotate keys regularly** if you suspect they're compromised
4. ✅ **Use different keys** for development vs production (optional but recommended)

---

## Troubleshooting

### Local: "API key not found"
- Check that `.env` file exists in `jamie-backend/` folder
- Check that the file contains `OPENAI_API_KEY=sk-...`
- Restart your server after creating/updating `.env`

### Production: "API key not found"
- Check Render Dashboard → Environment tab
- Verify `OPENAI_API_KEY` is set (value will be hidden/masked)
- Make sure Render finished redeploying (check Deploys tab)

### Production: "Invalid API key"
- Double-check you copied the full key (starts with `sk-`)
- Make sure there are no extra spaces or quotes
- Verify the new key is active in OpenAI dashboard

