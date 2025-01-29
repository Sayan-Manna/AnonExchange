// src/emails/VerificationEmail.tsx
"use server"; // Important for Server Component

export default async function VerificationEmail({
  username,
  otp,
}: {
  username: string;
  otp: string;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ color: "#333" }}>Hello, {username}!</h1>
      <p>Your verification code is:</p>
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          backgroundColor: "#f0f0f0",
          padding: "10px",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        {otp}
      </div>
      <p style={{ marginTop: "20px" }}>
        Please use this code to verify your account.
      </p>
    </div>
  );
}
