import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCandidates, toggleShortlist, getShortlist, getRecruiterProfile } from '../api';
import styles from './RecruiterDashboard.module.css';

const AVAILABILITY_OPTS = ['', 'Immediate', 'Within 1 month', 'Within 3 months', 'Open to opportunities'];

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [shortlistIds, setShortlistIds] = useState([]);
  const [recruiter, setRecruiter] = useState(null);
  const [filters, setFilters] = useState({ skill: '', role: '', availability: '' });
  const [view, setView] = useState('all'); // all | shortlist
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    searchCandidates(filters).then(({ data }) => setCandidates(data)).catch(() => {});
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, s, r] = await Promise.all([searchCandidates({}), getShortlist(), getRecruiterProfile()]);
      setCandidates(c.data);
      setShortlisted(s.data);
      setShortlistIds(s.data.map(c => c.id));
      setRecruiter(r.data);
    } catch {} finally { setLoading(false); }
  };

  const handleShortlist = async (candidateId) => {
    await toggleShortlist(candidateId);
    loadData();
  };

  const toggleCompare = (id) => {
    setCompare(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const displayed = view === 'shortlist' ? shortlisted : candidates;
  const filtered = filters.skill || filters.role || filters.availability ? displayed : displayed;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Recruiter Dashboard</h1>
          <p className={styles.subtitle}>{recruiter?.company} · {displayed.length} candidate{displayed.length !== 1 ? 's' : ''} {view === 'shortlist' ? 'shortlisted' : 'found'}</p>
        </div>
        <div className={styles.topRight}>
          {compare.length > 1 && (
            <button onClick={() => navigate(`/recruiter/compare?ids=${compare.join(',')}`)} className="btn btn-ai btn-sm">
              Compare {compare.length} →
            </button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Filters */}
        <aside className={styles.filterSidebar}>
          <div className={styles.viewToggle}>
            <button onClick={() => setView('all')} className={`${styles.viewBtn} ${view === 'all' ? styles.viewActive : ''}`}>All Candidates<span className={styles.badge}>{candidates.length}</span></button>
            <button onClick={() => setView('shortlist')} className={`${styles.viewBtn} ${view === 'shortlist' ? styles.viewActive : ''}`}>Shortlisted<span className={styles.badge} style={{ background: 'var(--ai)', color: '#000' }}>{shortlisted.length}</span></button>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Filter Candidates</h4>
            <div className={styles.filterField}>
              <label className="label">Skill</label>
              <input className="input" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} placeholder="e.g. React, Python..." />
            </div>
            <div className={styles.filterField}>
              <label className="label">Target Role</label>
              <input className="input" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Frontend Developer" />
            </div>
            <div className={styles.filterField}>
              <label className="label">Availability</label>
              <select className="input" value={filters.availability} onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
                {AVAILABILITY_OPTS.map(o => <option key={o} value={o}>{o || 'Any'}</option>)}
              </select>
            </div>
            <button onClick={() => setFilters({ skill: '', role: '', availability: '' })} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>Clear Filters</button>
          </div>

          {compare.length > 0 && (
            <div className={styles.compareBox}>
              <h4 className={styles.filterTitle}>Compare ({compare.length}/3)</h4>
              {compare.map(id => {
                const c = candidates.find(c => c.id === id) || shortlisted.find(c => c.id === id);
                return c ? <div key={id} className={styles.compareItem}><span className={styles.compareAvatar} style={{ background: c.avatar_color || 'var(--primary)' }}>{c.name?.[0]}</span><span className={styles.compareName}>{c.name}</span><button onClick={() => toggleCompare(id)} className={styles.removeCompare}>×</button></div> : null;
              })}
              {compare.length > 1 && <button onClick={() => navigate(`/recruiter/compare?ids=${compare.join(',')}`)} className="btn btn-ai btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>Compare Side-by-Side →</button>}
            </div>
          )}
        </aside>

        {/* Candidates */}
        <div className={styles.candidates}>
          {displayed.length === 0 ? (
            <div className={styles.empty}><span>🔍</span><p>{view === 'shortlist' ? 'No candidates shortlisted yet.' : 'No candidates found matching your filters.'}</p></div>
          ) : (
            <div className={styles.grid}>
              {displayed.map(c => (
                <div key={c.id} className={`${styles.candidateCard} ${shortlistIds.includes(c.id) ? styles.isShortlisted : ''}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardHeader}>
                      <div className={styles.candAvatar} style={{ background: c.avatar_color || '#4F7CFF' }}>{c.name?.[0]?.toUpperCase()}</div>
                      <div className={styles.candInfo}>
                        <h3 className={styles.candName}>{c.name}</h3>
                        <p className={styles.candHeadline}>{c.headline}</p>
                        {c.location && <p className={styles.candLocation}>📍 {c.location}</p>}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button onClick={() => toggleCompare(c.id)} className={`${styles.compareBtn} ${compare.includes(c.id) ? styles.compareBtnActive : ''}`} title="Add to compare">⟺</button>
                      <button onClick={() => handleShortlist(c.id)} className={`${styles.shortlistBtn} ${shortlistIds.includes(c.id) ? styles.shortlistActive : ''}`}>
                        {shortlistIds.includes(c.id) ? '★ Shortlisted' : '☆ Shortlist'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardMid}>
                    <div className={styles.availBadge} style={{ color: c.availability === 'Immediate' ? 'var(--ai)' : 'var(--gold)', borderColor: c.availability === 'Immediate' ? 'rgba(0,229,160,0.3)' : 'rgba(255,181,71,0.3)', background: c.availability === 'Immediate' ? 'var(--ai-dim)' : 'rgba(255,181,71,0.08)' }}>
                      ⚡ {c.availability}
                    </div>
                    <div className={styles.completionBadge}>{c.completion}% complete</div>
                  </div>

                  <div className={styles.skillTags}>
                    {c.skills?.slice(0, 5).map(s => <span key={s.name} className="skill-tag">{s.name}</span>)}
                    {c.skills?.length > 5 && <span className={styles.moreTag}>+{c.skills.length - 5}</span>}
                  </div>

                  {c.desired_roles?.length > 0 && (
                    <p className={styles.roles}>Looking for: {c.desired_roles.slice(0, 2).join(', ')}</p>
                  )}

                  <div className={styles.cardFooter}>
                    <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${c.completion}%` }} /></div>
                    <button onClick={() => navigate(`/recruiter/candidate/${c.id}`)} className="btn btn-primary btn-sm">View Profile →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
