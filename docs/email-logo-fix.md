# Email Logo Display Fix

## Problem
The logo in emails is not showing because it's trying to load from `localhost:3000`, which is not accessible from the internet or email clients.

## Solutions Implemented

### 1. Base64 Embedded Logo (Immediate Fix)
The email template now automatically embeds the logo as base64 data when running locally. This ensures the logo displays in all email clients without requiring external access.

### 2. Environment Variable Support
You can set `EMAIL_LOGO_URL` in your environment variables to use a publicly hosted logo URL.

### 3. Automatic Production URL
When `NEXT_PUBLIC_APP_URL` is set to a production URL (not localhost), it will automatically use that URL for the logo.

## How to Use

### For Local Development
No action needed! The logo will automatically be embedded as base64.

### For Production (Recommended Options)

#### Option 1: Use Vercel/Your Hosting Platform
1. Deploy your app to Vercel or your hosting platform
2. Update `.env.local` or Vercel environment variables:
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

#### Option 2: Upload Logo to Supabase Storage
1. Run the upload script:
   ```bash
   node scripts/upload-logo-to-supabase.js
   ```
2. Add the returned URL to your environment variables:
   ```
   EMAIL_LOGO_URL=https://your-supabase-url/storage/v1/object/public/email-assets/logo-alumni.png
   ```

#### Option 3: Use a CDN
1. Upload `logo-alumni.png` to a CDN (Cloudinary, AWS S3, etc.)
2. Add the CDN URL to your environment variables:
   ```
   EMAIL_LOGO_URL=https://your-cdn.com/logo-alumni.png
   ```

## Testing
1. To test the base64 logo locally:
   ```bash
   node test-email-logo.js
   ```
   Then open `test-logo-email.html` in your browser.

2. To send a test email:
   ```bash
   # Add this to your API or run via console
   import { sendTestEmail } from './lib/email-service.js';
   await sendTestEmail('your-email@example.com');
   ```

## Benefits of This Approach
- **Reliability**: Logo always displays, even in strict email clients
- **No External Dependencies**: Base64 embedding works offline
- **Flexible**: Supports multiple deployment scenarios
- **Performance**: CDN/hosted logos load faster in production