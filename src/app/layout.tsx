import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portail Administratif | DR-MCNSLP Tonkpi',
  description: 'Système interne de gestion et de centralisation administrative de la Direction Régionale de la Cohésion Nationale, de la Solidarité et de la lutte contre la Pauvreté du Tonkpi.',
  keywords: 'Direction Régionale Tonkpi, MCNSLP, Cohésion Nationale, Solidarité, Lutte contre la Pauvreté, Côte d\'Ivoire, Gestion Administrative, Portail Interne',
  openGraph: {
    title: 'Portail Administratif | DR-MCNSLP Tonkpi',
    description: 'Plateforme de gestion et de centralisation des services administratifs régionaux.',
    url: 'https://gcatonkpi.vercel.app',
    siteName: 'GCA Tonkpi',
    images: [
      {
        url: '/embleme-ci.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portail Administratif | DR-MCNSLP Tonkpi',
    description: 'Plateforme de gestion administrative régionale sécurisée.',
    images: ['/embleme-ci.png'],
  },
  verification: {
    google: 'KfOVMQpCt2aeAxcwVENMGpUrrcxgw0748YQ0xltvFmg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
