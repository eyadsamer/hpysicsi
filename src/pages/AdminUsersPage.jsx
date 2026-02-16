import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Page, sectionTitle, inputStyle, btnPrimary, btnOutline } from './AdminDashboard';
import { Shield, ShieldOff, UserX, UserCheck, Search, RefreshCw } from 'lucide-react';

const STATUS = {
  active:  { bg: '#10B98120', color: '#10B981', label: 'Active' },
  banned:  { bg: '#EF444420', color: '#EF4444', label: 'Banned' },
  pending: { bg: '#F59E0B20', color: '#F59E0B', label: 'Pending' },
};

export default function AdminUsersPage() {
  const { profile: me } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchUsers();
    const ch = supabase.channel('users-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []); // eslint-disable-line

  useEffect(() => {
    let list = [...users];
    if (filter !== 'all') list = list.filter(u => u.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [users, search, filter]);

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function setStatus(id, status) {
    await supabase.from('profiles').update({ status }).eq('id', id);
    notify(`User ${status}`);
  }

  async function toggleAdmin(id, val) {
    await supabase.from('profiles').update({ is_admin: val }).eq('id', id);
    notify(val ? 'Admin granted' : 'Admin revoked');
  }

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const thStyle = { color: '#9CA3AF', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #374151' };
  const tdStyle = { padding: '14px 16px', borderBottom: '1px solid #1F2937', verticalAlign: 'middle' };

  return (
    <Page title="User Management" subtitle={`${users.length} registered accounts`}
      action={<button onClick={fetchUsers} style={{ ...btnOutline, display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={15} /> Refresh</button>}>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#6D28D9', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: 'bold', zIndex: 100, boxShadow: '0 8px 32px rgba(109,40,217,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'active', 'pending', 'banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ backgroundColor: filter === f ? '#6D28D9' : '#1F2937', color: filter === f ? 'white' : '#9CA3AF', border: `2px solid ${filter === f ? '#6D28D9' : '#374151'}`, borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#1F2937', borderRadius: '20px', overflow: 'hidden', border: '2px solid #374151' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Joined</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ ...tdStyle, color: '#6B7280', textAlign: 'center', padding: '40px' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ ...tdStyle, color: '#6B7280', textAlign: 'center', padding: '40px' }}>No users found.</td></tr>
              ) : filtered.map(u => {
                const isMe = u.id === me?.id;
                const st = STATUS[u.status] || STATUS.active;
                return (
                  <tr key={u.id} style={{ backgroundColor: isMe ? '#6D28D910' : 'transparent' }}>
                    {/* User */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                          {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ margin: 0, color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                            {u.full_name || '—'} {isMe && <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>(you)</span>}
                          </p>
                          <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.8rem' }}>{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: st.bg, color: st.color, fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase' }}>
                        {st.label}
                      </span>
                    </td>
                    {/* Role */}
                    <td style={tdStyle}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: u.is_admin ? '#6D28D9' : '#9CA3AF', fontSize: '0.85rem', fontWeight: '500' }}>
                        {u.is_admin ? <><Shield size={13} /> Admin</> : 'Student'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: '0.85rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {!isMe && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {u.status !== 'banned' ? (
                            <ActionBtn onClick={() => setStatus(u.id, 'banned')} icon={<UserX size={13} />} label="Ban" color="#EF4444" />
                          ) : (
                            <ActionBtn onClick={() => setStatus(u.id, 'active')} icon={<UserCheck size={13} />} label="Unban" color="#10B981" />
                          )}
                          {!u.is_admin ? (
                            <ActionBtn onClick={() => toggleAdmin(u.id, true)} icon={<Shield size={13} />} label="Make Admin" color="#6D28D9" />
                          ) : (
                            <ActionBtn onClick={() => toggleAdmin(u.id, false)} icon={<ShieldOff size={13} />} label="Revoke" color="#9CA3AF" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

function ActionBtn({ onClick, icon, label, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: hov ? color + '20' : 'transparent', color: hov ? color : '#9CA3AF', border: `1px solid ${hov ? color : '#374151'}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', transition: 'all 0.15s' }}>
      {icon}{label}
    </button>
  );
}
