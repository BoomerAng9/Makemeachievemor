import { MailService } from '@sendgrid/mail';

interface EmailNotificationData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private mailService: MailService | null = null;
  private fromEmail = 'noreply@achievemor.io';

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      this.mailService = new MailService();
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
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

  async sendContactFormNotification(data: { to: string; name: string; email: string; phone: string; note: string }): Promise<boolean> {
    const emailData: EmailNotificationData = {
      to: data.to,
      subject: `New Contact Form Submission - ACHIEVEMOR`,
      text: `
New Contact Form Submission - ACHIEVEMOR Platform

Contact Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Submission Date: ${new Date().toLocaleString()}

Message:
${data.note}

This is a potential lead for partnership opportunities.
Please respond to the inquirer at: ${data.email}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ACHIEVEMOR</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">New Contact Form Submission</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
              <h3 style="margin: 0; color: #155724;">Potential Lead Alert</h3>
              <p style="margin: 5px 0 0 0; color: #155724;">This contact form submission represents a potential partnership opportunity.</p>
            </div>
            
            <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #007bff;">${data.email}</a></p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <h2 style="color: #333;">Message</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.note}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${data.email}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to Lead</a>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  async sendChatbotLeadNotification(data: { to: string; userMessage: string; userContext?: string; timestamp: Date }): Promise<boolean> {
    const emailData: EmailNotificationData = {
      to: data.to,
      subject: `Chatbot Lead Alert - ACHIEVEMOR`,
      text: `
Chatbot Lead Alert - ACHIEVEMOR Platform

A user has engaged with the chatbot and may be interested in partnership opportunities.

User Message:
${data.userMessage}

${data.userContext ? `User Context:\n${data.userContext}` : ''}

Timestamp: ${data.timestamp.toLocaleString()}

This interaction indicates potential interest in ACHIEVEMOR services.
Consider reaching out for follow-up engagement.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ACHIEVEMOR</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Chatbot Lead Alert</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
              <h3 style="margin: 0; color: #856404;">Chatbot Engagement</h3>
              <p style="margin: 5px 0 0 0; color: #856404;">A user has shown interest through chatbot interaction.</p>
            </div>
            
            <h2 style="color: #333; margin-top: 0;">User Interaction</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.userMessage}</p>
            </div>
            
            ${data.userContext ? `
            <h2 style="color: #333; margin-top: 20px;">Additional Context</h2>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.userContext}</p>
            </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p><strong>Timestamp:</strong> ${data.timestamp.toLocaleString()}</p>
              <p style="color: #666; font-size: 14px;">This interaction indicates potential interest in ACHIEVEMOR services. Consider reaching out for follow-up engagement.</p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  private async sendEmail(emailData: EmailNotificationData): Promise<boolean> {
    try {
      if (!this.mailService) {
        console.log('SendGrid not configured. Email notification logged:', emailData.subject);
        console.log('To:', emailData.to);
        console.log('Content:', emailData.text);
        return false;
      }

      await this.mailService.send({
        to: emailData.to,
        from: this.fromEmail,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log('Email sent successfully:', emailData.subject);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();