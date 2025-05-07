import 'next-auth';

declare module 'next-auth' {
  interface Session {
    userData?: {
      userId: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userData?: {
      userId: string;
      role: string;
    };
  }
} 