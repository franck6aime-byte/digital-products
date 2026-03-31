import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { serviceId } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'ID de service requis' }, { status: 400 });
    }

    // Effacer le cookie de session administrative spécifique au service
    (await cookies()).set(`adminAuth_${serviceId}`, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immédiatement
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur interne au serveur' }, { status: 500 });
  }
}
