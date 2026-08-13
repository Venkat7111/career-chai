const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const FROM = process.env.MAIL_FROM || 'careerwithchaithanya@gmail.com';
const APP_NAME = 'Career With Chaithanya';

// ─── HTML email wrapper ────────────────────────────────────────
const wrap = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6fb; margin:0; padding:0; }
    .container { max-width:560px; margin:40px auto; background:#fff; border-radius:12px;
                 box-shadow:0 2px 16px rgba(0,0,0,0.08); overflow:hidden; }
    .header { background:linear-gradient(135deg,#6c63ff,#48cfad); padding:32px 40px; }
    .header h1 { color:#fff; margin:0; font-size:22px; font-weight:700; }
    .header p  { color:rgba(255,255,255,0.85); margin:4px 0 0; font-size:13px; }
    .body { padding:32px 40px; color:#333; line-height:1.7; }
    .body h2 { color:#6c63ff; margin-top:0; }
    .badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:13px;
             font-weight:600; margin:8px 0; }
    .badge-green  { background:#e8fff3; color:#22c55e; }
    .badge-red    { background:#fff0f0; color:#ef4444; }
    .badge-orange { background:#fff8ee; color:#f59e0b; }
    .footer { background:#f9f9f9; padding:16px 40px; text-align:center;
              color:#888; font-size:12px; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
      <p>Learn. Complete. Grow.</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${APP_NAME} &mdash; This is an automated message.
    </div>
  </div>
</body>
</html>`;

// ─── Send helper ───────────────────────────────────────────────
const send = async ({ to, subject, html }) => {
  if (!process.env.MAIL_USERNAME) {
    console.log(`[EMAIL SKIPPED – no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: `"${APP_NAME}" <${FROM}>`, to, subject, html });
};

// ─── Templates ────────────────────────────────────────────────
const sendApprovalEmail = (user) =>
  send({
    to: user.email,
    subject: `Your account has been approved – ${APP_NAME}`,
    html: wrap('Account Approved 🎉', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your account has been reviewed and <span class="badge badge-green">APPROVED</span>.</p>
      <p>You can now log in and access the platform to explore tasks, track your progress, and grow your career.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p style="margin-top:24px;">Welcome aboard!</p>
    `),
  });

const sendRejectionEmail = (user) =>
  send({
    to: user.email,
    subject: `Account Registration Update – ${APP_NAME}`,
    html: wrap('Account Status Update', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We regret to inform you that your account application has been <span class="badge badge-red">REJECTED</span>.</p>
      <p>If you believe this is a mistake or have any questions, please contact us at
         <a href="mailto:${FROM}">${FROM}</a>.</p>
    `),
  });

const sendRevokeEmail = (user) =>
  send({
    to: user.email,
    subject: `Account Access Revoked – ${APP_NAME}`,
    html: wrap('Access Revoked', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your account access has been <span class="badge badge-orange">REVOKED</span> by the administrator.</p>
      <p>If you have questions, please contact us at <a href="mailto:${FROM}">${FROM}</a>.</p>
    `),
  });

const sendAssignmentRemovedEmail = ({ user, task, reason, removedAt }) =>
  send({
    to: user.email,
    subject: `Task Assignment Removed – ${APP_NAME}`,
    html: wrap('Assignment Removed', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your assignment for the following task has been removed:</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px;background:#f9f9f9;font-weight:600;">Task</td>
            <td style="padding:8px;">${task.title}</td></tr>
        <tr><td style="padding:8px;background:#f9f9f9;font-weight:600;">Removed On</td>
            <td style="padding:8px;">${new Date(removedAt).toLocaleString()}</td></tr>
        ${reason ? `<tr><td style="padding:8px;background:#f9f9f9;font-weight:600;">Reason</td>
            <td style="padding:8px;">${reason}</td></tr>` : ''}
      </table>
      <p>If you have questions, please contact us at <a href="mailto:${FROM}">${FROM}</a>.</p>
    `),
  });

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendRevokeEmail,
  sendAssignmentRemovedEmail,
};
