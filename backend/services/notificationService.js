const { logger } = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.io = global.io;
    this.emailTransporter = this.createEmailTransporter();
  }

  // Create email transporter
  createEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send real-time notification via WebSocket
  sendRealTimeNotification(userId, notification) {
    try {
      if (!this.io) {
        logger.warn('Socket.io not available for real-time notification');
        return;
      }

      this.io.to(`user_${userId}`).emit('notification', {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...notification
      });

      logger.info('Real-time notification sent', {
        userId,
        type: notification.type,
        title: notification.title
      });
    } catch (error) {
      logger.error('Failed to send real-time notification', {
        userId,
        error: error.message
      });
    }
  }

  // Send email notification
  async sendEmailNotification(userEmail, subject, content, template = 'default') {
    try {
      const emailContent = this.generateEmailContent(template, content);
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@blockvestsocial.com',
        to: userEmail,
        subject: subject,
        html: emailContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      logger.info('Email notification sent', {
        to: userEmail,
        subject,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send email notification', {
        to: userEmail,
        error: error.message
      });
      throw new Error('Email notification failed');
    }
  }

  // Generate email content based on template
  generateEmailContent(template, content) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Blockvest Social</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Blockvest Social</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>© 2024 Blockvest Social. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return baseTemplate;
  }

  // Investment created notification
  async notifyInvestmentCreated(userId, userEmail, investmentData) {
    const notification = {
      type: 'investment_created',
      title: 'Investment Created Successfully',
      message: `Your investment request for ${investmentData.amount} ALGO has been created.`,
      data: investmentData
    };

    // Send real-time notification
    this.sendRealTimeNotification(userId, notification);

    // Send email notification
    const emailContent = `
      <h2>Investment Created Successfully</h2>
      <p>Your investment request has been created and is now available for funding.</p>
      <p><strong>Amount:</strong> ${investmentData.amount} ALGO</p>
      <p><strong>Purpose:</strong> ${investmentData.purpose}</p>
      <p><strong>Interest Rate:</strong> ${investmentData.interestRate}%</p>
      <p><strong>Duration:</strong> ${investmentData.duration} days</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${investmentData.appId}" class="button">View Investment</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Investment Created - Blockvest Social',
      emailContent,
      'investment_created'
    );
  }

  // Investment funded notification
  async notifyInvestmentFunded(borrowerId, borrowerEmail, investorId, investorEmail, investmentData) {
    // Notify borrower
    const borrowerNotification = {
      type: 'investment_funded',
      title: 'Investment Funded!',
      message: `Your investment has been funded with ${investmentData.amount} ALGO.`,
      data: investmentData
    };

    this.sendRealTimeNotification(borrowerId, borrowerNotification);

    const borrowerEmailContent = `
      <h2>Investment Funded!</h2>
      <p>Congratulations! Your investment has been funded successfully.</p>
      <p><strong>Amount Received:</strong> ${investmentData.amount} ALGO</p>
      <p><strong>Repayment Amount:</strong> ${investmentData.repaymentAmount} ALGO</p>
      <p><strong>Due Date:</strong> ${new Date(investmentData.dueDate).toLocaleDateString()}</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${investmentData.appId}" class="button">View Details</a>
    `;

    await this.sendEmailNotification(
      borrowerEmail,
      'Investment Funded - Blockvest Social',
      borrowerEmailContent,
      'investment_funded'
    );

    // Notify investor
    const investorNotification = {
      type: 'investment_made',
      title: 'Investment Made Successfully',
      message: `You have invested ${investmentData.amount} ALGO in a social investment.`,
      data: investmentData
    };

    this.sendRealTimeNotification(investorId, investorNotification);

    const investorEmailContent = `
      <h2>Investment Made Successfully</h2>
      <p>You have successfully invested in a social investment.</p>
      <p><strong>Amount Invested:</strong> ${investmentData.amount} ALGO</p>
      <p><strong>Expected Return:</strong> ${investmentData.repaymentAmount} ALGO</p>
      <p><strong>Interest Rate:</strong> ${investmentData.interestRate}%</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${investmentData.appId}" class="button">View Investment</a>
    `;

    await this.sendEmailNotification(
      investorEmail,
      'Investment Made - Blockvest Social',
      investorEmailContent,
      'investment_made'
    );
  }

  // Repayment notification
  async notifyRepaymentMade(borrowerId, borrowerEmail, investorId, investorEmail, repaymentData) {
    // Notify borrower
    const borrowerNotification = {
      type: 'repayment_made',
      title: 'Repayment Made',
      message: `You have made a repayment of ${repaymentData.amount} ALGO.`,
      data: repaymentData
    };

    this.sendRealTimeNotification(borrowerId, borrowerNotification);

    const borrowerEmailContent = `
      <h2>Repayment Made</h2>
      <p>You have successfully made a repayment on your investment.</p>
      <p><strong>Repayment Amount:</strong> ${repaymentData.amount} ALGO</p>
      <p><strong>Remaining Balance:</strong> ${repaymentData.remainingBalance} ALGO</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${repaymentData.appId}" class="button">View Details</a>
    `;

    await this.sendEmailNotification(
      borrowerEmail,
      'Repayment Made - Blockvest Social',
      borrowerEmailContent,
      'repayment_made'
    );

    // Notify investor
    const investorNotification = {
      type: 'repayment_received',
      title: 'Repayment Received',
      message: `You have received a repayment of ${repaymentData.amount} ALGO.`,
      data: repaymentData
    };

    this.sendRealTimeNotification(investorId, investorNotification);

    const investorEmailContent = `
      <h2>Repayment Received</h2>
      <p>You have received a repayment on your investment.</p>
      <p><strong>Repayment Amount:</strong> ${repaymentData.amount} ALGO</p>
      <p><strong>Total Received:</strong> ${repaymentData.totalReceived} ALGO</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${repaymentData.appId}" class="button">View Details</a>
    `;

    await this.sendEmailNotification(
      investorEmail,
      'Repayment Received - Blockvest Social',
      investorEmailContent,
      'repayment_received'
    );
  }

  // Risk assessment completed notification
  async notifyRiskAssessmentCompleted(userId, userEmail, assessmentData) {
    const notification = {
      type: 'risk_assessment_completed',
      title: 'Risk Assessment Completed',
      message: `Your risk assessment has been completed. Risk Score: ${assessmentData.riskScore}/100`,
      data: assessmentData
    };

    this.sendRealTimeNotification(userId, notification);

    const emailContent = `
      <h2>Risk Assessment Completed</h2>
      <p>Your risk assessment has been completed successfully.</p>
      <p><strong>Risk Score:</strong> ${assessmentData.riskScore}/100</p>
      <p><strong>Risk Level:</strong> ${assessmentData.riskLevel}</p>
      <p><strong>Maximum Loan Amount:</strong> ${assessmentData.maxLoanAmount} ALGO</p>
      <p><strong>Recommended Interest Rate:</strong> ${assessmentData.recommendedInterestRate}%</p>
      <br>
      <h3>Recommendations:</h3>
      <ul>
        ${assessmentData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
      <br>
      <a href="${process.env.FRONTEND_URL}/risk-analytics" class="button">View Risk Analytics</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Risk Assessment Completed - Blockvest Social',
      emailContent,
      'risk_assessment_completed'
    );
  }

  // Account verification notification
  async notifyAccountVerified(userId, userEmail) {
    const notification = {
      type: 'account_verified',
      title: 'Account Verified',
      message: 'Your account has been successfully verified.',
      data: { verified: true }
    };

    this.sendRealTimeNotification(userId, notification);

    const emailContent = `
      <h2>Account Verified</h2>
      <p>Congratulations! Your account has been successfully verified.</p>
      <p>You now have access to all features of Blockvest Social.</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments" class="button">Start Investing</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Account Verified - Blockvest Social',
      emailContent,
      'account_verified'
    );
  }

  // Payment reminder notification
  async notifyPaymentReminder(userId, userEmail, paymentData) {
    const notification = {
      type: 'payment_reminder',
      title: 'Payment Reminder',
      message: `Your payment of ${paymentData.amount} ALGO is due in ${paymentData.daysUntilDue} days.`,
      data: paymentData
    };

    this.sendRealTimeNotification(userId, notification);

    const emailContent = `
      <h2>Payment Reminder</h2>
      <p>This is a friendly reminder about your upcoming payment.</p>
      <p><strong>Payment Amount:</strong> ${paymentData.amount} ALGO</p>
      <p><strong>Due Date:</strong> ${new Date(paymentData.dueDate).toLocaleDateString()}</p>
      <p><strong>Days Until Due:</strong> ${paymentData.daysUntilDue}</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${paymentData.appId}" class="button">Make Payment</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Payment Reminder - Blockvest Social',
      emailContent,
      'payment_reminder'
    );
  }

  // Default notification
  async notifyDefault(userId, userEmail, defaultData) {
    const notification = {
      type: 'investment_defaulted',
      title: 'Investment Defaulted',
      message: `An investment has defaulted. Amount: ${defaultData.amount} ALGO`,
      data: defaultData
    };

    this.sendRealTimeNotification(userId, notification);

    const emailContent = `
      <h2>Investment Defaulted</h2>
      <p>An investment has been marked as defaulted.</p>
      <p><strong>Investment Amount:</strong> ${defaultData.amount} ALGO</p>
      <p><strong>Default Date:</strong> ${new Date(defaultData.defaultDate).toLocaleDateString()}</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/investments/${defaultData.appId}" class="button">View Details</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Investment Defaulted - Blockvest Social',
      emailContent,
      'investment_defaulted'
    );
  }

  // Welcome notification for new users
  async notifyWelcome(userId, userEmail, userData) {
    const notification = {
      type: 'welcome',
      title: 'Welcome to Blockvest Social!',
      message: 'Welcome to the decentralized social investment platform.',
      data: userData
    };

    this.sendRealTimeNotification(userId, notification);

    const emailContent = `
      <h2>Welcome to Blockvest Social!</h2>
      <p>Thank you for joining our decentralized social investment platform.</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your risk assessment</li>
        <li>Verifying your account</li>
        <li>Exploring available investments</li>
        <li>Creating your first investment request</li>
      </ul>
      <br>
      <a href="${process.env.FRONTEND_URL}/risk-assessment" class="button">Start Risk Assessment</a>
    `;

    await this.sendEmailNotification(
      userEmail,
      'Welcome to Blockvest Social',
      emailContent,
      'welcome'
    );
  }

  // Bulk notification for system announcements
  async sendBulkNotification(userIds, notification) {
    try {
      for (const userId of userIds) {
        this.sendRealTimeNotification(userId, notification);
      }

      logger.info('Bulk notification sent', {
        recipientCount: userIds.length,
        type: notification.type
      });
    } catch (error) {
      logger.error('Failed to send bulk notification', {
        error: error.message
      });
    }
  }
}

module.exports = new NotificationService(); 