import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, fileId: string }> }) {
  try {
    const { id, fileId } = await params;

    // Récupérer les infos du fichier avant suppression (pour avoir l'URL Supabase)
    const file = await prisma.file.findFirst({
      where: { id: fileId, serviceId: id }
    });

    if (!file) {
      return NextResponse.json({ error: 'Fichier introuvable sur ce service' }, { status: 404 });
    }

    // Capture de l'URL pour le nettoyage du stockage
    const fileUrl = file.url;

    // 1. Suppression de la base de données (Priorité n°1)
    // deleteMany est plus robuste et ne plante pas si le fichier a déjà été supprimé par un autre onglet
    const deleteResult = await prisma.file.deleteMany({
      where: { id: fileId, serviceId: id }
    });

    if (deleteResult.count === 0) {
        return NextResponse.json({ error: 'Échec de la suppression en base de données' }, { status: 500 });
    }

    // 2. Nettoyage du stockage Supabase (Optionnel, ne doit pas bloquer la réponse si ça échoue)
    try {
        if (fileUrl.includes('/public/files/')) {
          const path = fileUrl.split('/public/files/')[1];
          if (path) {
            // On décode le chemin car il peut contenir des caractères spéciaux encodés
            const filePath = decodeURIComponent(path);
            await supabase.storage.from('files').remove([filePath]);
          }
        }
    } catch (storageError) {
        console.error('Bannière stockage non nettoyée:', storageError);
        // On continue quand même car la DB est propre.
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete File API Error:', error.message);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression : ' + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, fileId: string }> }) {
  try {
    const { id, fileId } = await params;
    const body = await req.json();
    const { folderId, isHidden } = body;

    const data: any = {};
    if (folderId !== undefined) data.folderId = folderId;
    if (isHidden !== undefined) data.isHidden = isHidden;

    // Mise à jour sécurisée : on vérifie que le fichier appartient bien au service
    const updatedFile = await prisma.file.update({
      where: { id: fileId, serviceId: id },
      data
    });

    return NextResponse.json(updatedFile, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur lors de la modification : ' + error.message }, { status: 500 });
  }
}
