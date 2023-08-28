import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google"
// import FacebookProvider from "next-auth/providers/facebook"
// import GithubProvider from "next-auth/providers/github"
// import TwitterProvider from "next-auth/providers/twitter"
// import Auth0Provider from "next-auth/providers/auth0"
// import AppleProvider from "next-auth/providers/apple"
import EmailProvider from "next-auth/providers/email";
// import prisma from "../../../lib/prismadb"
import { compare } from "bcryptjs";
import { createTransport } from "nodemailer";
import prisma from "../../../lib/prismadb";
import { html, text } from "../../../utils";
import { Theme } from "next-auth";
// import sendVerificationRequest from '../../../lib/sendVerificationRequest';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const theme: Theme = {
  colorScheme: "light",
  logo: "",
  brandColor: "#FF7A00",
  buttonText: "#FFF",
};

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  jwt: {
    maxAge: 60 * 60 * 12,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@email.com" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
            // throw new Error('No email address or password');
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { profile: true },
          });
          if (!user) {
            return null;
            // throw new Error('No user found with the email');
          }
          const checkPassword = await compare(
            credentials.password,
            user.password
          );
          //Correct password - send response
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
        host: process.env.HOST,
        port: parseInt(process.env.PORT ? process.env.PORT : "2525"),
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false },
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
          _url.searchParams.get("callbackUrl")?.split("/").pop() || "";
        const transport = createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, theme, type }),
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
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.email !== null) {
          token.userData = {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profile: user.profile ? true : false,
          };
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token) {
        return { userData: token.userData, ...session };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
