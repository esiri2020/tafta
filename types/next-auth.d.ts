import 'next-auth';

export interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  type?: string;
  email: string;
  role: string;
  profile: boolean;
  emailVerified?: Date;
  enrollments: string[];
  mobilizerId?: string | null;
}

declare module 'next-auth' {
  interface Session {
    userData?: UserData;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userData?: UserData;
  }
} 