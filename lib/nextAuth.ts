import type {
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
} from 'next';
import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import BoxyHQSAMLProvider from 'next-auth/providers/boxyhq-saml';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { Provider } from 'next-auth/providers';
import { setCookie, getCookie } from 'cookies-next';
import { encode, decode } from 'next-auth/jwt';
import { randomUUID } from 'crypto';

import { Role } from '@prisma/client';
import { getAccount } from 'models/account';
import { addTeamMember, getTeam } from 'models/team';
import { createUser, getUser } from 'models/user';
import { verifyPassword } from '@/lib/auth';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { isAuthProviderEnabled } from '@/lib/auth';
import { validateRecaptcha } from '@/lib/recaptcha';
import { sendMagicLink } from '@/lib/email/sendMagicLink';
import {
  clearLoginAttempts,
  exceededLoginAttemptsThreshold,
  incrementLoginAttempts,
} from '@/lib/accountLock';
import { slackNotify } from './slack';
import { maxLengthPolicies } from '@/lib/common';
import { forceConsume } from '@/lib/server-common';

const adapter = PrismaAdapter(prisma);
const providers: Provider[] = [];
const sessionMaxAge = 30 * 24 * 60 * 60; // 30 days
const useSecureCookie = env.appUrl.startsWith('https://');

export const sessionTokenCookieName =
  (useSecureCookie ? '__Secure-' : '') + 'next-auth.session-token';

if (isAuthProviderEnabled('credentials')) {
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        recaptchaToken: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('no-credentials');
        }

        const { email, password, recaptchaToken } = credentials;

        await validateRecaptcha(recaptchaToken);

        if (!email || !password) {
          return null;
        }

        const user = await getUser({ email });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (exceededLoginAttemptsThreshold(user)) {
          throw new Error('exceeded-login-attempts');
        }

        if (env.confirmEmail && !user.emailVerified) {
          throw new Error('confirm-your-email');
        }

        const hasValidPassword = await verifyPassword(
          password,
          user?.password as string
        );

        if (!hasValidPassword) {
          if (
            exceededLoginAttemptsThreshold(await incrementLoginAttempts(user))
          ) {
            throw new Error('exceeded-login-attempts');
          }

          throw new Error('invalid-credentials');
        }

        await clearLoginAttempts(user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    })
  );
}

if (isAuthProviderEnabled('github')) {
  providers.push(
    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('google')) {
  providers.push(
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('saml')) {
  providers.push(
    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: env.jackson.selfHosted ? env.jackson.externalUrl : env.appUrl,
      clientId: 'dummy',
      clientSecret: 'dummy',
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000,
      },
    })
  );
}
if (isAuthProviderEnabled('idp-initiated')) {
  providers.push(
    CredentialsProvider({
      id: 'boxyhq-idp',
      name: 'IdP Login',
      credentials: {
        code: {
          type: 'text',
        },
      },
      async authorize(credentials) {
        const { code } = credentials || {};

        if (!code) {
          return null;
        }

        const samlLoginUrl = env.jackson.selfHosted
          ? env.jackson.url
          : env.appUrl;

        const res = await fetch(`${samlLoginUrl}/api/oauth/token`, {
          method: 'POST',
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: 'dummy',
            client_secret: 'dummy',
            redirect_url: process.env.NEXTAUTH_URL,
            code,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.status !== 200) {
          forceConsume(res);
          return null;
        }

        const json = await res.json();
        if (!json?.access_token) {
          return null;
        }

        const resUserInfo = await fetch(`${samlLoginUrl}/api/oauth/userinfo`, {
          headers: {
            Authorization: `Bearer ${json.access_token}`,
          },
        });

        if (!resUserInfo.ok) {
          forceConsume(resUserInfo);
          return null;
        }

        const profile = await resUserInfo.json();

        if (profile?.id && profile?.email) {
          return {
            name: [profile.firstName, profile.lastName]
              .filter(Boolean)
              .join(' '),
            image: null,
            ...profile,
          };
        }

        return null;
      },
    })
  );
}

if (isAuthProviderEnabled('email')) {
  providers.push(
    EmailProvider({
      server: {
        host: env.smtp.host,
        port: env.smtp.port,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.password,
        },
      },
      from: env.smtp.from,
      maxAge: 1 * 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLink(identifier, url);
      },
    })
  );
}

async function createDatabaseSession(
  user,
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
) {
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + sessionMaxAge * 1000);

  if (adapter.createSession) {
    await adapter.createSession({
      sessionToken,
      userId: user.id,
      expires,
    });
  }

  setCookie(sessionTokenCookieName, sessionToken, {
    req,
    res,
    expires,
    secure: useSecureCookie,
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const user = await getUser({ email: credentials.email });

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password as string
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return user;
      },
    }),
    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: env.jackson.selfHosted ? env.jackson.externalUrl : env.appUrl,
      clientId: 'dummy',
      clientSecret: 'dummy',
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000,
      },
    }),
    CredentialsProvider({
      id: 'boxyhq-idp',
      name: 'IdP Login',
      credentials: {
        code: {
          type: 'text',
        },
      },
      async authorize(credentials) {
        const { code } = credentials || {};

        if (!code) {
          return null;
        }

        const samlLoginUrl = env.jackson.selfHosted
          ? env.jackson.url
          : env.appUrl;

        const res = await fetch(`${samlLoginUrl}/api/oauth/token`, {
          method: 'POST',
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: 'dummy',
            client_secret: 'dummy',
            redirect_url: process.env.NEXTAUTH_URL,
            code,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.status !== 200) {
          forceConsume(res);
          return null;
        }

        const json = await res.json();
        if (!json?.access_token) {
          return null;
        }

        const resUserInfo = await fetch(`${samlLoginUrl}/api/oauth/userinfo`, {
          headers: {
            Authorization: `Bearer ${json.access_token}`,
          },
        });

        if (!resUserInfo.ok) {
          forceConsume(resUserInfo);
          return null;
        }

        const profile = await resUserInfo.json();

        if (profile?.id && profile?.email) {
          return {
            name: [profile.firstName, profile.lastName]
              .filter(Boolean)
              .join(' '),
            image: null,
            ...profile,
          };
        }

        return null;
      },
    }),
    EmailProvider({
      server: {
        host: env.smtp.host,
        port: env.smtp.port,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.password,
        },
      },
      from: env.smtp.from,
      maxAge: 1 * 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLink(identifier, url);
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};
