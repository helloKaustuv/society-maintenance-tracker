const { createTransporter } = require('../config/email');
const { complaintStatusUpdateTemplate, importantNoticeTemplate } = require('../utils/emailTemplates');
const db = require('../config/db');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.EMAIL_FROM || '"Society Management" <noreply@societymaintenance.com>';

/**
 * Sends an email notification to a resident when complaint status changes
 */
const sendComplaintStatusNotification = async ({
  residentEmail,
  residentName,
  complaintId,
  category,
  previousStatus,
  newStatus,
  note
}) => {
  try {
    if (!residentEmail) {
      console.warn('[EmailService] No resident email provided for complaint status update.');
      return;
    }

    const transporter = await createTransporter();
    const complaintUrl = `${CLIENT_URL}/complaints/${complaintId}`;

    const htmlContent = complaintStatusUpdateTemplate({
      residentName,
      complaintId,
      category,
      previousStatus,
      newStatus,
      note,
      complaintUrl
    });

    const mailOptions = {
      from: FROM_EMAIL,
      to: residentEmail,
      subject: `Complaint #${complaintId} status updated: [${newStatus}]`,
      text: `Hello ${residentName || 'Resident'},\n\nYour complaint #${complaintId} (${category}) status was updated from ${previousStatus || 'Open'} to ${newStatus}.\n${note ? `Admin Note: ${note}\n` : ''}\nView details at: ${complaintUrl}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Status change email dispatched to ${residentEmail} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    // Non-blocking error handling - core operations will not crash
    console.error('[EmailService Error] Failed to send status notification:', error.message);
  }
};

/**
 * Broadcasts an email to all residents when an important notice is posted
 */
const broadcastImportantNotice = async ({ title, content, noticeId }) => {
  try {
    const transporter = await createTransporter();
    const noticeUrl = `${CLIENT_URL}/notices`;

    // Fetch all active residents
    const residentsResult = await db.query(
      "SELECT name, email FROM users WHERE role = 'resident' AND email IS NOT NULL"
    );

    const residents = residentsResult.rows || [];
    if (residents.length === 0) {
      console.log('[EmailService] No residents found to broadcast notice.');
      return;
    }

    console.log(`[EmailService] Broadcasting important notice "${title}" to ${residents.length} residents...`);

    // Dispatch concurrently with Promise.allSettled
    const sendPromises = residents.map((resident) => {
      const htmlContent = importantNoticeTemplate({
        residentName: resident.name,
        title,
        content,
        noticeUrl
      });

      return transporter.sendMail({
        from: FROM_EMAIL,
        to: resident.email,
        subject: `⚠️ IMPORTANT NOTICE: ${title}`,
        text: `Important Notice: ${title}\n\n${content}\n\nView notice board at: ${noticeUrl}`,
        html: htmlContent
      });
    });

    const results = await Promise.allSettled(sendPromises);
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`[EmailService] Notice broadcast complete: ${succeeded}/${residents.length} sent successfully.`);
  } catch (error) {
    console.error('[EmailService Error] Failed to broadcast important notice:', error.message);
  }
};

module.exports = {
  sendComplaintStatusNotification,
  broadcastImportantNotice
};
