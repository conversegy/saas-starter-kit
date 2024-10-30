import { hashPassword } from '@/lib/auth';
import { isEmailAllowed } from '@/lib/email/utils';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateRecaptcha } from '@/lib/recaptcha';
import { createVerificationToken } from 'models/verificationToken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, `Method ${req.method} Not Allowed`);
    }

    const { name, email, password, recaptchaToken } = req.body;

    await validateRecaptcha(recaptchaToken);

    if (!isEmailAllowed(email)) {
      throw new ApiError(400, 'Please use your work email.');
    }

    const existingUser = await getUser({ email });

    if (existingUser) {
      throw new ApiError(400, 'User already exists.');
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      emailVerified: env.confirmEmail ? null : new Date(),
    });

    if (env.confirmEmail) {
      const verificationToken = await createVerificationToken(email);
      await sendVerificationEmail({ 
        user,
        verificationToken 
      });
    }

    res.status(201).json({ data: user });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}
