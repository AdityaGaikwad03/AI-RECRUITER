import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateById, toggleShortlist, getShortlist } from '../api';
import styles from './CandidateProfile.module.css';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    Promise.all([getCandidateById(id), getShortlist()]).then(([c, s]) => {
      setCandidate(c.data);
      setIsShortlisted(s.data.some(x => x.id === parseInt(id)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleShortlist = async () => {
    setActionLoading(true);
    const { data } = await toggleShortlist(id);
    setIsShortlisted(data.shortlisted);
    setActionLoading(false);
  };

  const handleConfirm = () => { setConfirmed(true); setTimeout(() => setConfirmed(false), 3000); };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;
  if (!candidate) return <div className={styles.notFound}><h2>Candidate not found</h2><button onClick={() => navigate('/recruiter')} className="btn btn-primary">← Back to Dashboard</button></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <button onClick={() => navigate('/recruiter')} className="btn btn-ghost btn-sm">← All Candidates</button>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          {/* Hero */}
          <div className={styles.heroCard} style={{ borderColor: (candidate.avatar_color || '#4F7CFF') + '44', background: `linear-gradient(135deg, ${candidate.avatar_color || '#4F7CFF'}11, transparent)` }}>
            <div className={styles.heroLeft}>
              <div className={styles.avatar} style={{ background: candidate.avatar_color || '#4F7CFF' }}>
                {candidate.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className={styles.name}>{candidate.name}</h1>
                <p className={styles.headline}>{candidate.headline}</p>
                <div className={styles.metaRow}>
                  {candidate.location && <span className={styles.metaTag}>📍 {candidate.location}</span>}
                  <span className={styles.metaTag} style={{ color: candidate.availability === 'Immediate' ? 'var(--ai)' : 'var(--gold)' }}>⚡ {candidate.availability}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.scoreBox}>
                <div className={styles.scoreNum}>{candidate.completion}%</div>
                <div className={styles.scoreLabel}>Profile Complete</div>
                <div className="progress-bar" style={{ marginTop: 8, width: 100 }}><div className="progress-fill" style={{ width: `${candidate.completion}%` }} /></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {candidate.summary && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>About</h2>
              <p className={styles.summary}>{candidate.summary}</p>
            </div>
          )}

          {/* Experience */}
          {candidate.experience?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>Experience</h2>
              {candidate.experience.map((e, i) => (
                <div key={i} className={styles.expItem}>
                  <div className={styles.expDot} style={{ background: candidate.avatar_color || 'var(--primary)' }} />
                  <div className={styles.expBody}>
                    <div className={styles.expHeader}>
                      <div>
                        <h3 className={styles.expRole}>{e.role}</h3>
                        <p className={styles.expCompany}>{e.company} · {e.duration}</p>
                      </div>
                    </div>
                    <p className={styles.expDesc}>{e.description}</p>
                    {e.key_achievements?.length > 0 && <ul className={styles.achievements}>{e.key_achievements.map((a,ai) => <li key={ai}>🏆 {a}</li>)}</ul>}
                    {e.skills_used?.length > 0 && <div className={styles.tagRow}>{e.skills_used.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {candidate.projects?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>Projects</h2>
              <div className={styles.projectGrid}>
                {candidate.projects.map((p, i) => (
                  <div key={i} className={styles.projectCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.projectName}>{p.name}</h3>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className={styles.projectLink}>↗</a>}
                    </div>
                    <p className={styles.projectDesc}>{p.description}</p>
                    <div className={styles.tagRow}>{(Array.isArray(p.tech) ? p.tech : []).map(t => <span key={t} className="skill-tag">{t}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sideCol}>
          {/* Actions */}
          <div className={`card ${styles.actionCard}`}>
            <h3 className={styles.actionTitle}>Recruiter Actions</h3>
            <button onClick={handleShortlist} disabled={actionLoading} className={`btn ${isShortlisted ? 'btn-danger' : 'btn-ai'}`} style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
              {actionLoading ? '...' : isShortlisted ? '★ Remove from Shortlist' : '☆ Add to Shortlist'}
            </button>
            <button onClick={handleConfirm} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
              {confirmed ? '✓ Invitation Sent!' : '📧 Send Interview Invite'}
            </button>
            <button onClick={() => navigate('/recruiter')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              ← Back to Dashboard
            </button>
            {confirmed && <p style={{ fontSize: 12, color: 'var(--ai)', textAlign: 'center', marginTop: 8 }}>Action recorded! (demo)</p>}
          </div>

          {/* Skills */}
          {candidate.skills?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>Skills</h2>
              {candidate.skills.map((s, i) => (
                <div key={i} className={styles.skillItem}>
                  <div className={styles.skillMeta}>
                    <span className={styles.skillName}>{s.name}</span>
                    <span className={styles.skillLevel}>{s.level}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${['Beginner','Intermediate','Advanced','Expert'].indexOf(s.level) * 30 + 15}%` }} /></div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>Education</h2>
              {candidate.education.map((e, i) => (
                <div key={i} className={styles.eduItem}>
                  <p className={styles.eduDegree}>{e.degree}</p>
                  <p className={styles.eduInstitute}>{e.institute}</p>
                  <p className={styles.eduYear}>{e.year}{e.grade ? ` · ${e.grade}` : ''}</p>
                </div>
              ))}
            </div>
          )}

          {/* Target Roles */}
          {candidate.desired_roles?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className={styles.secTitle}>Open To</h2>
              <div className={styles.tagRow}>{candidate.desired_roles.map(r => <span key={r} className="skill-tag" style={{ color: 'var(--ai)', borderColor: 'rgba(0,229,160,0.3)' }}>{r}</span>)}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
