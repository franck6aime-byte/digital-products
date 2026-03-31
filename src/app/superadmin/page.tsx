'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Building, ArrowLeft, Plus, Settings } from 'lucide-react';

type User = {
  id: string;
  identifiant: string;
  fullName: string;
  role: string;
  createdAt: string;
  service?: { id: string; name: string } | null;
};

type Service = {
  id: string;
  name: string;
};

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agents' | 'services'>('agents');

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Modal State
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [agentFormData, setAgentFormData] = useState({
    identifiant: '',
    fullName: '',
    password: '',
    role: 'AGENT',
    serviceId: '',
  });

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({ name: '', adminPassword: '' });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, servicesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/services'),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const isEditing = !!editingUserId;
      const url = '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { ...agentFormData, id: editingUserId } : agentFormData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAgentModalOpen(false);
        setEditingUserId(null);
        setAgentFormData({ identifiant: '', fullName: '', password: '', role: 'AGENT', serviceId: '' });
        fetchData();
      } else {
        setFormError(data.error || 'Erreur lors de l\'opération');
      }
    } catch (err) {
      setFormError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAgent = (user: User) => {
    setFormError('');
    setEditingUserId(user.id);
    setAgentFormData({
      identifiant: user.identifiant,
      fullName: user.fullName,
      password: '', // On laisse vide pour ne pas modifier si non rempli
      role: user.role,
      serviceId: user.service?.id || '',
    });
    setIsAgentModalOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const isEditing = !!editingServiceId;
      const url = isEditing ? `/api/services/${editingServiceId}` : '/api/services';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceFormData),
      });

      const data = await res.json();
      if (res.ok) {
        setIsServiceModalOpen(false);
        setServiceFormData({ name: '', adminPassword: '' });
        setEditingServiceId(null);
        fetchData();
      } else {
        setFormError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setFormError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--slate-900)' }}>
      
      {/* Sidebar - Espace Super-Admin */}
      <div style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#10b981' }}>
              <Shield size={24} />
            </div>
            <h2 className="font-outfit" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Plateforme</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Centre de Contrôle</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('agents')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', textAlign: 'left', padding: '1rem', 
              backgroundColor: activeTab === 'agents' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              color: activeTab === 'agents' ? 'white' : '#94a3b8', 
              border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'agents' ? 'inset 2px 0 0 0 #10b981' : 'none'
            }}
            onMouseOver={(e) => { if (activeTab !== 'agents') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseOut={(e) => { if (activeTab !== 'agents') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Users size={20} /> Comptes Agents
          </button>
          
          <button 
            onClick={() => setActiveTab('services')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', textAlign: 'left', padding: '1rem', 
              backgroundColor: activeTab === 'services' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              color: activeTab === 'services' ? 'white' : '#94a3b8', 
              border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === 'services' ? 'inset 2px 0 0 0 #10b981' : 'none'
            }}
            onMouseOver={(e) => { if (activeTab !== 'services') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseOut={(e) => { if (activeTab !== 'services') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Building size={20} /> Services Administratifs
          </button>
        </nav>
        
        <div style={{ padding: '2rem' }}>
          <a href="/portal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'background 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
             onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
            <ArrowLeft size={16} /> Quitter le Centre
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '4rem', overflowY: 'auto' }}>
        
        {/* ======================= VUE : AGENTS ======================= */}
        {activeTab === 'agents' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <h1 className="font-outfit" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                  Comptes <span className="text-gradient-emerald">Agents</span>
                </h1>
                <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Gestion centrale des identités et accès de la plateforme.</p>
              </div>
              <button 
                onClick={() => { setFormError(''); setIsAgentModalOpen(true); }}
                className="btn-modern bg-gradient-emerald"
                style={{ color: 'white', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
              >
                <Plus size={18} /> Nouvel Agent
              </button>
            </div>

            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--slate-500)', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Agent</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--slate-500)', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Identifiant</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--slate-500)', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Niveau d'Accès</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--slate-500)', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Service Assigné</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--slate-500)', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>Synchronisation système en cours...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>Aucun agent enregistré dans la base de données.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            {user.fullName}
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', color: 'var(--slate-500)', fontWeight: 500 }}>{user.identifiant}</td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <span style={{ 
                            backgroundColor: user.role === 'SUPER_ADMIN' ? '#fee2e2' : user.role === 'ADMIN_SERVICE' ? '#fef3c7' : '#e0f2fe', 
                            color: user.role === 'SUPER_ADMIN' ? '#ef4444' : user.role === 'ADMIN_SERVICE' ? '#d97706' : '#0284c7', 
                            padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' 
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', color: 'var(--slate-500)', fontSize: '0.95rem', fontWeight: 500 }}>
                           {user.service ? (
                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--slate-100)', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                               <Building size={14} /> {user.service.name}
                             </span>
                           ) : <span style={{ color: '#cbd5e1' }}>Non Rattaché</span>}
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <button 
                             onClick={() => handleEditAgent(user)}
                             style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                          >
                            <Settings size={16} /> Modifier
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= VUE : SERVICES ======================= */}
        {activeTab === 'services' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <h1 className="font-outfit" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                  Direction & <span className="text-gradient-emerald">Services</span>
                </h1>
                <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Structure administrative des départements autorisés.</p>
              </div>
              <button 
                onClick={() => { setFormError(''); setEditingServiceId(null); setServiceFormData({ name: '', adminPassword: '' }); setIsServiceModalOpen(true); }}
                className="btn-modern bg-gradient-emerald"
                style={{ color: 'white', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
              >
                <Plus size={18} /> Nouveau Service
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {loading ? (
                <div style={{ padding: '4rem', color: 'var(--slate-500)' }}>Synchronisation système en cours...</div>
              ) : (
                services.map(service => (
                  <div key={service.id} className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Building size={28} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="font-outfit" style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '1.25rem', lineHeight: 1.2 }}>{service.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Actif</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                      <button 
                        onClick={() => { 
                          setFormError(''); 
                          setEditingServiceId(service.id); 
                          setServiceFormData({ name: service.name, adminPassword: '' }); 
                          setIsServiceModalOpen(true); 
                        }}
                        style={{ width: '100%', fontSize: '0.9rem', color: 'var(--slate-500)', backgroundColor: 'var(--slate-100)', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--slate-100)'; e.currentTarget.style.color = 'var(--slate-500)'; }}
                      >
                        <Shield size={16} /> Configurer l'Accès Admin
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================= MODAL : AJOUTER AGENT ======================= */}
        {isAgentModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div className="premium-card" style={{ padding: '3rem', width: '100%', maxWidth: '550px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><Users size={24} /></div>
                <h2 className="font-outfit" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>{editingUserId ? 'Modifier le Profil' : 'Nouvel Agent'}</h2>
              </div>
              
              {formError && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16}/> {formError}
                </div>
              )}

              <form onSubmit={handleAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Nom Complet</label>
                  <input type="text" className="form-input" value={agentFormData.fullName} onChange={e => setAgentFormData({...agentFormData, fullName: e.target.value})} required placeholder="Ex: Kouamé Jean" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Identifiant</label>
                    <input type="text" className="form-input" value={agentFormData.identifiant} onChange={e => setAgentFormData({...agentFormData, identifiant: e.target.value})} required placeholder="Ex: jean.k" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Mot de passe {editingUserId ? '(Optionnel)' : ''}</label>
                    <input type="password" className="form-input" value={agentFormData.password} onChange={e => setAgentFormData({...agentFormData, password: e.target.value})} required={!editingUserId} placeholder={editingUserId ? "Laisser vide si inchangé" : "••••••••"} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Rôle / Droits</label>
                    <select className="form-input" value={agentFormData.role} onChange={e => setAgentFormData({...agentFormData, role: e.target.value})} style={{ cursor: 'pointer' }}>
                      <option value="AGENT">Consultation Simple</option>
                      <option value="ADMIN_SERVICE">Responsable Service</option>
                      <option value="SUPER_ADMIN">Super Administrateur</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Service d'Affections</label>
                    <select className="form-input" value={agentFormData.serviceId} onChange={e => setAgentFormData({...agentFormData, serviceId: e.target.value})} style={{ cursor: 'pointer' }}>
                      <option value="">-- Mode Global --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => { setIsAgentModalOpen(false); setEditingUserId(null); setAgentFormData({ identifiant: '', fullName: '', password: '', role: 'AGENT', serviceId: '' }); }} style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--slate-100)', color: 'var(--slate-800)', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-gradient-emerald" style={{ flex: 1, padding: '1rem', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                    {isSubmitting ? 'Opération...' : editingUserId ? 'Enregistrer les Changements' : 'Créer le Dossier Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================= MODAL : AJOUTER SERVICE ======================= */}
        {isServiceModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div className="premium-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><Building size={24} /></div>
                <h2 className="font-outfit" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.2 }}>{editingServiceId ? 'Configuration Service' : 'Nouveau Département'}</h2>
              </div>
              
              {formError && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16}/> {formError}
                </div>
              )}

              <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Intitulé Officiel</label>
                  <input type="text" className="form-input" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} required placeholder="Ex: RESSOURCES HUMAINES" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Mot de passe d'administration (Optionnel)</label>
                  <input type="password" className="form-input" value={serviceFormData.adminPassword} onChange={e => setServiceFormData({...serviceFormData, adminPassword: e.target.value})} placeholder="Requis pour l'accès Chef de Service" />
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>Laissez vide si vous ne souhaitez pas modifier le mot de passe existant.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => { setIsServiceModalOpen(false); setEditingServiceId(null); }} style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--slate-100)', color: 'var(--slate-800)', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Fermer
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-gradient-emerald" style={{ flex: 1, padding: '1rem', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                    {isSubmitting ? 'Mise à jour...' : 'Valider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
