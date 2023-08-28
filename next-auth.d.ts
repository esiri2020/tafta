import { JWT } from "next-auth/jwt"
import NextAuth, { UserData, Session } from "next-auth"
import type { User } from '@prisma/client'
import { DefaultSession } from "next-auth"

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface User extends User {
    firstName?: string;
    lastName?: string;
    password: string;
    role?: string;
    profile?: any;
  }
  type UserData = {
    userId: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    role?: string,
    profile?: boolean
  }
  interface Session extends DefaultSession {
    userData?: UserData;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    // userRole?: "admin",
    userData?: UserData
  } 
}

