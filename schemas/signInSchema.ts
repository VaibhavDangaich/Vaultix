import * as z from 'zod';
import { email } from 'zod/v4';

export const signInSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password should be of minimum 8 characters" })
});