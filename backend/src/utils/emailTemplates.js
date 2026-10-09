/**
 * Generates an HTML email for Complaint Status Update
 */
const complaintStatusUpdateTemplate = ({
  residentName,
  complaintId,
  category,
  previousStatus,
  newStatus,
  note,
  complaintUrl
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const statusColor = getStatusColor(newStatus);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complaint Status Updated</title>
  </head>
  <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            🏢 Society Maintenance Tracker
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Automated Resident Notification</p>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 32px 28px;">
          <p style="font-size: 16px; margin: 0 0 16px 0;">Hello <strong>${residentName || 'Resident'}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            The status of your maintenance complaint has been updated by the society administration team.
          </p>

          <!-- Status Highlight Card -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${statusColor};">
            <table width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;">Complaint ID:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">#${complaintId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Category:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Previous Status:</td>
                <td style="padding: 6px 0; color: #64748b;">${previousStatus || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">New Status:</td>
                <td style="padding: 6px 0;">
                  <span style="background-color: ${statusColor}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; display: inline-block;">
                    ${newStatus}
                  </span>
                </td>
              </tr>
              ${note ? `
              <tr>
                <td style="padding: 10px 0 4px 0; color: #64748b; vertical-align: top;">Admin Note:</td>
                <td style="padding: 10px 0 4px 0; color: #0f172a; font-style: italic;">"${note}"</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${complaintUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
              View Complaint Details & History
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">This is an automated notification from Society Maintenance Tracker.</p>
          <p style="margin: 4px 0 0 0;">Please log in to your resident portal to view or respond.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generates an HTML email for Important Society Notice
 */
const importantNoticeTemplate = ({
  residentName,
  title,
  content,
  noticeUrl
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Important Notice from Society Management</title>
  </head>
  <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 28px; text-align: center;">
          <span style="background: rgba(255,255,255,0.2); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 8px;">
            ⚠️ High Priority Notice
          </span>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            ${title}
          </h1>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 32px 28px;">
          <p style="font-size: 16px; margin: 0 0 16px 0;">Hello <strong>${residentName || 'Resident'}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            The Society Administration has published an important announcement that requires your attention:
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 24px; color: #7f1d1d; line-height: 1.6; font-size: 14px; white-space: pre-line;">
            ${content}
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <a href="${noticeUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
              Open Society Notice Board
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">Society Maintenance Tracker Notice Broadcast.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = {
  complaintStatusUpdateTemplate,
  importantNoticeTemplate
};
