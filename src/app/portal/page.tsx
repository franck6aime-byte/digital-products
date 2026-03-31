export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FolderOpen, Settings, Users, FileText, Database, Shield } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

// Fonction pour déterminer l'icône, la couleur et L'IMAGE RÉALISTE selon le nom du service
const getServiceConfig = (name: string) => {
  const nameUpper = name.toUpperCase();
  if (nameUpper.includes('SECRETARIAT')) return { icon: <FileText size={24} />, colorClass: 'text-gradient-blue', image: '/images/service_secretariat.png' };
  if (nameUpper.includes('HUMANITAIRE')) return { icon: <Users size={24} />, colorClass: 'text-gradient-emerald', image: '/images/service_humanitaire.png' };
  if (nameUpper.includes('OSCS')) return { icon: <Database size={24} />, colorClass: 'text-gradient-emerald', image: '/images/service_oscs.png' };
  if (nameUpper.includes('TRAITE')) return { icon: <Shield size={24} />, colorClass: 'text-gradient-emerald', image: '/images/service_traite.png' };
  
  return { icon: <FolderOpen size={24} />, colorClass: 'text-gradient-emerald', image: '/gov_bg.png' };
};

export default async function PortalHome() {
  const cookieStore = await cookies();
  const userName = cookieStore.get('user_name')?.value || 'Agent';
  const userRole = cookieStore.get('user_role')?.value || 'AGENT';

  const services = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfd' }}>
      
      {/* 🛡️ PROTECTION HEADER (NEW) */}
      <header className="chariow-header" style={{ padding: '0.75rem 2rem' }}>
        <div className="chariow-logo">
           <div style={{ background: 'var(--emerald-grad-start)', color: 'white', padding: '0.4rem', borderRadius: '10px' }}>
              <Shield size={20} />
           </div>
           <span style={{ fontSize: '1.2rem' }}>PORTAIL DR-MCNSLP</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>{userName.toUpperCase()}</span>
              <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>{userRole === 'SUPER_ADMIN' ? 'SUPER-ADMINISTRATEUR' : 'AGENT HABILITÉ'}</span>
           </div>
           <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }}></div>
           <LogoutButton />
        </div>
      </header>

      {/* HEADER / HERO SECTION */}
      <div style={{ padding: '4rem 2rem 3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', zIndex: -1 }}></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '999px', border: '1px solid rgba(226,232,240,0.8)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-soft)' }}>
          <Shield size={18} color="#059669" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#1e293b', textTransform: 'uppercase' }}>Portail Haute Sécurité</span>
        </div>
        
        <h1 className="font-outfit" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Gouvernance Numérique<br />
          <span className="text-gradient-emerald">Des Services Administratifs</span>
        </h1>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>
          Bienvenue sur le portail de la<br />Direction Régionale de la Cohésion Nationale,<br />de la Solidarité et de la lutte contre la Pauvreté du Tonkpi
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--slate-500)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Sélectionnez le service que vous souhaitez consulter ou administrer. L'accès aux zones d'administration est strictement protégé par un double verrouillage système.
        </p>
      </div>

      {/* GRID SECTION */}
      <div style={{ flex: 1, padding: '0 2rem 6rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {services.length === 0 ? (
          <div className="premium-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🚧</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>Système en attente</h3>
            <p style={{ color: 'var(--slate-500)' }}>Aucun service administratif n'a été configuré. Le Super-Administrateur doit en créer depuis l'Espace d'Administration Général.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2.5rem'
          }}>
            {services.map((service) => {
              const config = getServiceConfig(service.name);
              
              return (
                <div key={service.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                  
                  {/* Image Banner Header */}
                  <div style={{ 
                    height: '180px', 
                    width: '100%', 
                    backgroundImage: `url('${config.image}')`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    position: 'relative' 
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0) 100%)' }}></div>
                    
                    {/* Floating Icon Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '-24px', 
                      left: '1.5rem', 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                      border: '1px solid var(--border)',
                      zIndex: 10
                    }}>
                      <div className={config.colorClass}>
                        {config.icon}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div style={{ padding: '2.5rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'rgba(255,255,255,0.6)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>Département</p>
                    <h3 className="font-outfit" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.2, marginBottom: '2rem' }}>{service.name}</h3>

                    {/* Boutons d'action (Using native CSS classes instead of React JS hover events) */}
                    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Link href={`/service/${service.id}/consult`} className="btn-consult">
                        Consulter
                      </Link>
                      
                      <Link href={`/service/${service.id}/admin`} className="btn-manage">
                        <Settings size={18} />
                        Gérer
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
