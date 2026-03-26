import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import {prisma} from "@/lib/prisma"//your prisma instance
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);



export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    session: {
        // Keep users logged in for 30 days; refresh on each visit
        expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
        updateAge: 60 * 60 * 24,       // refresh token if older than 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30, // match expiry
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "STUDENT",
            },
            onboarded: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            isSuspended: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
        },
    },
    emailAndPassword: { 
    enabled: true, 
    requireEmailVerification: true,
  }, 
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`\n\n=== EMAIL VERIFICATION FOR ${user.email} ===\n`);
      console.log(`Click this link to verify your email:\n${url}`);
      console.log(`\n============================================\n\n`);
      
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            // Ensure this verified domain matches your Resend account, or use onboarding@resend.dev for local testing to yourself
            from: "Campus Helper <onboarding@resend.dev>",
            to: user.email,
            subject: "Verify your email address",
            html: `<p>Hi ${user.name},</p><p>Welcome to Campus Helper! Please click <a href="${url}">here</a> to verify your email address.</p>`,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }
      }
    },
  },
  socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    },
      google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  }, 
});
