import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

const maxLengthPolicies = { name: 50 };

export const normalizeUser = (user) => {
  if (user?.name) {
    user.name = user.name.substring(0, maxLengthPolicies.name);
  }
  return user;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
}) => {
  return await prisma.user.create({
    data: normalizeUser(data),
  });
};

export const updateUser = async ({ where, data }) => {
  data = normalizeUser(data);
  return await prisma.user.update({
    where,
    data,
  });
};

export const getUser = async (key: { id: string } | { email: string }) => {
  const user = await prisma.user.findUnique({
    where: key,
  });
  return normalizeUser(user);
};

export const getUserBySession = async (session: Session | null) => {
  if (!session?.user?.id) {
    return null;
  }
  return await getUser({ id: session.user.id });
};

export const deleteUser = async (key: { id: string } | { email: string }) => {
  return await prisma.user.delete({
    where: key,
  });
};
