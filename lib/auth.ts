import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import {prisma} from "@/lib/prisma"//your prisma instance




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
        },
    },
    emailAndPassword: { 
    enabled: true, 
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
