'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import Quill for Rich Text Editing
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any;

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

// --- ICON COMPONENTS (Lucide SVG Direct for maximum reliability) ---
const IconFolderPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
);
const IconUploadCloud = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const IconFileEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconLogOut = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconEyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
);
const IconMaximize = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
);
const IconDownload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

type Folder = { id: string; name: string; createdAt: string; isHidden?: boolean };
type FileDoc = { id: string; name: string; size: number; url: string; mimeType: string; createdAt: string; isHidden?: boolean; uploader?: { fullName: string } };

export default function WorkspaceAdminPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Accueil' }
  ]);
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actContent, setActContent] = useState('');
  const [viewerUrl, setViewerUrl] = useState<{url: string, name: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ identifiant: '', oldPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (serviceId) fetchContent(currentFolder?.id || null);
  }, [currentFolder, serviceId]);

  const handleSecureLogout = async () => {
    try {
      await fetch('/api/auth/service/logout', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ serviceId }) });
      window.location.href = `/service/${serviceId}/consult`;
    } catch { window.location.href = `/service/${serviceId}/consult`; }
  };

  const fetchContent = async (folderId: string | null) => {
    if (!serviceId) return;
    try {
      const [fRes, dRes] = await Promise.all([
        fetch(`/api/services/${serviceId}/folders?adminView=true${folderId ? `&folderId=${folderId}` : ''}`),
        fetch(`/api/services/${serviceId}/files?adminView=true${folderId ? `&folderId=${folderId}` : ''}`)
      ]);
      if (fRes.ok) setFolders((await fRes.json()) || []);
      if (dRes.ok) setFiles((await dRes.json()) || []);
    } catch (e) { console.error(e); }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    if (!confirm(`Souhaitez-vous supprimer définitivement '${name}' ?\nCette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/services/${serviceId}/files/${id}`, { method: 'DELETE' });
        if (res.ok) fetchContent(currentFolder?.id || null);
        else { 
          if (res.status === 401) window.location.href = `/service/${serviceId}/admin/login`;
          else alert('🔐 Action refusée : Droits insuffisants ou verrou actif.'); 
        }
    } catch { alert('Erreur réseau'); }
  };

  const handleDeleteFolder = async (e: any, id: string, name: string) => {
    if (e) e.stopPropagation();
    if (!confirm(`Supprimer le dossier '${name}' et tout son contenu ?`)) return;
    try {
       const res = await fetch(`/api/services/${serviceId}/folders/${id}`, { method: 'DELETE' });
       if (res.ok) fetchContent(currentFolder?.id || null);
       else { 
         if (res.status === 401) window.location.href = `/service/${serviceId}/admin/login`;
         else alert('🔐 Action refusée : Droits insuffisants ou verrou actif.'); 
       }
    } catch { alert('Erreur réseau'); }
  };

  const handleToggleVisibility = async (type: 'file' | 'folder', item: any) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/${type === 'file' ? 'files' : 'folders'}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !item.isHidden })
      });
      if (res.ok) fetchContent(currentFolder?.id || null);
    } catch { alert('Erreur réseau'); }
  };

  const navigateBreadcrumb = (index: number) => {
    const selected = breadcrumbs[index];
    setCurrentFolder(selected.id ? { id: selected.id, name: selected.name, createdAt: '' } : null);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const s = (searchTerm || '').toLowerCase();
  const filteredFiles = (files || []).filter(f => f?.name?.toLowerCase().includes(s));
  const filteredFolders = (folders || []).filter(f => f?.name?.toLowerCase().includes(s));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfdfd', color: '#0f172a' }}>
      
      {/* HEADER PREMIUM */}
      <header className="chariow-header">
        <div className="chariow-logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ backgroundColor: 'var(--emerald-grad-start)', color: 'white', padding: '0.45rem', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)' }}>
             <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L19 8.1v7.8l-7 3.9-7-3.9V8.1l7-3.92z"/></svg>
          </div>
          <span>GCA ADMINISTRATIF</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
            <span style={{ height: '8px', width: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span> ACCÈS RESTREINT DR-MCNSLP
          </div>
          <button onClick={() => setIsPasswordModalOpen(true)} className="chariow-chip" style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '0.6rem 1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
            <IconSettings /> Sécurité
          </button>
          <button onClick={handleSecureLogout} className="chariow-chip" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem'}}>
            <IconLogOut /> Quitter l'espace
          </button>
        </div>
      </header>

      {/* HERO PREMIUM */}
      <section className="chariow-hero">
        <div className="chariow-badge">🔐 Environnement de gestion habilité</div>
        <h1 className="font-outfit" style={{ fontSize: '3.6rem' }}>Bureau <span className="text-gradient-emerald">Numérique</span></h1>
        <p style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 500 }}>Centralisez, archivez et rédigez vos documents officiels avec une sécurité renforcée par double-verrouillage.</p>

        <div className="chariow-actions-container">
          <button className="chariow-chip" onClick={() => setIsFolderModalOpen(true)}>
            <div className="chariow-chip-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><IconFolderPlus /></div> 
            Nouveau Dossier
          </button>
          
          <label className="chariow-chip" style={{ cursor: 'pointer' }}>
            <div className="chariow-chip-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><IconUploadCloud /></div>
            {isUploading ? 'Chargement...' : 'Importer Document'}
            <input type="file" ref={fileInputRef} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append('file', file);
                    if (currentFolder?.id) formData.append('folderId', currentFolder.id);
                    fetch(`/api/services/${serviceId}/files`, { method: 'POST', body: formData })
                      .then(async r => { 
                         if (r.ok) return fetchContent(currentFolder?.id || null); 
                         const errData = await r.json().catch(() => ({}));
                         if (r.status === 401) {
                            alert('🔐 Session expirée. Re-connexion requise.');
                            window.location.href = `/service/${serviceId}/admin/login`;
                         } else {
                            alert(`❌ Échec : ${errData.error || 'Erreur technique inconnue.'}`);
                         }
                      })
                      .finally(() => { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value = ''; });
                }
            }} style={{ display: 'none' }} disabled={isUploading} />
          </label>

          <button className="chariow-chip" onClick={() => setIsActModalOpen(true)}>
            <div className="chariow-chip-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}><IconFileEdit /></div> 
            Rédiger un Acte
          </button>
        </div>
      </section>

      {/* EXPLORER AREA */}
      <main style={{ padding: '2rem 3rem', maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Navigation & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {breadcrumbs.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                   onClick={() => navigateBreadcrumb(idx)} 
                   style={{ background: 'none', border: 'none', color: idx === breadcrumbs.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: idx === breadcrumbs.length - 1 ? 800 : 600, cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s' }}
                   className={idx < breadcrumbs.length - 1 ? "breadcrumb-hover" : ""}
                >
                    {c.name}
                </button>
                {idx < breadcrumbs.length - 1 && <span style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 2px' }}>/</span>}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
             <input 
                type="text" 
                placeholder="Chercher un document..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', outline: 'none', width: '280px', fontSize: '0.9rem', fontStyle: 'Inter' }} 
             />
             <div style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             </div>
          </div>
        </div>

        {/* --- SECTION DOSSIERS --- */}
        {filteredFolders.length > 0 && (
           <div style={{ marginBottom: '4rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '4px', height: '18px', background: 'var(--emerald-grad-start)', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Repertoires</h2>
             </div>
             
             <div className="chariow-card-container">
               {filteredFolders.map(f => (
                 <div key={f.id} className="chariow-folder-card" onClick={() => { setCurrentFolder(f); setBreadcrumbs([...breadcrumbs, { id: f.id, name: f.name }]); }}>
                    <div className="chariow-folder-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--emerald-grad-start)" fillOpacity="0.15" stroke="var(--emerald-grad-start)" strokeWidth="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{f.name}</h4>
                       <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', position: 'absolute', top: '1.25rem', right: '1.25rem' }} onClick={e => e.stopPropagation()}>
                       <button onClick={() => handleToggleVisibility('folder', f)} className={`btn-icon-tiny ${f.isHidden ? 'inactive' : 'active'}`} title={f.isHidden ? "Rendre Public" : "Masquer au public"}>
                          {f.isHidden ? <IconEyeOff /> : <IconEye />}
                       </button>
                       <button onClick={(e) => handleDeleteFolder(e, f.id, f.name)} className="btn-icon-tiny text-danger" title="Supprimer"><IconTrash /></button>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* --- SECTION DOCUMENTS --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '4px', height: '18px', background: 'var(--blue-grad-start)', borderRadius: '2px' }}></div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fichiers récents</h2>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <table className="chariow-file-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ paddingLeft: '2rem' }}>Nom du document</th>
                <th>Statut de visibilité</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map(file => (
                  <tr key={file.id} className="chariow-file-row">
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '42px', height: '42px', borderRadius: '12px', background: '#f1f5f9', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
                        }}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 750, color: 'var(--slate-900)', fontSize: '0.95rem' }}>{file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{formatSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                        {file.isHidden ? (
                            <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#fff7ed', color: '#f97316', fontWeight: 800, border: '1px solid #ffedd5' }}>📍 MASQUÉ</span>
                        ) : (
                            <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#ecfdf5', color: '#10b981', fontWeight: 800, border: '1px solid #d1fae5' }}>👁️ PUBLIC</span>
                        )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                      <div style={{ display: 'inline-flex', gap: '0.6rem' }}>
                        <button onClick={() => setViewerUrl({url: file.url, name: file.name})} className="action-button-mini preview" title="Consulter le fichier"><IconMaximize /></button>
                        <button onClick={() => handleToggleVisibility('file', file)} className={`action-button-mini visibility ${file.isHidden ? 'off' : 'on'}`} title={file.isHidden ? "Passer en Public" : "Rendre Masqué"}>
                            {file.isHidden ? <IconEyeOff /> : <IconEye />}
                        </button>
                        <button onClick={() => handleDeleteFile(file.id, file.name)} className="action-button-mini danger" title="Supprimer"><IconTrash /></button>
                        <a href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`} className="action-button-mini primary" title="Télécharger"><IconDownload /></a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucun document dans cet espace.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODALS --- */}
      {isFolderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ padding: '2.5rem', width: '420px', textAlign: 'center' }}>
             <h2 className="font-outfit" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nouveau dossier</h2>
             <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Entrez le nom du répertoire à créer.</p>
             <form onSubmit={e => {
                e.preventDefault();
                if(!newFolderName.trim()) return;
                fetch(`/api/services/${serviceId}/folders`, { 
                   method: 'POST', 
                   headers: {'Content-Type': 'application/json'}, 
                   body: JSON.stringify({ name: newFolderName, parentId: currentFolder?.id || null }) 
                })
                  .then(r => r.ok ? fetchContent(currentFolder?.id || null) : alert('🔐 Action interdite.'))
                  .then(() => { setNewFolderName(''); setIsFolderModalOpen(false); });
             }}>
               <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus placeholder="Ex: Rapports 2026..." style={{ width: '100%', padding: '1.1rem', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '2rem', outline: 'none', textAlign: 'center', fontSize: '1rem', fontWeight: 600 }} />
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsFolderModalOpen(false)} style={{ flex: 1, padding: '1rem', background: '#f1f5f9', borderRadius: '12px', fontWeight: 700 }}>Fermer</button>
                 <button type="submit" className="bg-gradient-emerald" style={{ flex: 1, padding: '1rem', color: 'white', borderRadius: '12px', fontWeight: 700 }}>Créer</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {isActModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="premium-card" style={{ width: '800px', padding: '3rem', maxHeight: '95vh', overflow: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 className="font-outfit" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Rédaction d'Acte</h2>
                <p style={{ color: '#64748b' }}>Espace de rédaction sécurisé - Publication immédiate</p>
            </div>
            <form onSubmit={e => {
                e.preventDefault();
                if (!actTitle.trim() || !actContent.trim()) return;
                setIsUploading(true);
                const html = `<html><body>${actContent}</body></html>`;
                const file = new File([new Blob([html], {type:'text/html'})], `${actTitle}.html`, {type:'text/html'});
                const fd = new FormData(); fd.append('file', file); if(currentFolder?.id) fd.append('folderId', currentFolder.id);
                fetch(`/api/services/${serviceId}/files`, { method: 'POST', body: fd })
                  .then(async r => {
                      if (r.ok) return fetchContent(currentFolder?.id || null);
                      const errData = await r.json().catch(() => ({}));
                      if (r.status === 401) {
                         alert('🔐 Session expirée. Re-connexion requise.');
                         window.location.href = `/service/${serviceId}/admin/login`;
                      } else {
                         alert(`❌ Échec Publication : ${errData.error || 'Erreur technique.'}`);
                      }
                  })
                  .then(() => { setIsActModalOpen(false); setActTitle(''); setActContent(''); })
                  .finally(() => setIsUploading(false));
            }}>
              <input type="text" value={actTitle} onChange={e => setActTitle(e.target.value)} placeholder="Titre de l'acte administratif..." style={{ width: '100%', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '14px', marginBottom: '1.5rem', outline: 'none', fontSize: '1.1rem', fontWeight: 700 }} required />
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'white' }}>
                <ReactQuill theme="snow" value={actContent} onChange={setActContent} modules={quillModules} style={{ height: '350px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2.5rem' }}>
                <button type="button" onClick={() => setIsActModalOpen(false)} style={{ flex: 1, padding: '1.1rem', background: '#f1f5f9', borderRadius: '12px', fontWeight: 700 }}>Annuler</button>
                <button type="submit" disabled={isUploading} className="bg-gradient-emerald" style={{ flex: 2, padding: '1.1rem', color: 'white', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 15px rgba(5, 150, 105, 0.3)' }}>{isUploading ? 'Enregistrement...' : 'Publier au Répertoire'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* VIEWER MODAL */}
       {viewerUrl && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: '#10b981' }}><IconEye /></div>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>Aperçu : {viewerUrl.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href={viewerUrl.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <IconMaximize /> Ouvrir l'original
                </a>
                <a 
                  href={`/api/download?url=${encodeURIComponent(viewerUrl.url)}&name=${encodeURIComponent(viewerUrl.name)}`}
                  style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <IconDownload /> Télécharger
                </a>
                <button onClick={() => setViewerUrl(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)' }}>Fermer l'aperçu</button>
              </div>
            </div>
            <iframe 
               src={['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(viewerUrl.name.split('.').pop()?.toLowerCase() || '') 
                 ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewerUrl.url)}` 
                 : viewerUrl.url} 
               style={{ flex: 1, border: 'none', background: 'white', margin: '0 3rem 3rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} 
            />
         </div>
       )}

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ padding: '2.5rem', width: '450px' }}>
             <h2 className="font-outfit" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>Sécurité Compte</h2>
             <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>Modifier votre mot de passe d'accès agent.</p>
             
             {passwordError && (
               <div style={{ padding: '0.8rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                 {passwordError}
               </div>
             )}

             <form onSubmit={async e => {
                e.preventDefault();
                setIsPasswordSubmitting(true);
                setPasswordError('');
                try {
                  const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...passwordForm, serviceId })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert('✅ Mot de passe modifié avec succès !');
                    setIsPasswordModalOpen(false);
                    setPasswordForm({ identifiant: '', oldPassword: '', newPassword: '' });
                  } else {
                    setPasswordError(data.error || 'Erreur lors du changement.');
                  }
                } catch {
                  setPasswordError('Erreur de connexion serveur.');
                } finally {
                  setIsPasswordSubmitting(false);
                }
             }}>
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>Identifiant Réseau</label>
                 <input type="text" value={passwordForm.identifiant} onChange={e => setPasswordForm({...passwordForm, identifiant: e.target.value})} placeholder="Ex: jean.kouame" style={{ width: '100%', padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }} required />
               </div>
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>Mot de Passe Actuel</label>
                 <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', letterSpacing: '0.1em' }} required />
               </div>
               <div style={{ marginBottom: '2rem' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>Nouveau Mot de Passe</label>
                 <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', letterSpacing: '0.1em' }} required />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={{ flex: 1, padding: '1rem', background: '#f1f5f9', borderRadius: '12px', fontWeight: 700 }}>Annuler</button>
                 <button type="submit" disabled={isPasswordSubmitting} className="bg-gradient-emerald" style={{ flex: 1, padding: '1rem', color: 'white', borderRadius: '12px', fontWeight: 700, opacity: isPasswordSubmitting ? 0.7 : 1 }}>
                   {isPasswordSubmitting ? 'Mise à jour...' : 'Sauvegarder'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* STYLES LOCAUX (Injected via Style JSX concept or standard class reference) */}
      <style jsx>{`
        .btn-icon-tiny {
          background: rgba(255,255,255,0.8);
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 6px;
          color: #64748b;
          transition: all 0.2s;
        }
        .btn-icon-tiny:hover {
          background: white;
          color: var(--emerald-grad-end);
          transform: scale(1.1);
        }
        .text-danger:hover {
          color: #ef4444 !important;
          border-color: #fee2e2 !important;
        }
        .action-button-mini {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          color: #64748b;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .action-button-mini:hover {
          background: white;
          border-color: var(--emerald-grad-end);
          color: var(--emerald-grad-end);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .action-button-mini.danger:hover {
          border-color: #fca5a5;
          color: #ef4444;
        }
        .action-button-mini.primary:hover {
          border-color: transparent;
          background: var(--emerald-grad-start);
          color: white;
        }
        .breadcrumb-hover:hover {
          background-color: #f1f5f9 !important;
          color: var(--emerald-grad-start) !important;
        }
      `}</style>

    </div>
  );
}
