declare namespace NodeJS {
  interface ProcessEnv {
    BREVO_API_KEY: string;
    EMAIL_FROM: string;
    NEXT_PUBLIC_BASE_URL: string;
  }
}

interface User {
  email: string;
  verificationToken: string;
  verified: boolean;
}
