import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const all = searchParams.get('all') === 'true';
    const adminView = searchParams.get('adminView') === 'true';

    const cookieStore = await cookies();
    const isAdmin = cookieStore.get(`adminAuth_${id}`)?.value === 'true';

    const folders = await prisma.folder.findMany({
      where: { 
        serviceId: id,
        ...(all ? {} : { parentId: folderId ? folderId : null }),
        ...((isAdmin && adminView) ? {} : { isHidden: false })
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(folders);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // SÉCURITÉ : Vérification du double-verrou au niveau du serveur
    const cookieStore = await cookies();
    if (cookieStore.get(`adminAuth_${id}`)?.value !== 'true') {
      return NextResponse.json({ error: '🔐 Accès non autorisé (Dossier Verrouillé)' }, { status: 401 });
    }

    const body = await req.json();
    const { name, parentId } = body;

    const folder = await prisma.folder.create({
      data: {
        name: name || 'Nouveau Dossier',
        parentId: parentId || null,
        serviceId: id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur: ' + error.message }, { status: 500 });
  }
}
