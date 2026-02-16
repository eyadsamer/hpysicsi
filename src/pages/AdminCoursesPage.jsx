import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Page, sectionTitle, inputStyle, btnPrimary, btnOutline } from './AdminDashboard';
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminCoursesPage() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.is_admin === true;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '' });
  const [showLessonFor, setShowLessonFor] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*, lessons(id, title, position, content)')
      .order('created_at', { ascending: false });
    setCourses((data || []).map(c => ({ ...c, lessons: (c.lessons || []).sort((a, b) => a.position - b.position) })));
    setLoading(false);
  }

  async function createCourse() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await supabase.from('courses').insert({ title: form.title, description: form.description });
      setForm({ title: '', description: '' });
      setShowForm(false);
      fetchCourses();
    } finally { setSaving(false); }
  }

  async function createLesson(courseId, count) {
    if (!lessonForm.title.trim()) return;
    setSaving(true);
    try {
      await supabase.from('lessons').insert({ course_id: courseId, title: lessonForm.title, content: lessonForm.content, position: count });
      setLessonForm({ title: '', content: '' });
      setShowLessonFor(null);
      fetchCourses();
    } finally { setSaving(false); }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course and all its lessons?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchCourses();
  }

  async function deleteLesson(id) {
    await supabase.from('lessons').delete().eq('id', id);
    fetchCourses();
  }

  const cardStyle = { backgroundColor: '#1F2937', border: '2px solid #374151', borderRadius: '20px', overflow: 'hidden', transition: 'border-color 0.2s', marginBottom: '14px' };

  return (
    <Page title="Courses" subtitle={`${courses.length} course${courses.length !== 1 ? 's' : ''}`}
      action={isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> New Course
        </button>
      )}>

      {/* Create form */}
      {showForm && isAdmin && (
        <div style={{ backgroundColor: '#1F2937', border: '2px solid #6D28D9', borderRadius: '20px', padding: '28px', marginBottom: '28px' }}>
          <h3 style={sectionTitle}>New Course</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={inputStyle} placeholder="Course title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={createCourse} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Creating…' : 'Create'}</button>
              <button onClick={() => setShowForm(false)} style={btnOutline}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#6B7280' }}>Loading…</p> : courses.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px', border: '2px dashed #374151' }}>
          <BookOpen size={36} style={{ color: '#374151', marginBottom: '12px' }} />
          <p style={{ color: '#6B7280' }}>No courses yet.{isAdmin && ' Create one above.'}</p>
        </div>
      ) : courses.map(course => (
        <div key={course.id} style={cardStyle}>
          {/* Header row */}
          <div onClick={() => setExpanded(expanded === course.id ? null : course.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.parentElement.style.borderColor = '#6D28D9'}
            onMouseLeave={e => e.currentTarget.parentElement.style.borderColor = '#374151'}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: 'white', fontWeight: '600', fontSize: '1rem' }}>{course.title}</p>
              {course.description && <p style={{ margin: '4px 0 0', color: '#9CA3AF', fontSize: '0.85rem' }}>{course.description}</p>}
              <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.8rem' }}>{course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); deleteCourse(course.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                  <Trash2 size={16} />
                </button>
              )}
              {expanded === course.id ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
            </div>
          </div>

          {/* Lessons */}
          {expanded === course.id && (
            <div style={{ borderTop: '1px solid #374151', padding: '20px 24px' }}>
              {course.lessons.length === 0
                ? <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '16px' }}>No lessons yet.</p>
                : (
                  <div style={{ marginBottom: '16px' }}>
                    {course.lessons.map((lesson, i) => (
                      <div key={lesson.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1F2937' }}
                        onMouseEnter={e => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}>
                        <span style={{ color: '#6B7280', fontSize: '0.8rem', width: '24px', textAlign: 'right' }}>{i + 1}.</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, color: '#D1D5DB', fontSize: '0.9rem' }}>{lesson.title}</p>
                          {lesson.content && <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.content}</p>}
                        </div>
                        {isAdmin && (
                          <button className="del-btn" onClick={() => deleteLesson(lesson.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', opacity: 0, transition: 'opacity 0.2s', padding: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }

              {isAdmin && (
                showLessonFor === course.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid #374151' }}>
                    <input style={inputStyle} placeholder="Lesson title *" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
                    <input style={inputStyle} placeholder="Content / notes" value={lessonForm.content} onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => createLesson(course.id, course.lessons.length)} disabled={saving}
                        style={{ ...btnPrimary, padding: '10px 20px', fontSize: '0.85rem', opacity: saving ? 0.6 : 1 }}>
                        {saving ? 'Adding…' : 'Add Lesson'}
                      </button>
                      <button onClick={() => setShowLessonFor(null)} style={{ ...btnOutline, padding: '8px 16px', fontSize: '0.85rem' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowLessonFor(course.id); setLessonForm({ title: '', content: '' }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D28D9', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8B5CF6'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6D28D9'}>
                    <Plus size={14} /> Add lesson
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </Page>
  );
}
