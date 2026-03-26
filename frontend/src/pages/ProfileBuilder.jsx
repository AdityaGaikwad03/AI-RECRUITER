import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateProfile, aiSuggestSkills, aiParseExperience, aiGenerateSummary, aiRecommendRoles } from '../api';
import { useAuth } from '../context/AuthContext';
import AIChat from '../components/AIChat';
import styles from './ProfileBuilder.module.css';

const SECTIONS = [
  { id: 'basics', label: 'Basic Info', icon: '👤' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'summary', label: 'Summary', icon: '✨' },
];

const COLORS = ['#4F7CFF', '#00E5A0', '#FF5A7E', '#FFB547', '#B47AFF', '#FF8C47'];

export default function ProfileBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('basics');
  const [profile, setProfile] = useState({
    name: user?.name || '', headline: '', summary: '', location: '',
    avatar_color: '#4F7CFF', skills: [], experience: [], projects: [],
    education: [], desired_roles: [], availability: 'Open to opportunities',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [recommendedRoles, setRecommendedRoles] = useState([]);
  const [expText, setExpText] = useState('');
  const [parsingExp, setParsingExp] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });
  const [newProject, setNewProject] = useState({ name: '', description: '', tech: '', link: '' });
  const [newEdu, setNewEdu] = useState({ degree: '', institute: '', year: '', grade: '' });
  const [roleInput, setRoleInput] = useState("");

  useEffect(() => {
    getMyProfile().then(({ data }) => {
      if (data) setProfile(p => ({ ...p, ...data }));
    }).catch(() => {});
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => saveProfile(true), 2000);
    return () => clearTimeout(t);
  }, [profile]);

  const saveProfile = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      await updateProfile(profile);
      if (!silent) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch {} finally { if (!silent) setSaving(false); }
  };

  const up = (field) => (e) => setProfile(p => ({ ...p, [field]: e.target.value }));

  // Skills
  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setProfile(p => ({ ...p, skills: [...p.skills, { name: newSkill.name, level: newSkill.level, endorsed: 0 }] }));
    setNewSkill({ name: '', level: 'Intermediate' });
  };
  const removeSkill = (i) => setProfile(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));
  const addSuggestedSkill = (s) => {
    if (!profile.skills.find(sk => sk.name === s.name)) {
      setProfile(p => ({ ...p, skills: [...p.skills, { name: s.name, level: s.relevance === 'high' ? 'Intermediate' : 'Beginner', endorsed: 0 }] }));
    }
    setSuggestedSkills(prev => prev.filter(sk => sk.name !== s.name));
  };

  const fetchSkillSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiSuggestSkills(profile.desired_roles?.[0] || 'developer', profile.skills.map(s => s.name));
      setSuggestedSkills(data.suggestions || []);
    } catch {} finally { setAiLoading(false); }
  };

  // Experience
  const parseExperience = async () => {
    if (!expText.trim()) return;
    setParsingExp(true);
    try {
      const { data } = await aiParseExperience(expText);
      if (data.structured) {
        setProfile(p => ({ ...p, experience: [...p.experience, data.structured] }));
        setExpText('');
      }
    } catch {} finally { setParsingExp(false); }
  };
  const removeExp = (i) => setProfile(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  // Projects
  const addProject = () => {
    if (!newProject.name.trim()) return;
    setProfile(p => ({ ...p, projects: [...p.projects, { ...newProject, tech: newProject.tech.split(',').map(t => t.trim()).filter(Boolean) }] }));
    setNewProject({ name: '', description: '', tech: '', link: '' });
  };
  const removeProject = (i) => setProfile(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));

  // Education
  const addEdu = () => {
    if (!newEdu.degree.trim()) return;
    setProfile(p => ({ ...p, education: [...p.education, newEdu] }));
    setNewEdu({ degree: '', institute: '', year: '', grade: '' });
  };
  const removeEdu = (i) => setProfile(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  // Summary
  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiGenerateSummary({ name: profile.name, skills: profile.skills, experience: profile.experience, desired_roles: profile.desired_roles });
      setProfile(p => ({ ...p, summary: data.summary }));
    } catch {} finally { setAiLoading(false); }
  };

  const fetchRoleRecs = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiRecommendRoles({ skills: profile.skills, experience: profile.experience });
      setRecommendedRoles(data.roles || []);
    } catch {} finally { setAiLoading(false); }
  };

  const addRole = (role) => {
    if (!profile.desired_roles.includes(role)) setProfile(p => ({ ...p, desired_roles: [...p.desired_roles, role] }));
  };
  const removeRole = (r) => setProfile(p => ({ ...p, desired_roles: p.desired_roles.filter(x => x !== r) }));

  // Completion
  const completion = (() => {
    let s = 0;
    if (profile.name) s += 10; if (profile.headline) s += 10; if (profile.summary) s += 15;
    if (profile.skills?.length > 0) s += 20; if (profile.experience?.length > 0) s += 20;
    if (profile.projects?.length > 0) s += 15; if (profile.education?.length > 0) s += 10;
    return s;
  })();

  const sectionIdx = SECTIONS.findIndex(s => s.id === active);

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.profileCard}>
          <div className={styles.avatarCircle} style={{ background: profile.avatar_color }}>
            {profile.name?.[0]?.toUpperCase() || '?'}
          </div>
          <p className={styles.profileName}>{profile.name || 'Your Name'}</p>
          <p className={styles.profileHeadline}>{profile.headline || 'Add your headline'}</p>
          <div className={styles.completionWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className={styles.completionLabel}>Profile Completion</span>
              <span className={styles.completionPct}>{completion}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>

        <nav className={styles.nav}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={`${styles.navBtn} ${active === s.id ? styles.navActive : ''}`}>
              <span className={styles.navIcon}>{s.icon}</span>
              <span>{s.label}</span>
              {s.id === 'skills' && profile.skills.length > 0 && <span className={styles.navCount}>{profile.skills.length}</span>}
              {s.id === 'experience' && profile.experience.length > 0 && <span className={styles.navCount}>{profile.experience.length}</span>}
              {s.id === 'projects' && profile.projects.length > 0 && <span className={styles.navCount}>{profile.projects.length}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sideActions}>
          <button onClick={() => saveProfile()} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
          <button onClick={() => navigate('/preview')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginTop: 8 }}>
            Preview Profile →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Section header */}
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{SECTIONS.find(s => s.id === active)?.icon} {SECTIONS.find(s => s.id === active)?.label}</h2>
              <p className={styles.sectionSub}>Auto-saved as you type · <span style={{ color: 'var(--ai)' }}>Smart-assisted</span></p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {sectionIdx > 0 && <button onClick={() => setActive(SECTIONS[sectionIdx - 1].id)} className="btn btn-ghost btn-sm">← Prev</button>}
              {sectionIdx < SECTIONS.length - 1 && <button onClick={() => setActive(SECTIONS[sectionIdx + 1].id)} className="btn btn-primary btn-sm">Next →</button>}
            </div>
          </div>

          {/* ── BASICS ── */}
          {active === 'basics' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.field}>
                  <label className="label">Full Name *</label>
                  <input className="input" value={profile.name} onChange={up('name')} placeholder="Your full name" />
                </div>
                <div className={styles.field}>
                  <label className="label">Professional Headline</label>
                  <input className="input" value={profile.headline} onChange={up('headline')} placeholder="e.g. Full Stack Developer | React & Node.js" />
                </div>
                <div className={styles.field}>
                  <label className="label">Location</label>
                  <input className="input" value={profile.location} onChange={up('location')} placeholder="City, Country" />
                </div>
                <div className={styles.field}>
                  <label className="label">Availability</label>
                  <select className="input" value={profile.availability} onChange={up('availability')}>
                    {['Immediate', 'Within 1 month', 'Within 3 months', 'Open to opportunities', 'Not looking'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className="label">Profile Color</label>
                  <div className={styles.colorPicker}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setProfile(p => ({ ...p, avatar_color: c }))} className={`${styles.colorDot} ${profile.avatar_color === c ? styles.colorActive : ''}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className="label">Target Roles</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    {profile.desired_roles.map(r => (
                      <span key={r} className="skill-tag">{r} <button onClick={() => removeRole(r)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 0 0 4px', fontSize: 13 }}>×</button></span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={roleInput} onChange={e => setRoleInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && roleInput.trim()) { addRole(roleInput.trim()); setRoleInput(''); } }} placeholder="Add target role, press Enter" />
                    <button onClick={fetchRoleRecs} disabled={aiLoading} className="btn btn-ai btn-sm">Smart Suggest</button>
                  </div>
                  {recommendedRoles.length > 0 && (
                    <div className={styles.aiSuggestions}>
                      <p className={styles.suggestLabel}><span className="ai-badge">AI Recommended</span></p>
                      {recommendedRoles.map(r => (
                        <button key={r.role} onClick={() => addRole(r.role)} className={styles.suggestItem}>
                          <span>{r.role}</span>
                          <span className={styles.matchScore} style={{ color: r.match > 80 ? 'var(--ai)' : 'var(--gold)' }}>{r.match}% match</span>
                          <span className={styles.matchReason}>{r.reason}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          {active === 'skills' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.existingList}>
                  {profile.skills.length === 0 && <p className={styles.emptyHint}>No skills yet. Add some below or use smart suggestions →</p>}
                  {profile.skills.map((s, i) => (
                    <div key={i} className={styles.skillRow}>
                      <div className={styles.skillInfo}>
                        <span className={styles.skillName}>{s.name}</span>
                        <select className={styles.levelSelect} value={s.level} onChange={e => setProfile(p => ({ ...p, skills: p.skills.map((sk, idx) => idx === i ? { ...sk, level: e.target.value } : sk) }))}>
                          {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className={styles.skillBar}>
                        <div className={styles.skillFill} style={{ width: `${['Beginner','Intermediate','Advanced','Expert'].indexOf(s.level) * 33 + 15}%` }} />
                      </div>
                      <button onClick={() => removeSkill(i)} className={styles.removeBtn}>×</button>
                    </div>
                  ))}
                </div>
                <div className={styles.addRow}>
                  <input className="input" value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Skill name (e.g. React, Python)" style={{ flex: 1 }} />
                  <select className="input" value={newSkill.level} onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))} style={{ width: 140 }}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={addSkill} className="btn btn-primary btn-sm">Add</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={fetchSkillSuggestions} disabled={aiLoading} className="btn btn-ai btn-sm">
                    {aiLoading ? '...' : '✦ Smart Suggest Skills'}
                  </button>
                </div>
                {suggestedSkills.length > 0 && (
                  <div className={styles.smartSuggestions}>
                    <p className={styles.suggestLabel}><span className="smart-badge">Smart Suggestions</span> · Click to add</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {suggestedSkills.map(s => (
                        <button key={s.name} onClick={() => addSuggestedSkill(s)} className={`${styles.suggestPill} ${s.relevance === 'high' ? styles.pillHigh : ''}`}>
                          + {s.name} <span className={styles.pillCat}>{s.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.chatCol}>
                <AIChat step="skills" context={{ skills: profile.skills, desired_roles: profile.desired_roles }} userName={profile.name} onExtracted={(data) => { if (data.skill) setNewSkill(p => ({ ...p, name: data.skill })); }} />
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {active === 'experience' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.smartInputBox}>
                  <label className="label"><span className="smart-badge">Smart Parse</span> Describe experience naturally</label>
                  <textarea className="input input-smart" value={expText} onChange={e => setExpText(e.target.value)} placeholder={'e.g. "I worked at Amazon for 2 years as a backend engineer building microservices with Node.js and AWS. I led a team of 4 and improved API response time by 40%."'} rows={4} style={{ resize: 'none' }} />
                  <button onClick={parseExperience} disabled={parsingExp || !expText.trim()} className="btn btn-ai" style={{ marginTop: 10 }}>
                    {parsingExp ? '✦ Parsing...' : '✦ Smart Structure This'}
                  </button>
                </div>
                <div className={styles.existingList} style={{ marginTop: 20 }}>
                  {profile.experience.length === 0 && <p className={styles.emptyHint}>No experience added. Describe it above and let Smart Assistant structure it!</p>}
                  {profile.experience.map((e, i) => (
                    <div key={i} className={styles.expCard}>
                      <div className={styles.expHeader}>
                        <div>
                          <p className={styles.expRole}>{e.role}</p>
                          <p className={styles.expCompany}>{e.company} · {e.duration}</p>
                        </div>
                        <button onClick={() => removeExp(i)} className="btn btn-danger btn-sm">Remove</button>
                      </div>
                      <p className={styles.expDesc}>{e.description}</p>
                      {e.skills_used?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {e.skills_used.map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                      )}
                      {e.key_achievements?.length > 0 && (
                        <ul style={{ marginTop: 10, paddingLeft: 16 }}>
                          {e.key_achievements.map((a, ai) => <li key={ai} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>🏆 {a}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.chatCol}>
                <AIChat step="experience" context={{ experience: profile.experience }} userName={profile.name} />
              </div>
            </div>
          )}

          {/* ── PROJECTS ── */}
          {active === 'projects' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.existingList}>
                  {profile.projects.length === 0 && <p className={styles.emptyHint}>No projects yet. Add your best work!</p>}
                  {profile.projects.map((p, i) => (
                    <div key={i} className={styles.expCard}>
                      <div className={styles.expHeader}>
                        <div>
                          <p className={styles.expRole}>{p.name}</p>
                          {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--ai)' }}>↗ {p.link}</a>}
                        </div>
                        <button onClick={() => removeProject(i)} className="btn btn-danger btn-sm">Remove</button>
                      </div>
                      <p className={styles.expDesc}>{p.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {(Array.isArray(p.tech) ? p.tech : []).map(t => <span key={t} className="skill-tag">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.addCard}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add Project</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} placeholder="Project name" />
                    <textarea className="input" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} placeholder="What did you build? What problem did it solve?" rows={3} style={{ resize: 'none' }} />
                    <input className="input" value={newProject.tech} onChange={e => setNewProject(p => ({ ...p, tech: e.target.value }))} placeholder="Tech stack (comma-separated): React, Node.js, AWS" />
                    <input className="input" value={newProject.link} onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))} placeholder="GitHub / Live URL (optional)" />
                    <button onClick={addProject} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Project</button>
                  </div>
                </div>
              </div>
              <div className={styles.chatCol}>
                <AIChat step="projects" context={{ projects: profile.projects }} userName={profile.name} />
              </div>
            </div>
          )}

          {/* ── EDUCATION ── */}
          {active === 'education' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.existingList}>
                  {profile.education.length === 0 && <p className={styles.emptyHint}>No education added yet.</p>}
                  {profile.education.map((e, i) => (
                    <div key={i} className={styles.expCard}>
                      <div className={styles.expHeader}>
                        <div>
                          <p className={styles.expRole}>{e.degree}</p>
                          <p className={styles.expCompany}>{e.institute} · {e.year}</p>
                          {e.grade && <p style={{ fontSize: 12, color: 'var(--ai)', marginTop: 2 }}>Grade: {e.grade}</p>}
                        </div>
                        <button onClick={() => removeEdu(i)} className="btn btn-danger btn-sm">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.addCard}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add Education</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))} placeholder="Degree / Certificate" />
                    <input className="input" value={newEdu.institute} onChange={e => setNewEdu(p => ({ ...p, institute: e.target.value }))} placeholder="Institution name" />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input className="input" value={newEdu.year} onChange={e => setNewEdu(p => ({ ...p, year: e.target.value }))} placeholder="Graduation year" />
                      <input className="input" value={newEdu.grade} onChange={e => setNewEdu(p => ({ ...p, grade: e.target.value }))} placeholder="Grade / GPA (optional)" />
                    </div>
                    <button onClick={addEdu} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Education</button>
                  </div>
                </div>
              </div>
              <div className={styles.chatCol}>
                <AIChat step="education" context={{ education: profile.education }} userName={profile.name} />
              </div>
            </div>
          )}

          {/* ── SUMMARY ── */}
          {active === 'summary' && (
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <div className={styles.aiInputBox}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label className="label">Professional Summary</label>
                    <button onClick={generateSummary} disabled={aiLoading} className="btn btn-ai btn-sm">
                      {aiLoading ? '✦ Generating...' : '✦ Generate with AI'}
                    </button>
                  </div>
                  <textarea className="input input-ai" value={profile.summary} onChange={up('summary')} placeholder="AI will generate this based on your profile, or write your own..." rows={6} style={{ resize: 'none' }} />
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>✦ Smart summary generation based on your skills, experience, and target roles</p>
                </div>
                <div className={styles.addCard} style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Profile Complete?</h4>
                  <div className="progress-bar" style={{ marginBottom: 10 }}><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{completion}% complete · {completion >= 60 ? '✓ Ready to be discovered by recruiters' : 'Add more sections to improve visibility'}</p>
                  <button onClick={() => navigate('/preview')} className="btn btn-primary">View My Profile →</button>
                </div>
              </div>
              <div className={styles.chatCol}>
                <AIChat step="summary" context={{ name: profile.name, skills: profile.skills, experience: profile.experience, desired_roles: profile.desired_roles }} userName={profile.name} onExtracted={(d) => { if (d.summary) setProfile(p => ({ ...p, summary: d.summary })); }} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
