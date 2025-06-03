import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AWS_SES_CONFIG, EMAIL_CONFIG } from './email-config.js';
import { welcomeEmailTemplate } from './email-templates.js';

// Create SES client
const sesClient = new SESClient(AWS_SES_CONFIG);

// Generic email sending function
export const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  try {
    const params = {
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlContent
          },
          Text: {
            Charset: "UTF-8",
            Data: textContent
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject
        }
      },
      Source: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      ReplyToAddresses: [EMAIL_CONFIG.replyToEmail]
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    
    console.log(`Email sent successfully to ${to}. MessageId: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// Send welcome email when user is approved
export const sendWelcomeEmail = async (userData) => {
  try {
    const { email } = userData;
    const { subject, htmlContent, textContent } = welcomeEmailTemplate(userData);
    
    const result = await sendEmail({
      to: email,
      subject,
      htmlContent,
      textContent
    });

    if (result.success) {
      console.log(`Welcome email sent to ${email}`);
    } else {
      console.error(`Failed to send welcome email to ${email}:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { success: false, error: error.message };
  }
};

// Test email function for debugging
export const sendTestEmail = async (toEmail) => {
  try {
    const testData = {
      email: toEmail,
      full_name: 'Test User',
      batch_start: 2010,
      batch_end: 2015
    };

    return await sendWelcomeEmail(testData);
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message };
  }
};