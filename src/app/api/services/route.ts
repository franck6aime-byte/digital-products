import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, adminPassword } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du service est obligatoire' }, { status: 400 });
    }

    const existingService = await prisma.service.findUnique({
      where: { name },
    });

    if (existingService) {
      return NextResponse.json({ error: 'Ce service existe déjà' }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        adminPassword: adminPassword || 'admin', // Default if none is provided
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Failed to create service:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du service' }, { status: 500 });
  }
}
