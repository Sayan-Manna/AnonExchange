import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), // Can be either username or email
  password: z.string(),
});
