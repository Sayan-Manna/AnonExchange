import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, username: string, verifyCode: string): Promise<{ success: boolean; message?: string }> => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"AnonExchange" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Hello ${username},</h1>
          <p>Your verification code is:</p>
          <div style="
            font-size: 20px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 8px;
            display: inline-block;">
            ${verifyCode}
          </div>
          <p style="margin-top: 20px;">
            Please use this code to verify your account.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, message: "Failed to send email" };
  }
};
