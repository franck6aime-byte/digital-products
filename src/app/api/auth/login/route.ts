import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { password, identifiant } = await req.json();

    // Recherche de l'utilisateur par son identifiant (nom)
    const user = await prisma.user.findUnique({
      where: { identifiant }
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiant introuvable ou incorrect' }, { status: 404 });
    }

    // Vérification basique (en production, utiliser bcrypt.compare)
    if (password === user.password) {
      // Configuration de la session utilisateur sécurisée
      (await cookies()).set('session_token', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 heures (plus sécurisé)
        path: '/',
      });
      
      // Stockage info basique coté client pour le header
      (await cookies()).set('user_role', user.role, {
        httpOnly: false,
        path: '/',
      });
      (await cookies()).set('user_name', user.fullName, {
        httpOnly: false,
        path: '/',
      });

      return NextResponse.json({ success: true, role: user.role });
    }

    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur interne au serveur' }, { status: 500 });
  }
}
