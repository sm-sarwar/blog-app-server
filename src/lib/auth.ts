import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }

        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
                const info = await transporter.sendMail({
                    from: '"Blog app team" <blog-app@gmail.com>', // sender address
                    to: user.email, // list of recipients
                    subject: "Hello", // subject line
                    text: "Hello world?", // plain text body
                    html: `<!DOCTYPE html> 
                <html lang="en"> 
                <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Email Verification</title> </head> <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;"> <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:40px 0;"> <tr> <td align="center"> <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden;"> <!-- Header --> <tr> <td align="center" style="background:#111827; padding:30px;"> <h1 style="color:#ffffff; margin:0; font-size:28px;"> Blog App </h1> </td> </tr> <!-- Content --> <tr> <td style="padding:40px;"> <h2 style="margin-top:0; color:#111827;"> Verify Your Email Address </h2> <p style="color:#4b5563; font-size:16px; line-height:1.6;"> Thanks for signing up! Please verify your email address by clicking the button below. </p> <!-- Button --> <table cellpadding="0" cellspacing="0" style="margin:30px 0;"> <tr> <td align="center" bgcolor="#2563eb" style="border-radius:8px;"> <a href="${verificationUrl}" target="_blank" style=" display:inline-block; padding:14px 28px; font-size:16px; color:#ffffff; text-decoration:none; font-weight:bold; " > Verify Email </a> </td> </tr> </table> <p style="color:#6b7280; font-size:14px; line-height:1.6;"> If the button doesn't work, copy and paste this link into your browser: </p> <p style="word-break:break-all; color:#2563eb; font-size:14px;"> ${verificationUrl} </p> <p style="color:#9ca3af; font-size:13px; margin-top:40px;"> If you did not create an account, you can safely ignore this email. </p> </td> </tr> <!-- Footer --> <tr> <td align="center" style="background:#f9fafb; padding:20px; color:#9ca3af; font-size:13px;"> © 2026 Blog App. All rights reserved. </td> </tr> </table> </td> </tr> </table> </body> </html>`
                });

            } catch (error) {
                console.error("Error sending verification email:", error);
                throw new Error("Failed to send verification email");
            }
        },
    },
    socialProviders: {
        google: { 
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }, 
    },
});