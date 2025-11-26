const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { getRedisClient } = require('../lib/redis');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  // Add connection pooling for better performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10, // Max 10 emails per second
});

// Function to read email template
function readEmailTemplate(templateName) {
  const templatePath = path.join(process.cwd(), 'utils', templateName);
  return fs.readFileSync(templatePath, 'utf8');
}

// Function to send notification email
async function sendNotificationEmail(jobData) {
  const {
    recipientEmail,
    recipientName,
    notificationType,
    notificationData,
  } = jobData;

  let template;
  let subject;

  // Select template based on notification type
  switch (notificationType) {
    case 'APPLICANT':
      template = readEmailTemplate('applicant-notification.html');
      subject = 'TAFTA Notification';
      break;
    case 'STAFF':
      template = readEmailTemplate('staff-alert.html');
      subject = 'Staff Alert Notification';
      break;
    default:
      template = readEmailTemplate('applicant-notification.html');
      subject = 'Notification Update';
  }

  // Replace placeholders in template
  const emailContent = template
    .replace('[Company Logo]', process.env.COMPANY_LOGO_URL || '')
    .replace('[Company Name]', process.env.COMPANY_NAME || 'TAFTA')
    .replace('[Applicant Name]', recipientName)
    .replace('[Staff Name]', recipientName)
    .replace('[Application ID]', notificationData.relatedEntityId || '')
    .replace('[Status]', notificationData.title || '')
    .replace('[Date]', new Date().toLocaleDateString())
    .replace('[Notification Details]', notificationData.message || '')
    .replace('[Alert Type]', notificationData.title || '')
    .replace('[Priority Level]', notificationData.priority || 'Normal')
    .replace('[Date and Time]', new Date().toLocaleString())
    .replace('[Alert Description]', notificationData.message || '')
    .replace('[Required Action]', notificationData.action || 'Please review')
    .replace('[View Application Button]', notificationData.actionUrl || '#')
    .replace('[View Details Button]', notificationData.actionUrl || '#');

  // Send email
  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: subject,
    html: emailContent,
  });

  return result;
}

// Create Redis connection
const redis = getRedisClient();

// Create BullMQ worker
const notificationEmailWorker = new Worker(
  'notification-emails',
  async (job) => {
    const { notificationId, recipientId } = job.data;
    
    console.log(`📧 Processing email job for notification ${notificationId}, recipient ${recipientId}`);
    
    try {
      // Send the email
      await sendNotificationEmail(job.data.emailData);
      
      console.log(`✅ Email sent successfully to ${job.data.emailData.recipientEmail}`);
      
      return {
        success: true,
        messageId: job.id,
        recipientEmail: job.data.emailData.recipientEmail,
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${job.data.emailData.recipientEmail}:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // Per second (to respect SMTP rate limits)
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  }
);

// Event handlers
notificationEmailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

notificationEmailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

notificationEmailWorker.on('error', (err) => {
  console.error('❌ Notification email worker error:', err);
});

console.log('🚀 Notification Email Worker started');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down notification email worker...');
  await notificationEmailWorker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down notification email worker...');
  await notificationEmailWorker.close();
  process.exit(0);
});

module.exports = { notificationEmailWorker };

