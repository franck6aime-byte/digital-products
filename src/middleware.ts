import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('session_token');
  const path = request.nextUrl.pathname;

  // 1. Redirection optionnelle : (Supprimée car l'utilisateur souhaite toujours voir la page de login)

  // 2. Protection globale (Login obligatoire pour tout sauf exceptions)
  if (!isAuthenticated && !path.startsWith('/login') && !path.startsWith('/api') && !path.startsWith('/_next') && path !== '/favicon.ico' && !path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Protection de l'espace Super-Admin
  if (path.startsWith('/superadmin') && request.cookies.get('user_role')?.value !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // 3. Double-Verrouillage (Mot de passe de Service)
  // On cible toutes les pages d'administration d'un service
  if (path.includes('/admin') && !path.includes('/admin/login')) {
    // Extraction simplifiée et robuste du serviceId
    const parts = path.split('/');
    const serviceIdx = parts.indexOf('service');
    if (serviceIdx !== -1 && parts[serviceIdx + 2] === 'admin') {
       const serviceId = parts[serviceIdx + 1];
       const isAdminAuth = request.cookies.has(`adminAuth_${serviceId}`);
       
       if (!isAdminAuth) {
         // Blocage immédiat et redirection vers le verrou du service
         return NextResponse.redirect(new URL(`/service/${serviceId}/admin/login`, request.url));
       }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
