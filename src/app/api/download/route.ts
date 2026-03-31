import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name');

  if (!fileUrl) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  try {
    // Si l'URL n'est pas Supabase, on ne peut pas la signer facilement
    if (!fileUrl.includes('.supabase.co/storage/v1/object/public/')) {
        return NextResponse.redirect(new URL(fileUrl));
    }

    // Extraire le chemin du fichier depuis l'URL publique de manière plus robuste
    // Une URL Supabase publique ressemble à : .../storage/v1/object/public/BUCKET/PATH
    const publicMarker = '/public/';
    const publicIndex = fileUrl.indexOf(publicMarker);
    
    if (publicIndex === -1) {
      return NextResponse.json({ error: 'Format URL non-Supabase' }, { status: 400 });
    }

    // On récupère tout ce qui est après /public/ (ex: files/serviceId/file.docx)
    const afterPublic = fileUrl.substring(publicIndex + publicMarker.length);
    const parts = afterPublic.split('/');
    const bucketName = parts[0]; // Le premier segment est le bucket
    const filePath = decodeURIComponent(parts.slice(1).join('/')); // Le reste est le chemin du fichier

    if (!bucketName || !filePath) {
      return NextResponse.json({ error: 'Impossible d\'extraire le chemin du fichier' }, { status: 400 });
    }

    // Générer une URL signée temporaire (60 secondes) qui FORCE le nom de téléchargement
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60, {
        download: fileName || true
      });

    if (error || !data?.signedUrl) {
      console.error('Supabase Signing Error:', error?.message);
      return NextResponse.redirect(new URL(fileUrl));
    }

    // Rediriger vers l'URL signée officielle. 
    // Le navigateur va maintenant recevoir les en-têtes directement de Supabase.
    return NextResponse.redirect(new URL(data.signedUrl));

  } catch (error: any) {
    console.error('Download Proxy Error:', error.message);
    return NextResponse.redirect(new URL(fileUrl));
  }
}
