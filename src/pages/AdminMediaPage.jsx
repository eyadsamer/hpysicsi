import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Page, sectionTitle, inputStyle, btnPrimary } from './AdminDashboard';
import { Upload, Trash2, Link, Check, Video, Image, FileText, File } from 'lucide-react';

const TYPE_COLOR = {
  video:    '#8B5CF6',
  image:    '#06B6D4',
  document: '#10B981',
  other:    '#6B7280',
};

export default function AdminMediaPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.is_admin === true;

  const [media, setMedia] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', url: '', type: 'video', description: '', session_id: '' });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAll();
    const ch = supabase.channel('media-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, fetchAll)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []); // eslint-disable-line

  async function fetchAll() {
    const [mRes, sRes] = await Promise.all([
      supabase.from('media').select('*, sessions(title), profiles(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('sessions').select('id, title').eq('is_extra', false).order('position'),
    ]);
    setMedia(mRes.data || []);
    setSessions(sRes.data || []);
    setLoading(false);
  }

  async function upload() {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      await supabase.from('media').insert({
        title: form.title, url: form.url, type: form.type,
        description: form.description, session_id: form.session_id || null,
        uploaded_by: profile.id,
      });
      setForm({ title: '', url: '', type: 'video', description: '', session_id: '' });
      notify('Media uploaded!');
    } finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm('Delete this media?')) return;
    await supabase.from('media').delete().eq('id', id);
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const TypeIcon = ({ type }) => {
    const props = { size: 18, color: TYPE_COLOR[type] || TYPE_COLOR.other };
    if (type === 'video') return <Video {...props} />;
    if (type === 'image') return <Image {...props} />;
    if (type === 'document') return <FileText {...props} />;
    return <File {...props} />;
  };

  return (
    <Page title="Media Library" subtitle={`${media.length} file${media.length !== 1 ? 's' : ''} uploaded`}>
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#6D28D9', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: 'bold', zIndex: 100, boxShadow: '0 8px 32px rgba(109,40,217,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Upload form — admin only */}
      {isAdmin && (
        <div style={{ backgroundColor: '#1F2937', border: '2px solid #6D28D9', borderRadius: '20px', padding: '28px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Upload size={18} color="#6D28D9" />
            <h2 style={sectionTitle}>Upload Media</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <input style={inputStyle} placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
              <option value="other">Other</option>
            </select>
            <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="URL / link to file *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input style={inputStyle} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <select style={inputStyle} value={form.session_id} onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}>
              <option value="">— Attach to session (optional) —</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <button onClick={upload} disabled={saving || !form.title.trim() || !form.url.trim()}
            style={{ ...btnPrimary, marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', opacity: (saving || !form.title.trim() || !form.url.trim()) ? 0.5 : 1 }}>
            <Upload size={16} /> {saving ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ color: '#6B7280' }}>Loading…</p>
      ) : media.length === 0 ? (
        <div style={{ backgroundColor: '#1F2937', border: '2px dashed #374151', borderRadius: '20px', padding: '60px', textAlign: 'center', color: '#6B7280' }}>
          <Upload size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>No media yet.{isAdmin && ' Upload your first file above.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {media.map(m => (
            <div key={m.id} style={{ backgroundColor: '#1F2937', border: '2px solid #374151', borderRadius: '20px', padding: '20px', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6D28D9'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#374151'}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ backgroundColor: (TYPE_COLOR[m.type] || TYPE_COLOR.other) + '20', padding: '10px', borderRadius: '12px' }}>
                  <TypeIcon type={m.type} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => copyLink(m.url)} title="Copy link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                    {copied === m.url ? <Check size={16} color="#10B981" /> : <Link size={16} />}
                  </button>
                  {isAdmin && (
                    <button onClick={() => del(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{ color: 'white', fontWeight: '500', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
              {m.description && <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description}</p>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>{m.sessions?.title || 'No session'}</span>
                <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
