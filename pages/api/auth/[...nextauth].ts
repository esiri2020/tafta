import NextAuth from 'next-auth/next';
import type { AuthOptions } from 'next-auth/core/types';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { compare } from 'bcryptjs';
import { createTransport } from 'nodemailer';
import prisma from '../../../lib/prismadb';
import { html, text } from '../../../utils';
// import {Theme} from 'next-auth';
// import sendVerificationRequest from '../../../lib/sendVerificationRequest';
import type { Session, UserData } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const theme = {
  colorScheme: 'light',
  logo: '',
  brandColor: '#FF7A00',
  buttonText: '#FFF',
};

export const authOptions: AuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
  },
  jwt: {
    maxAge: 60 * 60 * 12,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { profile: true },
          });
          if (!user) {
            return null;
          }
          const checkPassword = await compare(
            credentials.password,
            user.password,
          );
          if (checkPassword) {
            return user;
          }
          return null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const _url = new URL(url);
        const { host } = _url;
        const type =
          _url.searchParams.get('callbackUrl')?.split('/').pop() || '';
        // Only delete previous tokens if this is a resend (resend=true in query)
        if (_url.searchParams.get('resend') === 'true') {
          await prisma.verificationToken.deleteMany({
            where: { identifier: email },
          });
        }
        const transport = createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, type }),
        });
      },
    }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    /* Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    */
  ],
  theme: {
    colorScheme: 'light',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        // Fetch enrollments for the user
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userCohort: {
              include: {
                enrollments: true,
              },
            },
          },
        });

        // Only include enrollment IDs as strings to avoid BigInt serialization issues
        let enrollmentIds: string[] = [];
        if (dbUser && dbUser.userCohort) {
          enrollmentIds = dbUser.userCohort.flatMap(uc =>
            uc.enrollments
              .filter(e => e.id !== null && e.id !== undefined)
              .map(e => String(e.id))
          );
        }

        token.userData = {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          type: user.type,
          email: user.email,
          role: user.role,
          profile: user.profile ? true : false,
          emailVerified: user.emailVerified,
          enrollments: enrollmentIds,
        } as UserData;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.userData = token.userData;
        return session;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
