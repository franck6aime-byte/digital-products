import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, adminPassword } = body;

    // Check if the service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });
    }

    // Prepare update data (only update fields that are provided)
    const updateData: any = {};
    if (name) updateData.name = name;
    if (adminPassword) updateData.adminPassword = adminPassword;

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update service:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du service: ' + error.message }, { status: 500 });
  }
}
