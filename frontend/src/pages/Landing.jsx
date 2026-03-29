import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

const features = [
  { icon: '🧠', title: 'AI Profile Builder', desc: 'Just talk — our AI structures your experience, skills, and achievements automatically.', badge: 'AI-Powered' },
  { icon: '⚡', title: 'Zero Resume Upload', desc: 'No PDFs, no parsing errors. Your profile is clean, structured, and bias-reduced from day one.', badge: 'New Approach' },
  { icon: '🎯', title: 'Smart Matching', desc: 'AI recommends roles based on your actual skills, not keyword stuffing.', badge: 'Intelligent' },
  { icon: '📊', title: 'Recruiter Dashboard', desc: 'Compare candidates side-by-side with structured, standardized profiles.', badge: 'For Teams' },
];

const aiExamples = [
  { user: "I worked at Flipkart for 2 years building the search recommendation engine using Python and Elasticsearch", ai: "Got it! I've structured this as: Sr. ML Engineer at Flipkart (2021–2023), specializing in search & recommendations. Skills: Python, Elasticsearch, ML algorithms. Want to add key achievements?" },
  { user: "I'm good at React and been doing frontend stuff for about 3 years", ai: "React (Advanced, ~3 years) added! Based on your experience, I'd also suggest: TypeScript, Next.js, testing frameworks. Should I add these to your profile?" },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}><span className={styles.logoMark}>✦</span> HireAI</div>
          <div className={styles.headerLinks}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-ai btn-sm">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.grid} />
        </div>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              Powered by Claude AI · No Resume Upload Required
            </div>
            <h1 className={styles.heroTitle}>
              Hiring, Rebuilt<br />
              <span className={styles.heroAccent}>From the Ground Up</span>
            </h1>
            <p className={styles.heroSub}>
              Traditional resumes are broken. HireAI replaces PDF uploads with guided, 
              AI-assisted profile building — structured data, zero bias, instant insights.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/signup?role=candidate" className="btn btn-ai btn-lg">Build My Profile →</Link>
              <Link to="/signup?role=recruiter" className="btn btn-ghost btn-lg">I'm a Recruiter</Link>
            </div>
            <div className={styles.heroStats}>
              {[['0', 'PDF uploads needed'], ['AI', 'powered profile builder'], ['5min', 'to complete profile']].map(([v, l]) => (
                <div key={l} className={styles.heroStat}>
                  <span className={styles.heroStatVal}>{v}</span>
                  <span className={styles.heroStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Demo Card */}
          <div className={styles.demoCard}>
            <div className={styles.demoHeader}>
              <span className={styles.demoDot} style={{ background: '#FF5A7E' }} />
              <span className={styles.demoDot} style={{ background: '#FFB547' }} />
              <span className={styles.demoDot} style={{ background: '#00E5A0' }} />
              <span className={styles.demoTitle}>HireAI Profile Builder</span>
            </div>
            {aiExamples.map((ex, i) => (
              <div key={i} className={styles.chatExample} style={{ animationDelay: `${i * 0.3}s` }}>
                <div className={styles.chatUser}>
                  <div className={styles.chatAvatar}>U</div>
                  <div className={styles.chatBubbleUser}>{ex.user}</div>
                </div>
                <div className={styles.chatAi}>
                  <div className={styles.chatAiIcon}>✦</div>
                  <div className={styles.chatBubbleAi}>{ex.ai}</div>
                </div>
              </div>
            ))}
            <div className={styles.demoInput}>
              <span className={styles.demoInputText}>Tell me about yourself...</span>
              <span className={styles.demoInputCursor} />
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className={styles.compare}>
        <div className="container">
          <div className={styles.compareGrid}>
            <div className={`${styles.compareCard} ${styles.bad}`}>
              <div className={styles.compareIcon}>📄</div>
              <h3 className={styles.compareTitle}>Traditional Hiring</h3>
              <ul className={styles.compareList}>
                {['Upload PDF resume', 'Inconsistent parsing errors', 'Bias from formatting', 'Missing data = rejection', 'Hours wasted formatting'].map(i => (
                  <li key={i} className={styles.compareItem}><span>✕</span> {i}</li>
                ))}
              </ul>
            </div>
            <div className={styles.compareVs}>VS</div>
            <div className={`${styles.compareCard} ${styles.good}`}>
              <div className={styles.compareIcon}>✦</div>
              <h3 className={styles.compareTitle}>HireAI Approach</h3>
              <ul className={styles.compareList}>
                {['AI-guided profile creation', 'Structured, parseable data', 'Standardized for fairness', 'Completeness score tracking', 'Done in under 5 minutes'].map(i => (
                  <li key={i} className={styles.compareItem}><span>✓</span> {i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="ai-badge">Core Features</span>
            <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} className={`${styles.featureCard} card`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <span className={`ai-badge ${styles.featureBadge}`}>{f.badge}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} />
            <span className="ai-badge">Get Started Free</span>
            <h2 className={styles.ctaTitle}>Ready to replace the resume?</h2>
            <p className={styles.ctaSub}>Join the future of hiring. No credit card. No PDF uploads. Just smart profiles.</p>
            <div className={styles.ctaBtns}>
              <Link to="/signup?role=candidate" className="btn btn-ai btn-lg">Build My Profile →</Link>
              <Link to="/signup?role=recruiter" className="btn btn-ghost btn-lg">Recruiter Access</Link>
            </div>
            <p className={styles.demoNote}>Demo candidate login: <code>hire-me@anshumat.org</code> / <code>HireMe@2025!</code></p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <p>✦ HireAI — AI-Powered Recruitment Platform · Built for the Internship Assignment</p>
        </div>
      </footer>
    </div>
  );
}
