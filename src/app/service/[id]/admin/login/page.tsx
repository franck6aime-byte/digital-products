'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiant || !password) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, password, serviceId: params?.id }),
      });

      if (res.ok) {
        window.location.href = `/service/${params?.id}/admin`;
      } else {
        const data = await res.json();
        setError(data.error || 'Identifiant ou mot de passe incorrect.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative background blobs */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

      {/* Header */}
      <header style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'flex-start', position: 'relative', zIndex: 1 }}>
        <Link href="/portal" style={{ textDecoration: 'none', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--slate-900)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--slate-500)'}>
          <ArrowLeft size={18} /> Retour au Portail Central
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', zIndex: 1 }}>
        
        <div className="premium-card" style={{ width: '100%', maxWidth: '420px', padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Icon */}
          <div style={{ width: '72px', height: '72px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-grad-end)', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.05)' }}>
            <ShieldAlert size={36} strokeWidth={2.5} />
          </div>
          
          <h1 className="font-outfit" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Zone <span className="text-gradient-emerald">Sécurisée</span>
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
            Connectez-vous avec vos identifiants personnels d'agent pour accéder à l'espace de gestion.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {error && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.875rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <ShieldAlert size={16} /> {error}
              </div>
            )}

            {/* Champ Identifiant */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                Identifiant Agent
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Ex: jean.kouame"
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-soft)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  disabled={isSubmitting}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{
                  padding: '1.125rem 1.25rem',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-soft)',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  letterSpacing: '0.2em'
                }}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-modern bg-gradient-emerald"
              style={{
                width: '100%',
                padding: '1.125rem',
                color: 'white',
                fontSize: '1.05rem',
                borderRadius: '12px',
                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authentification...' : 'Déverrouiller le Bureau'}
            </button>
          </form>
          
        </div>
      </main>
      
    </div>
  );
}
