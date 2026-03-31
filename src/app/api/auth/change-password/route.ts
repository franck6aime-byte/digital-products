import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { identifiant, oldPassword, newPassword, serviceId } = await req.json();

    if (!identifiant || !oldPassword || !newPassword || !serviceId) {
      return NextResponse.json({ error: 'Tous les champs (identifiant, ancien et nouveau mot de passe) sont obligatoires.' }, { status: 400 });
    }

    // 1. Chercher l'agent par son identifiant
    const user = await prisma.user.findUnique({
      where: { identifiant },
      include: { service: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Compte introuvable pour cet identifiant.' }, { status: 404 });
    }

    // 2. Vérifier que l'ancien mot de passe est correct
    if (user.password !== oldPassword) {
      return NextResponse.json({ error: 'L\'ancien mot de passe est incorrect.' }, { status: 401 });
    }

    // 3. Vérifier que l'agent a bien le droit de modifier le mot de passe dans le contexte de ce service
    // Seul le SUPER_ADMIN ou un agent affecté à ce service peut utiliser cette modal
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isAssignedToService = user.serviceId === serviceId;

    if (!isSuperAdmin && !isAssignedToService) {
      return NextResponse.json({ error: 'Vous n\'êtes pas autorisé(e) à modifier ce compte depuis ce service.' }, { status: 403 });
    }

    // 4. Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    // 5. Optionnel : Renouveler le cookie d'authentification de la zone service
    (await cookies()).set(`adminAuth_${serviceId}`, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60, // 12 heures
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue lors du traitement.' }, { status: 500 });
  }
}
