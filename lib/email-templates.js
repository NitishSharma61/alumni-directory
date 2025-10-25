// Email templates for alumni directory
import { getCachedLogoBase64 } from './logo-base64.js';
import { EMAIL_CONFIG } from './email-config.js';

// Get logo URL based on environment
function getLogoUrl() {
  // Option 1: Use environment variable if set (for production with CDN/hosted logo)
  if (process.env.EMAIL_LOGO_URL) {
    return process.env.EMAIL_LOGO_URL;
  }
  
  // Option 2: Use base64 embedded logo for development/fallback
  const base64Logo = getCachedLogoBase64();
  if (base64Logo) {
    return base64Logo;
  }
  
  // Option 3: Use production URL if NEXT_PUBLIC_APP_URL is not localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  if (!appUrl.includes('localhost')) {
    return `${appUrl}/logo-alumni.png`;
  }
  
  // Fallback: return empty string if no valid option
  console.warn('No valid logo URL available for email');
  return '';
}

export const welcomeEmailTemplate = (userData) => {
  const { full_name, batch_start, batch_end } = userData;
  const logoUrl = getLogoUrl();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JNV Pandoh Alumni Network</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 20px !important; }
      .logo { width: 100px !important; }
      h1 { font-size: 24px !important; }
      .button { padding: 12px 24px !important; font-size: 16px !important; }
    }
    
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a !important; }
      .container { background-color: #2a2a2a !important; }
      .content { background-color: #2a2a2a !important; color: #ffffff !important; }
      h1, h2, h3, p { color: #ffffff !important; }
      .text-muted { color: #cccccc !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      ${logoUrl ? `<img src="${logoUrl}" alt="JNV Pandoh Alumni" class="logo" style="width: 120px; height: auto; max-width: 100%;">` : '<h2 style="color: #0066ff; margin: 0;">JNV Pandoh Alumni Network</h2>'}
    </div>

    <!-- Main Content -->
    <div class="content" style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
      <h1 style="color: #0066ff; margin: 0 0 20px 0; font-size: 28px; font-weight: 600; text-align: center;">
        Welcome to the Alumni Network!
      </h1>

      <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
        Dear ${full_name},
      </p>

      <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
        Congratulations! Your account has been approved and you are now part of the <strong>JNV Pandoh Alumni Network</strong>.
      </p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #333333; font-size: 16px; margin: 0;">
          <strong>Your Alumni Details:</strong><br>
          Name: ${full_name}<br>
          Batch: ${batch_start} - ${batch_end}<br>
          Status: <span style="color: #00c896; font-weight: 600;">Approved ✓</span>
        </p>
      </div>

      <h2 style="color: #0066ff; font-size: 20px; margin: 30px 0 15px 0;">What you can do now:</h2>
      
      <ul style="color: #333333; font-size: 16px; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Browse and connect with fellow alumni</li>
        <li style="margin-bottom: 10px;">Update your profile with professional information</li>
        <li style="margin-bottom: 10px;">Add your photo and social media links</li>
        <li style="margin-bottom: 10px;">Search alumni by batch year or location</li>
        <li style="margin-bottom: 10px;">Network and stay connected with your batchmates</li>
      </ul>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           class="button"
           style="display: inline-block; background-color: #0066ff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; transition: background-color 0.3s;">
          Visit Alumni Directory
        </a>
      </div>

      <div style="border-top: 1px solid #e5e5e5; margin-top: 40px; padding-top: 30px;">
        <h3 style="color: #0066ff; font-size: 18px; margin-bottom: 15px;">Quick Links:</h3>
        <p style="color: #333333; font-size: 14px; margin: 10px 0;">
          📝 <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/edit" style="color: #0066ff; text-decoration: none;">Complete Your Profile</a><br>
          👥 <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #0066ff; text-decoration: none;">Browse Alumni Directory</a><br>
          ❓ <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #0066ff; text-decoration: none;">Contact Support</a>
        </p>
      </div>

      <p style="color: #666666; font-size: 14px; margin-top: 30px; text-align: center;" class="text-muted">
        We're excited to have you as part of our growing alumni community!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
      <p style="color: #666666; font-size: 14px; margin: 5px 0;" class="text-muted">
        JNV Pandoh Alumni Network<br>
        Hami Navodaya Ho
      </p>
      <p style="color: #999999; font-size: 12px; margin: 10px 0;">
        This is an automated message. Please do not reply to this email.<br>
        For support, contact us at ${EMAIL_CONFIG.supportEmail}
      </p>
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
Welcome to JNV Pandoh Alumni Network!

Dear ${full_name},

Congratulations! Your account has been approved and you are now part of the JNV Pandoh Alumni Network.

Your Alumni Details:
- Name: ${full_name}
- Batch: ${batch_start} - ${batch_end}
- Status: Approved ✓

What you can do now:
- Browse and connect with fellow alumni
- Update your profile with professional information
- Add your photo and social media links
- Search alumni by batch year or location
- Network and stay connected with your batchmates

Visit the Alumni Directory: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Quick Links:
- Complete Your Profile: ${process.env.NEXT_PUBLIC_APP_URL}/profile/edit
- Browse Alumni Directory: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
- Contact Support: ${process.env.NEXT_PUBLIC_APP_URL}/contact

We're excited to have you as part of our growing alumni community!

Best regards,
JNV Pandoh Alumni Network
Hami Navodaya Ho

This is an automated message. Please do not reply to this email.
For support, contact us at ${EMAIL_CONFIG.supportEmail}
`;

  return {
    subject: '🎉 Welcome to JNV Pandoh Alumni Network - Account Approved!',
    htmlContent,
    textContent
  };
};


