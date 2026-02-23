import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "noreply@accessoriesworld.co.zw";
const FROM_NAME = "Accessories World";

/** Send a generic email */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

/** Send welcome email to a new admin account with their credentials */
export async function sendNewAccountEmail(
  email: string,
  name: string,
  password: string,
  isAdmin: boolean
) {
  const role = isAdmin ? "Administrator" : "Staff Member";
  const loginUrl =
    process.env.ADMIN_URL ?? "http://localhost:3001";

  return sendEmail({
    to: email,
    subject: `Your Accessories World ${role} Account`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Accessories World</h1>
        </div>
        <div style="padding: 32px; background: #f9fafb;">
          <h2 style="margin-top: 0;">Welcome, ${name}!</h2>
          <p>Your <strong>${role}</strong> account has been created. Here are your login credentials:</p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 4px 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
          </div>
          <p>Please change your password after your first login.</p>
          <a href="${loginUrl}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Sign In to Dashboard
          </a>
        </div>
        <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Accessories World Zimbabwe</p>
        </div>
      </div>
    `,
  });
}

/** Send contact form confirmation to the user */
export async function sendContactConfirmation(data: {
  name: string;
  email: string;
  message: string;
}) {
  return sendEmail({
    to: data.email,
    subject: "We received your message - Accessories World",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Accessories World</h1>
        </div>
        <div style="padding: 32px; background: #f9fafb;">
          <h2 style="margin-top: 0; color: #111827;">Hi ${data.name},</h2>
          <p style="color: #374151; line-height: 1.6;">
            Thank you for reaching out! We've received your message and will get back to you as soon as possible.
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">Your Message:</p>
            <p style="color: #374151; white-space: pre-wrap; margin: 0;">${data.message}</p>
          </div>
          <p style="color: #374151; line-height: 1.6;">
            Best regards,<br><strong>Accessories World Team</strong>
          </p>
        </div>
        <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px; background: #f9fafb;">
          <p style="margin: 4px 0;">📍 49-51 Second Street, Mutare, Zimbabwe</p>
          <p style="margin: 4px 0;">📞 +263 78 492 3973</p>
          <p style="margin: 4px 0;">📧 info@accessoriesworld.co.zw</p>
          <p style="margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Accessories World Zimbabwe</p>
        </div>
      </div>
    `,
  });
}

/** Send contact form notification to the business */
export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const adminEmail =
    process.env.CONTACT_EMAIL ?? process.env.SMTP_USER ?? "info@accessoriesworld.co.zw";

  return sendEmail({
    to: adminEmail,
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Submission</h1>
        </div>
        <div style="padding: 32px; background: #f9fafb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td><td>${data.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${data.email}</td></tr>
            ${data.phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${data.phone}</td></tr>` : ""}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="font-weight: bold; margin-top: 0;">Message:</p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      </div>
    `,
  });
}

/** Generate a strong random password */
export function generatePassword(length = 8): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  // Ensure at least one of each type
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const password = [
    upper[bytes[0]! % upper.length],
    lower[bytes[1]! % lower.length],
    digits[bytes[2]! % digits.length],
    special[bytes[3]! % special.length],
  ];

  for (let i = 4; i < length; i++) {
    password.push(all[bytes[i]! % all.length]!);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = bytes[i % bytes.length]! % (i + 1);
    [password[i], password[j]] = [password[j]!, password[i]!];
  }

  return password.join("");
}
