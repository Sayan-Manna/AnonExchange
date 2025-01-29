import { createTransport } from "nodemailer";

// Create a reusable transporter object using SMTP transport
export const transporter = createTransport({
  host: "mailslurp.mx", // Brevo's SMTP
  port: 2525, // Use port 587 for TLS
  secure: false, // `false` for STARTTLS, `true` for SSL
  auth: {
    user: process.env.SMTP_USER, // Your Brevo SMTP user (email)
    pass: process.env.SMTP_PASSWORD, // Your Brevo SMTP password
  },
});
