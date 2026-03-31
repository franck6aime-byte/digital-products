import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const adminView = searchParams.get('adminView') === 'true';

    const cookieStore = await cookies();
    const isAdmin = cookieStore.get(`adminAuth_${id}`)?.value === 'true';

    const files = await prisma.file.findMany({
      where: { 
        serviceId: id,
        folderId: folderId ? folderId : null,
        ...((isAdmin && adminView) ? {} : { isHidden: false })
      },
      include: { uploader: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(files);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: serviceId } = await params;
    
    // SÉCURITÉ : Vérification du double-verrou au niveau du serveur
    const cookieStore = await cookies();
    if (cookieStore.get(`adminAuth_${serviceId}`)?.value !== 'true') {
      return NextResponse.json({ error: '🔐 Accès non autorisé (Dépôt Bloqué)' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;
    const uploaderId = cookieStore.get('session_token')?.value;

    if (!file) return NextResponse.json({ error: 'Pas de fichier' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = file.name.replace(/\s+/g, '_');
    const fileName = `${Date.now()}-${safeFileName}`;
    const filePath = `${serviceId}/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, { contentType: file.type });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    const doc = await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        url: publicUrl,
        size: file.size,
        mimeType: file.type,
        serviceId,
        folderId: folderId || null,
        uploaderId: uploaderId || null,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur: ' + error.message }, { status: 500 });
  }
}
