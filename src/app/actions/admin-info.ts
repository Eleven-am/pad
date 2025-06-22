'use server';

import { PrismaClient, UserRole } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface AdminInfo {
  name: string;
  email: string;
  isFound: boolean;
}

export async function getAdminInfo(): Promise<AdminInfo> {
  try {
    const admin = await prisma.user.findFirst({
      where: { 
        role: UserRole.ADMIN,
        OR: [
          { banned: false },
          { banned: null }
        ]
      },
      select: {
        name: true,
        email: true
      },
      orderBy: {
        createdAt: 'asc' // Get the first admin created
      }
    });

    if (admin?.name && admin?.email) {
      return {
        name: admin.name,
        email: admin.email,
        isFound: true
      };
    }

    // Fallback to placeholder if no admin found or missing info
    return {
      name: 'Jane Doe',
      email: 'contact@example.com', 
      isFound: false
    };
  } catch {
    // Fallback on any error
    return {
      name: 'Jane Doe',
      email: 'contact@example.com',
      isFound: false
    };
  }
}