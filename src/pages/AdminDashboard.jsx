import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Users, Video, ListChecks, BookOpen, TrendingUp } from 'lucide-react';

const card = (accent = '#6D28D9') => ({
  backgroundColor: '#1F2937',
  border: `2px solid ${accent}`,
  borderRadius: '20px',
  padding: '28px 24px',
});

export default function AdminDashboard() {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, sessions: 0, media: 0, completions: 0 });
  const [recentMedia, setRecentMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const channel = supabase.channel('admin-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_progress' }, fetchStats)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line

  async function fetchStats() {
    const [usersR, sessR, mediaR, compR, recentR] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('is_extra', false),
      supabase.from('media').select('id', { count: 'exact', head: true }),
      supabase.from('session_progress').select('id', { count: 'exact', head: true }).eq('completed', true),
      supabase.from('media').select('id, title, type, created_at, sessions(title)').order('created_at', { ascending: false }).limit(6),
    ]);
    setStats({ users: usersR.count ?? 0, sessions: sessR.count ?? 0, media: mediaR.count ?? 0, completions: compR.count ?? 0 });
    setRecentMedia(recentR.data || []);
    setLoading(false);
  }

  const typeColor = { video: '#8B5CF6', image: '#06B6D4', document: '#10B981', other: '#6B7280' };

  return (
    <Page title="Admin Dashboard" subtitle={`Welcome back, ${profile?.full_name || profile?.email || 'Admin'}`}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Total Users" value={loading ? '…' : stats.users} accent="#6D28D9" icon={<Users size={20} />} />
        <StatCard label="Sessions" value={loading ? '…' : stats.sessions} accent="#10B981" icon={<ListChecks size={20} />} />
        <StatCard label="Media Files" value={loading ? '…' : stats.media} accent="#8B5CF6" icon={<Video size={20} />} />
        <StatCard label="Completions" value={loading ? '…' : stats.completions} accent="#F59E0B" icon={<TrendingUp size={20} />} />
      </div>

      {/* Recent uploads */}
      <div style={card()}>
        <h2 style={sectionTitle}>Recent Uploads</h2>
        {recentMedia.length === 0 ? (
          <p style={{ color: '#6B7280', padding: '32px 0', textAlign: 'center' }}>No media uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentMedia.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #374151' }}>
                <span style={{ backgroundColor: typeColor[m.type] + '20', color: typeColor[m.type], fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase', minWidth: '60px', textAlign: 'center' }}>
                  {m.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                  {m.sessions?.title && <p style={{ color: '#6B7280', margin: '2px 0 0', fontSize: '0.8rem' }}>{m.sessions.title}</p>}
                </div>
                <span style={{ color: '#6B7280', fontSize: '0.8rem', flexShrink: 0 }}>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{ backgroundColor: '#1F2937', border: `2px solid ${accent}`, borderRadius: '20px', padding: '28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>{label}</p>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <p style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: '2.8rem', color: accent, margin: 0 }}>{value}</p>
    </div>
  );
}

export function Page({ title, subtitle, children, action }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontStyle: 'italic', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#6D28D9', margin: '0 0 4px', textTransform: 'uppercase' }}>
              {title}
            </h1>
            {subtitle && <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.95rem' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

export const sectionTitle = {
  fontFamily: 'Impact, Arial Black, sans-serif',
  fontSize: '1.3rem',
  color: 'white',
  margin: '0 0 20px',
  textTransform: 'uppercase',
};

export const inputStyle = {
  backgroundColor: '#111827',
  border: '2px solid #374151',
  borderRadius: '12px',
  padding: '12px 16px',
  color: 'white',
  fontSize: '0.95rem',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

export const btnPrimary = {
  backgroundColor: '#6D28D9',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export const btnOutline = {
  backgroundColor: 'transparent',
  color: '#6D28D9',
  border: '2px solid #6D28D9',
  borderRadius: '12px',
  padding: '10px 20px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};
