import { compare, hash } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import env from './env';
import type { AUTH_PROVIDER } from 'types';
import { getUser } from '@/models/user';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
  return env.authProviders?.split(',').includes(provider) || false;
}

export function authProviderEnabled() {
  return {
    google: isAuthProviderEnabled('google'),
    email: isAuthProviderEnabled('email'),
    credentials: isAuthProviderEnabled('credentials'),
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await getUser({ email: credentials.email });
        if (!user) return null;
        
        const isValid = await verifyPassword(credentials.password, user.password || '');
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }),
    ...(isAuthProviderEnabled('google') ? [
      GoogleProvider({
        clientId: env.google.clientId || '',
        clientSecret: env.google.clientSecret || '',
      })
    ] : []),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
