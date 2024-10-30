import NextAuth from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/lib/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, authOptions);
}
