'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        // Redirection forcée vers login en nettoyant le cache
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.6rem 1.2rem', 
        backgroundColor: '#fee2e2', 
        color: '#ef4444', 
        border: '1px solid #fecaca', 
        borderRadius: '10px', 
        fontWeight: 700, 
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#fecaca';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#fee2e2';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <LogOut size={16} />
      Se déconnecter
    </button>
  );
}
