import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { identifiant, password, serviceId } = await req.json();

    if (!identifiant || !password || !serviceId) {
      return NextResponse.json({ error: 'Identifiant, mot de passe et service requis.' }, { status: 400 });
    }

    // Chercher l'agent par son identifiant
    const user = await prisma.user.findUnique({
      where: { identifiant },
      include: { service: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
    }

    // Vérifier le mot de passe
    if (user.password !== password) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
    }

    // Vérifier les droits d'accès au service :
    // - SUPER_ADMIN : accès à tous les services
    // - ADMIN_SERVICE / AGENT : uniquement leur service assigné
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isAssignedToService = user.serviceId === serviceId;

    if (!isSuperAdmin && !isAssignedToService) {
      return NextResponse.json({ error: 'Accès refusé : vous n\'êtes pas affecté à ce service.' }, { status: 403 });
    }

    // Poser le cookie d'authentification pour ce service
    (await cookies()).set(`adminAuth_${serviceId}`, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60, // 12 heures
      path: '/',
    });

    return NextResponse.json({ success: true, fullName: user.fullName, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
