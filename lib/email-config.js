// AWS SES Configuration
export const AWS_SES_CONFIG = {
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
}

export const EMAIL_CONFIG = {
  fromEmail: 'support@bidsetu.com',  // Using verified SES domain from gemsetu
  fromName: 'JNV Pandoh Alumni Network',
  replyToEmail: 'support@bidsetu.com',
  supportEmail: 'support@bidsetu.com'
}