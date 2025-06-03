# Email Logo Setup Guide

This guide explains how to upload the logo to Supabase storage and configure it for use in emails.

## Prerequisites

1. Ensure you have the following environment variables set in your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Make sure the `alumni-photos` bucket exists in your Supabase storage and is set to public.

## Steps to Upload Logo

1. **Run the upload script:**
   ```bash
   npm run upload-logo
   ```
   
   Or directly:
   ```bash
   node scripts/upload-logo-to-alumni-photos.js
   ```

2. **Copy the generated URL:**
   The script will output a public URL like:
   ```
   https://[your-project].supabase.co/storage/v1/object/public/alumni-photos/email-assets/logo-alumni.png
   ```

3. **Add to environment variables:**
   Add the URL to both your local `.env.local` and production environment:
   ```
   EMAIL_LOGO_URL=https://[your-project].supabase.co/storage/v1/object/public/alumni-photos/email-assets/logo-alumni.png
   ```

## Making the Bucket Public (if needed)

If the logo is not accessible, ensure the `alumni-photos` bucket is public:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click on the `alumni-photos` bucket
4. Go to bucket settings
5. Ensure "Public bucket" is enabled

## How It Works

1. The logo is uploaded to: `alumni-photos/email-assets/logo-alumni.png`
2. The email template (`lib/email-templates.js`) automatically uses the `EMAIL_LOGO_URL` when available
3. If no URL is set, it falls back to base64 encoding (for development)

## Testing

After setup, test by:
1. Approving a new user to trigger the welcome email
2. Check that the logo appears correctly in the email

## Troubleshooting

- **Logo not showing:** Verify the URL is accessible by opening it in a browser
- **Bucket not found:** Ensure the `alumni-photos` bucket exists
- **Permission denied:** Check that you're using the service role key, not the anon key