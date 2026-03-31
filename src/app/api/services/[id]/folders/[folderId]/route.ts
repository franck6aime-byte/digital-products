import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, folderId: string }> }) {
  try {
    const { id, folderId } = await params;

    // Check if folder exists
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, serviceId: id }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Dossier introuvable sur ce service' }, { status: 404 });
    }

    // 1. Suppression de la base de données
    // deleteMany est plus robuste et ne plante pas si le dossier a déjà été supprimé
    const result = await prisma.folder.deleteMany({
      where: { id: folderId, serviceId: id }
    });

    if (result.count === 0) {
        return NextResponse.json({ error: 'Échec de la suppression en base de données' }, { status: 500 });
    }

    // NOTE: les fichiers rattachés et sous-dossiers ont onDelete: SetNull 
    // dans le schéma Prisma, ils seront donc "poussés" à la racine.

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Folder API Error:', error.message);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression : ' + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, folderId: string }> }) {
  try {
    const { id, folderId } = await params;
    const body = await req.json();
    const { parentId, isHidden } = body;

    // Verify parent is not the folder itself to prevent circular reference
    if (parentId !== undefined && parentId === folderId) {
       return NextResponse.json({ error: 'Le dossier ne peut pas être son propre parent' }, { status: 400 });
    }

    const data: any = {};
    if (parentId !== undefined) data.parentId = parentId;
    if (isHidden !== undefined) data.isHidden = isHidden;

    // Mise à jour sécurisée : on vérifie que le dossier appartient bien au service
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId, serviceId: id },
      data
    });

    return NextResponse.json(updatedFolder, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur lors de la modification : ' + error.message }, { status: 500 });
  }
}
