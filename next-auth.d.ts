import {JWT} from 'next-auth/jwt';
import NextAuth from 'next-auth';
import type {User as PrismaUser} from '@prisma/client';
import {DefaultSession} from 'next-auth';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth' {
  /**
   * Extends the built-in User type
   */
  interface User extends Omit<PrismaUser, keyof DefaultSession['user']> {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    type?: string;
    password: string;
    role?: string;
    profile?: any;
  }

  /**
   * Custom UserData type for session
   */
  interface UserData {
    userId: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    type?: string;
    email?: string;
    role?: string;
    profile?: boolean;
  }

  /**
   * Extends the built-in Session type
   */
  interface Session extends DefaultSession {
    userData?: UserData;
    user?: DefaultSession['user'];
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type
   */
  interface JWT {
    userData?: UserData;
  }
}

export type {Session, User, UserData};
