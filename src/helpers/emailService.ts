// src/helpers/emailService.ts
import { transporter } from "@/lib/emailTransport";
import { ApiResponse } from "@/types/ApiResponse";

// The email sending function
export async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
): Promise<void> {
  try {
    // Create a simple HTML string for the verification email
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333;">Hello, ${username}!</h1>
        <p>Your verification code is:</p>
        <div
          style="font-size: 20px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 8px; display: inline-block;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">Please use this code to verify your account.</p>
      </div>
    `;

    // Send the email using Brevo's SMTP transporter
    await transporter
      .sendMail({
        from: "user-54d9283e-52ad-4bad-b1c5-bb3419e3625e@mailslurp.biz",
        to: email,
        subject: "AnonExchange Verification Code :: ☠️",
        html: emailHTML, // Pass the HTML string as the content
      })
      .then((info) => {
        console.log("Email sent: ", info);
      })
      .catch((error) => {
        console.error("Error sending email: ", error);
      });
  } catch (error: any) {
    console.error("Error sending verification email: ", error);
  }
}
