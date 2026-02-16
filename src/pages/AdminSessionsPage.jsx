import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Page, sectionTitle, inputStyle, btnPrimary, btnOutline } from './AdminDashboard';
import { CheckCircle2, Circle, Lock, Sparkles, Trash2, Plus } from 'lucide-react';

export default function AdminSessionsPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.is_admin === true;

  const [sessions, setSessions] = useState([]);
  const [myProgress, setMyProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', is_extra: false, parent_id: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAll();
    const ch = supabase.channel('sessions-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_progress' }, fetchAll)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []); // eslint-disable-line

  async function fetchAll() {
    const [sRes, pRes] = await Promise.all([
      supabase.from('sessions').select('*').order('position'),
      profile?.id
        ? supabase.from('session_progress').select('*').eq('user_id', profile.id)
        : Promise.resolve({ data: [] }),
    ]);
    setSessions(sRes.data || []);
    const map = {};
    for (const p of pRes.data || []) map[p.session_id] = p;
    setMyProgress(map);
    setLoading(false);
  }

  async function toggleComplete(session) {
    if (!profile) return;
    const done = !myProgress[session.id]?.completed;
    await supabase.from('session_progress').upsert(
      { user_id: profile.id, session_id: session.id, completed: done, completed_at: done ? new Date().toISOString() : null },
      { onConflict: 'user_id,session_id' }
    );
    if (done) notify(`✓ "${session.title}" completed!`);
    fetchAll();
  }

  async function createSession() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await supabase.from('sessions').insert({
        title: form.title,
        description: form.description,
        is_extra: form.is_extra,
        parent_id: form.is_extra && form.parent_id ? form.parent_id : null,
        created_by: profile.id,
        position: sessions.length,
      });
      setForm({ title: '', description: '', is_extra: false, parent_id: '' });
      setShowForm(false);
      notify('Session created!');
    } finally { setSaving(false); }
  }

  async function deleteSession(id) {
    if (!confirm('Delete this session?')) return;
    await supabase.from('sessions').delete().eq('id', id);
  }

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const normal = sessions.filter(s => !s.is_extra);
  const extras = sessions.filter(s => s.is_extra);
  const visibleExtras = extras.filter(s => isAdmin || (s.parent_id && myProgress[s.parent_id]?.completed));

  const row = (done) => ({
    backgroundColor: '#1F2937',
    border: `2px solid ${done ? '#10B981' : '#374151'}`,
    borderRadius: '16px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'border-color 0.2s',
  });

  return (
    <Page
      title="Sessions"
      subtitle="Complete sessions to unlock extra content"
      action={isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Session
        </button>
      )}
    >
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#6D28D9', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: 'bold', zIndex: 100, boxShadow: '0 8px 32px rgba(109,40,217,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Create form */}
      {showForm && isAdmin && (
        <div style={{ backgroundColor: '#1F2937', border: '2px solid #6D28D9', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ ...sectionTitle, marginBottom: '20px' }}>New Session</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input style={inputStyle} placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#D1D5DB' }}>
              <div onClick={() => setForm(f => ({ ...f, is_extra: !f.is_extra }))}
                style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: form.is_extra ? '#6D28D9' : '#374151', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transform: form.is_extra ? 'translateX(20px)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              Extra session (unlocks when parent is completed)
            </label>

            {form.is_extra && (
              <select style={inputStyle} value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
                <option value="">— Select parent session —</option>
                {normal.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={createSession} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Creating…' : 'Create'}</button>
              <button onClick={() => setShowForm(false)} style={btnOutline}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Core sessions */}
      <p style={{ color: '#9CA3AF', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Core Sessions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {loading ? <p style={{ color: '#6B7280' }}>Loading…</p> : normal.length === 0 ? (
          <div style={{ ...row(false), justifyContent: 'center', color: '#6B7280' }}>No sessions yet. {isAdmin && 'Add one above.'}</div>
        ) : normal.map(s => {
          const done = myProgress[s.id]?.completed;
          const extraCount = extras.filter(e => e.parent_id === s.id).length;
          return (
            <div key={s.id} style={row(done)}>
              <button onClick={() => toggleComplete(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: done ? '#10B981' : '#6B7280', flexShrink: 0 }}>
                {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: done ? '#9CA3AF' : 'white', fontWeight: '500', textDecoration: done ? 'line-through' : 'none' }}>{s.title}</p>
                {s.description && <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.85rem' }}>{s.description}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {extraCount > 0 && (
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: done ? '#F59E0B' : '#6B7280' }}>
                    {done ? <Sparkles size={13} /> : <Lock size={13} />}
                    {extraCount} extra
                  </span>
                )}
                {isAdmin && (
                  <button onClick={() => deleteSession(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra sessions */}
      <p style={{ color: '#9CA3AF', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={13} color="#F59E0B" /> Extra Sessions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visibleExtras.length === 0 ? (
          <div style={{ backgroundColor: '#1F2937', border: '2px dashed #374151', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#6B7280' }}>
            Complete a core session to unlock extra content.
          </div>
        ) : visibleExtras.map(s => {
          const done = myProgress[s.id]?.completed;
          const parent = normal.find(n => n.id === s.parent_id);
          return (
            <div key={s.id} style={{ ...row(done), borderColor: done ? '#F59E0B' : '#6D28D9', opacity: 1 }}>
              <Sparkles size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  <p style={{ margin: 0, color: done ? '#9CA3AF' : 'white', fontWeight: '500', textDecoration: done ? 'line-through' : 'none' }}>{s.title}</p>
                  <span style={{ backgroundColor: '#F59E0B20', color: '#F59E0B', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>EXTRA</span>
                </div>
                {parent && <p style={{ margin: 0, color: '#6B7280', fontSize: '0.8rem' }}>Unlocked from: {parent.title}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => toggleComplete(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: done ? '#10B981' : '#6B7280' }}>
                  {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                {isAdmin && (
                  <button onClick={() => deleteSession(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
