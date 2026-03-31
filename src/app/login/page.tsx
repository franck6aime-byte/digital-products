'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Search, FolderSync, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role === 'SUPER_ADMIN') {
          router.push('/superadmin');
        } else {
          router.push('/portal');
        }
        router.refresh();
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <div className="login-layout">
        <div className="login-left">
          <div className="login-left-content">
            <img 
              src="/embleme-ci.png" 
              alt="Ministère et Emblème" 
              style={{ 
                width: '100%', 
                maxWidth: '380px', 
                height: 'auto', 
                marginBottom: '2rem', 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                objectFit: 'cover' 
              }} 
            />
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>
              Gestion & Centralisation Administrative
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '4rem', maxWidth: '80%' }}>
              Au service des agents pour une administration plus efficace. Ensemble, centralisons la gestion de vos fichiers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <Users color="white" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>COLLABORATION</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Soutien direct et travail en équipe des agents.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <FolderSync color="white" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>RÉPERTOIRE LOCAL</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Créations centralisées de tous les services.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <Search color="white" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>ACCESSIBILITÉ</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Recherche instantanée et consultation 24/7.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <ShieldCheck color="white" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>PROTECTION</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Garantie de la confidentialité et sécurité élevée.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div style={{ width: '100%', maxWidth: '360px' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <img 
                  src="/logo-digitalboostai.png" 
                  alt="Logo" 
                  style={{ 
                    width: '180px', 
                    height: 'auto', 
                    margin: '0 auto 1.5rem', 
                    display: 'block',
                    objectFit: 'contain'
                  }} 
                />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Bienvenue sur le Réseau<br/>Inter-Services de la DR MCNSLP TONKPI</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>Portail d'Accès Administratif</p>
              </div>

              {error && (
                <div style={{ padding: '0.75rem', borderLeft: '3px solid #ef4444', backgroundColor: '#fee2e2', color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    NOM DE L'AGENT
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Kouamé Jean"
                    className="form-input"
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                      MOT DE PASSE PERSONNEL
                    </label>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <input type="checkbox" id="remember" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                  <label htmlFor="remember" style={{ fontSize: '0.85rem', color: '#475569' }}>Rester connecté</label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '1rem' }}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                  Difficultés de connexion ?<br/>Contactez le support technique ou votre administrateur de site.
                </p>
              </div>
            </div>
          </div>

          <div className="login-footer">
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: '0.5rem' }}>SERVICES INTERNES RÉGIONAUX</p>
              <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>
                © 2026 GESTION ADMINISTRATIVE. DIRECTION RÉGIONALE DE LA COHÉSION NATIONALE, DE LA SOLIDARITÉ ET DE LA LUTTE CONTRE LA PAUVRETÉ DU TONKPI.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
              <a href="#" className="footer-link">MENTIONS LÉGALES</a>
              <a href="#" className="footer-link">POLITIQUE DE CONFIDENTIALITÉ</a>
              <a href="#" className="footer-link">CONTACT</a>
              <a href="#" className="footer-link">PORTAIL DIRECTION RÉGIONALE</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
