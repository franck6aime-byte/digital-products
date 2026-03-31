import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Nettoyage complet de tous les cookies de session
    cookieStore.set('session_token', '', { expires: new Date(0), path: '/' });
    cookieStore.set('user_role', '', { expires: new Date(0), path: '/' });
    cookieStore.set('user_name', '', { expires: new Date(0), path: '/' });

    return NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
