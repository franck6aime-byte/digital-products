'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  Folder as FolderIcon, 
  ExternalLink, 
  Download,
  Lock,
  ArrowLeft
} from 'lucide-react';

type Folder = { id: string; name: string; createdAt: string };
type FileDoc = { id: string; name: string; size: number; url: string; mimeType: string; createdAt: string; uploader?: { fullName: string } };

export default function ServiceConsultPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [serviceName, setServiceName] = useState('Chargement...');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lecteur de document
  const [viewerUrl, setViewerUrl] = useState<{url: string, name: string} | null>(null);
  
  // States de navigation et données (Read-Only)
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Accueil' }
  ]);

  useEffect(() => {
    const fetchServiceInfo = async () => {
      try {
        const res = await fetch(`/api/services/${serviceId}`);
        if (res.ok) {
           const data = await res.json();
           setServiceName(data.name);
        } else {
           setServiceName('Service Administratif');
        }
      } catch (err) {
        setServiceName('Service Administratif');
      }
    };
    if (serviceId) fetchServiceInfo();
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) fetchContent(currentFolder?.id || null);
  }, [currentFolder, serviceId]);

  const fetchContent = async (folderId: string | null) => {
    const urlFolders = `/api/services/${serviceId}/folders${folderId ? `?folderId=${folderId}` : ''}`;
    const urlFiles = `/api/services/${serviceId}/files${folderId ? `?folderId=${folderId}` : ''}`;
    try {
      const [fRes, docsRes] = await Promise.all([fetch(urlFolders), fetch(urlFiles)]);
      if (fRes.ok) setFolders(await fRes.json());
      if (docsRes.ok) setFiles(await docsRes.json());
    } catch (e) {
      console.error("Erreur de chargement", e);
    }
  };

  const openFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const navigateBreadcrumb = (index: number) => {
    const selected = breadcrumbs[index];
    setCurrentFolder(selected.id ? { id: selected.id, name: selected.name, createdAt: '' } : null);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* 1. CRYSTAL HEADER */}
      <header className="chariow-header">
        <div className="chariow-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div style={{ padding: '0.4rem', border: '2px solid var(--slate-100)', borderRadius: '10px' }}>
            <ArrowLeft size={18} />
          </div>
          <span>PORTAIL PUBLIC</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => router.push(`/service/${serviceId}/admin/login`)}
            style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--slate-900)', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Lock size={14} /> Accès Agent
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION CENTRÉE (CHARIOW STYLE) */}
      <section className="chariow-hero">
        <div className="chariow-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
          <ShieldCheck size={14} /> Documentation Officielle
        </div>
        <h1 className="font-outfit" style={{ fontSize: '3rem' }}>Bureau <span className="text-gradient-blue" style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>Consultatif</span></h1>
        <p>Explorez les documents publics mis à disposition par le {serviceName}. Trouvez rapidement l'information dont vous avez besoin.</p>

        {/* Search Bar - Chariow Style */}
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un dossier ou un acte..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '1rem 1.5rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid var(--slate-100)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </section>

      {/* 3. EXPLORATEUR DE DOCUMENTS */}
      <main style={{ padding: '2rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => navigateBreadcrumb(idx)} 
                style={{ background: 'none', color: idx === breadcrumbs.length - 1 ? 'var(--slate-900)' : 'var(--slate-500)', fontWeight: idx === breadcrumbs.length - 1 ? 800 : 500, fontSize: '0.9rem', cursor: 'pointer', padding: '0.4rem' }}
              >
                {crumb.name}
              </button>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={14} color="#cbd5e1" />}
            </div>
          ))}
        </div>

        {/* Folders */}
        {filteredFolders.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08rem', marginBottom: '1.5rem' }}>Dossiers thématiques</h3>
            <div className="chariow-card-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', padding: '0' }}>
              {filteredFolders.map(folder => (
                <div key={folder.id} className="chariow-folder-card" onClick={() => openFolder(folder)} style={{ padding: '1.25rem' }}>
                  <div className="chariow-folder-icon" style={{ backgroundColor: '#f1f5f9', width: '50px', height: '50px' }}>
                    <FolderIcon size={24} color="#64748b" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>{folder.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Consulter le dossier</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Table */}
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08rem', marginBottom: '1rem' }}>Documents disponibles</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="chariow-file-table">
            <thead>
              <tr>
                <th>Fichier</th>
                <th>Taille</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.id} className="chariow-file-row">
                  <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      📄
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>{file.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Publié le {new Date(file.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--slate-500)', fontWeight: 600, fontSize: '0.85rem' }}>{formatSize(file.size)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => setViewerUrl({url: file.url, name: file.name})} className="chariow-chip" style={{ padding: '0.4rem 0.75rem', borderRadius: '10px' }}>
                        <ExternalLink size={14} /> Lire
                      </button>
                      <a href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`} className="chariow-chip" style={{ padding: '0.4rem 0.75rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }}>
                        <Download size={14} /> Télécharger
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--slate-500)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Désolé, aucun document public n'est disponible ici.</p>
          </div>
        )}
      </main>

      {/* LECTEUR LÉGER */}
      {viewerUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ padding: '1rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'white', fontWeight: 700, margin: 0 }}>Visionneuse Officielle - {viewerUrl.name}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a 
                href={`/api/download?url=${encodeURIComponent(viewerUrl.url)}&name=${encodeURIComponent(viewerUrl.name)}`}
                style={{ padding: '0.6rem 1.2rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <Download size={16} /> Télécharger
              </a>
              <button 
                onClick={() => setViewerUrl(null)} 
                style={{ padding: '0.6rem 1.5rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 700 }}
              >
                Fermer le document ✖
              </button>
            </div>
          </div>
          <div style={{ flex: 1, padding: '1rem 3rem 3rem' }}>
            <iframe 
               src={['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(viewerUrl.name.split('.').pop()?.toLowerCase() || '') 
                ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewerUrl.url)}` 
                : viewerUrl.url} 
               style={{ width: '100%', height: '100%', borderRadius: '20px', border: 'none', backgroundColor: 'white' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
