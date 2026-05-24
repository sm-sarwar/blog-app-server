import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { UserRoles } from "../middlewares/auth";

async function seedAdmin() {
    try {
        console.log("**********ADMIN SEEDING STARTED**********")
        const adminData = {
            name: process.env.ADMIN_NAME!,
            email: process.env.ADMIN_EMAIL!,
            role: UserRoles.ADMIN,
            password: process.env.ADMIN_PASSWORD!
        }

        console.log("*******Checking admin exist or not*********")
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })

        if (existingUser) {
            throw new Error("Admin user already exists");
        }

        const signupAdmin = await auth.api.signUpEmail({
            body: adminData
        })
        console.log("*******Admin user created successfully*********")

        if (signupAdmin.user) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
            console.log("*******Admin email verified successfully*********")
        }
        console.log("**********ADMIN SEEDING COMPLETED**********")

    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
}

seedAdmin()