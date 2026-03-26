import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../api';
import styles from './ProfilePreview.module.css';

export default function ProfilePreview() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile().then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  const shareUrl = window.location.origin + '/preview';

  if (!profile) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button onClick={() => navigate('/builder')} className="btn btn-ghost btn-sm">← Edit Profile</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Profile link copied!'); }} className="btn btn-ghost btn-sm">🔗 Share Link</button>
          <button onClick={() => window.print()} className="btn btn-primary btn-sm">↓ Export PDF</button>
        </div>
      </div>

      <div className={styles.profilePage}>
        {/* Header */}
        <div className={styles.header} style={{ background: `linear-gradient(135deg, ${profile.avatar_color}22, transparent)`, borderColor: profile.avatar_color + '44' }}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar} style={{ background: profile.avatar_color }}>
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className={styles.name}>{profile.name}</h1>
              <p className={styles.headline}>{profile.headline}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {profile.location && <span className={styles.metaTag}>📍 {profile.location}</span>}
                {profile.availability && <span className={styles.metaTag} style={{ color: 'var(--ai)', borderColor: 'rgba(0,229,160,0.3)', background: 'var(--ai-dim)' }}>⚡ {profile.availability}</span>}
              </div>
            </div>
          </div>
          <div className={styles.completion}>
            <div className={styles.completionRing}>
              <svg viewBox="0 0 60 60" className={styles.ring}>
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" strokeWidth="4" />
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--ai)" strokeWidth="4" strokeDasharray={`${profile.completion * 1.63} 163`} strokeLinecap="round" transform="rotate(-90 30 30)" />
              </svg>
              <span className={styles.ringPct}>{profile.completion}%</span>
            </div>
            <p className={styles.completionLabel}>Profile Complete</p>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.mainCol}>
            {/* Summary */}
            {profile.summary && (
              <section className={styles.section}>
                <h2 className={styles.secTitle}>About</h2>
                <p className={styles.summary}>{profile.summary}</p>
              </section>
            )}

            {/* Experience */}
            {profile.experience?.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.secTitle}>Experience</h2>
                {profile.experience.map((e, i) => (
                  <div key={i} className={styles.expItem}>
                    <div className={styles.expDot} style={{ background: profile.avatar_color }} />
                    <div className={styles.expContent}>
                      <div className={styles.expHeader}>
                        <div>
                          <h3 className={styles.expRole}>{e.role}</h3>
                          <p className={styles.expCompany}>{e.company}</p>
                        </div>
                        <span className={styles.expDuration}>{e.duration}</span>
                      </div>
                      <p className={styles.expDesc}>{e.description}</p>
                      {e.key_achievements?.length > 0 && (
                        <ul className={styles.achievements}>{e.key_achievements.map((a,ai) => <li key={ai}>🏆 {a}</li>)}</ul>
                      )}
                      {e.skills_used?.length > 0 && (
                        <div className={styles.tagRow}>{e.skills_used.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.secTitle}>Projects</h2>
                <div className={styles.projectGrid}>
                  {profile.projects.map((p, i) => (
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
              </section>
            )}
          </div>

          <aside className={styles.sideCol}>
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <section className={styles.sideSection}>
                <h2 className={styles.secTitle}>Skills</h2>
                {profile.skills.map((s, i) => (
                  <div key={i} className={styles.skillItem}>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillName}>{s.name}</span>
                      <span className={styles.skillLevel}>{s.level}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${['Beginner','Intermediate','Advanced','Expert'].indexOf(s.level) * 30 + 15}%` }} />
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <section className={styles.sideSection}>
                <h2 className={styles.secTitle}>Education</h2>
                {profile.education.map((e, i) => (
                  <div key={i} className={styles.eduItem}>
                    <p className={styles.eduDegree}>{e.degree}</p>
                    <p className={styles.eduInstitute}>{e.institute}</p>
                    <p className={styles.eduYear}>{e.year}{e.grade ? ` · ${e.grade}` : ''}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Target Roles */}
            {profile.desired_roles?.length > 0 && (
              <section className={styles.sideSection}>
                <h2 className={styles.secTitle}>Open To</h2>
                <div className={styles.tagRow}>{profile.desired_roles.map(r => <span key={r} className="skill-tag" style={{ color: 'var(--ai)', borderColor: 'rgba(0,229,160,0.3)' }}>{r}</span>)}</div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
