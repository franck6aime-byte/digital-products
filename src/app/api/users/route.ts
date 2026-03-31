import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des agents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifiant, fullName, password, role, serviceId } = body;

    // Validate
    if (!identifiant || !fullName || !password || !role) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être remplis' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { identifiant },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cet identifiant est déjà utilisé' }, { status: 400 });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        identifiant,
        fullName,
        password, // In a real app, hash the password
        role,
        serviceId: serviceId || null,
      },
      include: {
        service: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'agent' }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, identifiant, fullName, password, role, serviceId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'agent manquant' }, { status: 400 });
    }

    // Check if identifiant is already taken by someone else
    if (identifiant) {
      const existingUser = await prisma.user.findFirst({
        where: { identifiant, NOT: { id } },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Cet identifiant est déjà utilisé' }, { status: 400 });
      }
    }

    // Build update data
    const updateData: any = {};
    if (identifiant) updateData.identifiant = identifiant;
    if (fullName) updateData.fullName = fullName;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (serviceId !== undefined) updateData.serviceId = serviceId || null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { service: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'agent' }, { status: 500 });
  }
}
