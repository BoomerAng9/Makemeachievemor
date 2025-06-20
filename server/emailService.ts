import { Resend } from 'resend';

interface EmailNotificationData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private resend: Resend | null = null;
  private fromEmail = 'ACHIEVEMOR <noreply@achievemor.io>';
  private isConfigured = false;

  constructor() {
    this.initializeEmailProvider();
  }

  private initializeEmailProvider() {
    // Priority 1: Resend (Modern, developer-friendly)
    if (process.env.RESEND_API_KEY) {
      try {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.isConfigured = true;
        console.log('Email service initialized with Resend');
        return;
      } catch (error) {
        console.warn('Failed to initialize Resend:', error);
      }
    }

    // Fallback for legacy SendGrid users
    if (process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid detected but Resend is preferred. Consider migrating to Resend for better developer experience.');
    }

    console.warn('No email service configured. Email notifications will be logged instead.');
    console.log('To enable emails, set RESEND_API_KEY in your environment variables');
  }

  async sendRegistrationNotification(user: any): Promise<boolean> {
    const adminEmail = 'contactus@achievemor.io';
    
    const emailData: EmailNotificationData = {
      to: adminEmail,
      subject: `New User Registration - ${user.firstName} ${user.lastName}`,
      text: `
New User Registration - ACHIEVEMOR Platform

User Details:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- User ID: ${user.id}
- Registration Date: ${new Date().toLocaleString()}
- Account Status: Active (Auto-approved)

The user has been granted immediate access to the platform dashboard.
Verification will begin when they upload documents.

Please review this registration in the Admin Panel.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ACHIEVEMOR</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">New User Registration</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">New User Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">User ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${user.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Registration Date:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Account Status:</td>
                  <td style="padding: 8px 0;"><span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active (Auto-approved)</span></td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;">
                <strong>Note:</strong> The user has been granted immediate access to the platform dashboard. 
                Document verification will begin when they upload their credentials.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://achievemor.io/admin" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review in Admin Panel
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
              This is an automated notification from the ACHIEVEMOR platform.<br>
              For support, contact us at contactus@achievemor.io
            </p>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  async sendDocumentVerificationAlert(user: any, documents: any[]): Promise<boolean> {
    const adminEmail = 'contactus@achievemor.io';
    
    const documentList = documents.map(doc => `- ${doc.documentType} (${doc.originalFileName})`).join('\n');
    
    const emailData: EmailNotificationData = {
      to: adminEmail,
      subject: `Document Verification Required - ${user.firstName} ${user.lastName}`,
      text: `
Document Verification Required - ACHIEVEMOR Platform

User Details:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- User ID: ${user.id}

Documents Uploaded:
${documentList}

Please review these documents within 48 hours for verification.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ACHIEVEMOR</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Document Verification Required</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">User: ${user.firstName} ${user.lastName}</h2>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #e65100;">
                <strong>Action Required:</strong> Documents uploaded and awaiting verification within 48 hours.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Documents to Review:</h3>
              ${documents.map(doc => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                  <span>${doc.documentType}</span>
                  <span style="color: #666; font-size: 12px;">${doc.originalFileName}</span>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://achievemor.io/admin" 
                 style="background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review Documents
              </a>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  private async sendEmail(emailData: EmailNotificationData): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.resend) {
        console.log('📧 EMAIL NOTIFICATION (No provider configured):');
        console.log(`To: ${emailData.to}`);
        console.log(`Subject: ${emailData.subject}`);
        console.log(`Content: ${emailData.text}`);
        console.log('---');
        return true; // Don't break application flow
      }

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [emailData.to],
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      if (error) {
        console.error('Resend API error:', error);
        return false;
      }

      console.log(`Email sent successfully via Resend: ${data?.id}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();