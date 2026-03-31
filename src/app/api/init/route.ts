import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 0. Configurer le stockage Supabase (Toujours vérifier au cas où)
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'files');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('files', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      } else {
        // Optionnel : s'assurer qu'il est public même s'il existait déjà
        await supabase.storage.updateBucket('files', { public: true });
      }
    } catch (storageErr) {
      console.warn('Storage Initialization Warning:', storageErr);
    }

    const settings = await prisma.settings.findFirst();
    if (settings?.isInitialized) {
      return NextResponse.json({ message: 'Stockage vérifié et Base de données déjà initialisée' });
    }

    // 1. Marquer comme initialisé
    await prisma.settings.create({
      data: { isInitialized: true },
    });

    // 2. Créer les services par défaut
    const defaultServices = [
      'SECRETARIAT',
      'OSCS',
      'LUTTE CONTRE LA TRAITE DES PERSONNES',
      'SOLIDARITE ET ACTION HUMANITAIRE'
    ];

    for (const serviceName of defaultServices) {
      await prisma.service.upsert({
        where: { name: serviceName },
        update: {},
        create: { name: serviceName }
      });
    }

    // 3. Créer le compte Super-Administrateur par défaut
    await prisma.user.create({
      data: {
        identifiant: 'Admin',
        fullName: 'Super Administrateur',
        password: 'admin', // En production, utiliser bcrypt pour hacher
        role: 'SUPER_ADMIN'
      }
    });
    
    return NextResponse.json({ message: 'Plateforme configurée. Compte admin créé (Admin / admin) et stockage initialisé.' });
  } catch (error: any) {
    console.error('INIT ERROR:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'initialisation', details: error?.message || String(error) }, { status: 500 });
  }
}
